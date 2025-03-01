<script lang="ts"> //ts so i don't go insane
    import Header from "$lib/components/Header.svelte";
    import { onMount } from "svelte";
    import { data, to12HourTime } from "$lib/utils/utils";
    import { create, toDataURL } from "qrcode";
    import { ssrExportAllKey } from "vite/module-runner";
    import { DocumentReference } from "firebase/firestore";

    const dates = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ]

    let calendar = $state(null);
    let weeks = $state([0, 1, 2, 3, 4, 5]);
    const weeklyHours = $state([
        [], [], [], [], [], [], []
    ]);
    let today = $state(new Date());
    today.setMonth(1);
    today.setFullYear(2026);

    function nextMonth() {
        today = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        createCalendar();
    }

    function lastMonth() {
        today = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        createCalendar();
    }

    /**
     * Logic behind building the calendar
     */
    function createCalendar() {
        weeks = [0, 1, 2, 3, 4, 5];

        //get all of our dates we need
        const date = today.getDate();   
        const month = today.getMonth();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        let weekStartDay = monthStart.getDay();
        let monthOffset = monthStart.getDay();

        //set starting days as invalid
        for (let i = 0; i < weekStartDay; i++) {
            const day = calendar.querySelector(`.week-0`).children[i];
            day.className = 'day';
            day.classList.add('invalid-day');
        }

        //loop over all the weeks
        for (let i = 0; i < 6; i++) {
            const week = calendar.querySelector(`.week-${i}`);
            if (!week) {
                break;
            }
            week.style.display = 'grid';

            //loop over all days of the week
            //start from weekStartDay since we set invalid days
            for (let j = weekStartDay; j < 7; j++) {
                const day = week.children[j];
                const dayDate = j - monthOffset + 1 + i * 7;

                day.id = `${month + 1}-${dayDate}-${today.getFullYear()}`;
                day.className = 'day';

                //set the date string
                day.querySelector('.day-header')
                    .innerHTML = `${dayDate}`;

                if (dayDate === date 
                    && month == new Date().getMonth() 
                    && today.getFullYear() == new Date().getFullYear()) {
                    day.classList.add('today');
                }

                //check to make sure the day is valid
                if (dayDate > daysInMonth) {
                    day.classList.add('invalid-day');

                    //crazy edge case. feb is perfectly 4 weeks. happens in 2026 and not again until like 2032
                    if (month == 1 && monthOffset == 0) {
                        calendar.querySelector('.week-4').style.display = 'none';
                    }

                    //check if we need to remove last week
                    //either last day of month is saturday or we had an invalid day week 4
                    if (i == 4 || (i == 5 && j == 0)) {
                        calendar.querySelector('.week-5').style.display = 'none';
                    }
                }
            }

            //reset weekStartDay
            weekStartDay = 0;
        }
    }

    onMount(() => {
        //put data into the appropriate weekly buckets
        //check for exceptions here later
        for (let officeHour of data) {
            const day = officeHour.date[0].toUpperCase() + officeHour.date.slice(1);
            console.log(day);
            const dayIdx = dates.indexOf(day);
            weeklyHours[dayIdx].push(officeHour);
        }

        createCalendar();
    });
</script>

<svelte:head>
    <title>Calendar</title>
    <link rel="stylesheet" href="/style/calendar.css">
</svelte:head>

<!-- define snippet since we don't really need a component here -->
{#snippet calendarOfficeHour(officeHour)}
    <div class="office-hour">
        <div class="office-hour-time">
            {to12HourTime(officeHour.startTime)} 
            - {to12HourTime(officeHour.endTime)}
        </div>
        <div class="office-hour-location">
            {officeHour.location}
        </div>
    </div>
{/snippet}


<Header></Header>
<div class="w-full flex justify-center flex-col items-center">
    <div class="title">
        Calendar
    </div>
    <div class="subtitle">
        Office Hours for {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
    </div>
    <div>
        <button onclick={lastMonth}>Last Month</button>
        <button onclick={nextMonth}>Next Month</button>

    </div>

    <div class="calendar" bind:this={calendar}>
        <div class="calendar-header">
            <div class="day">Sunday</div>
            <div class="day">Monday</div>
            <div class="day">Tuesday</div>
            <div class="day">Wednesday</div>
            <div class="day">Thursday</div>
            <div class="day">Friday</div>
            <div class="day">Saturday</div>
        </div>
        <div class="calendar-body">
            {#each weeks as i}
                <div class="week week-{i}">
                    {#each [0, 1, 2, 3, 4, 5, 6] as j}
                        <div class="day">
                            <div class="day-header">
                                <!-- place day number here-->
                            </div>
                            {#each weeklyHours[j] as officeHour}
                                {@render calendarOfficeHour(officeHour)}
                            {/each}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>