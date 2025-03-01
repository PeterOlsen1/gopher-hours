<script lang="ts"> //ts so i don't go insane
    import Header from "$lib/components/Header.svelte";
    import { onMount } from "svelte";
    import { data, to12HourTime } from "$lib/utils/utils";
    import { page } from "$app/state";
    import { ensureAuth, user } from "$lib/firebase/auth";
    import { getUserData } from "$lib/firebase/db";

    const dates = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ]

    //declare our state variables
    let userData = null;
    let loggedIn = $state(false);
    let calendar = $state(null);
    let weeks = $state([0, 1, 2, 3, 4, 5]);
    let officeHours = $state(page.data.officeHours as any);
    let weeklyHours = $derived.by(() => {
        let temp = [[], [], [], [], [], [], []];

        for (let officeHour of officeHours) {
            const day = officeHour.date[0].toUpperCase() + officeHour.date.slice(1);
            const dayIdx = dates.indexOf(day);
            temp[dayIdx].push(officeHour);
        }

        for (let i = 0; i < 7; i++) {
            temp[i].sort((a, b) => {
                return a.startTime.localeCompare(b.startTime);
            });
        }

        return temp;
    })

    let showFavorites = $state(false);
    let showVirtual = $state(true);

    let today = $state(new Date());

    function handleSearch(e) {
        const search = e.target.value.toLowerCase();
        officeHours = page.data.officeHours.filter(oh => {
            let condition = JSON.stringify(oh).toLowerCase().includes(search);
            condition ||= (oh.department + ' ' + oh.courseNumber).toLowerCase().includes(search);
            return condition;
        });
    }

    function handleVirtual() {
        if (showVirtual) {
            officeHours = page.data.officeHours;
        } else {
            officeHours = page.data.officeHours.filter(oh => {
                let condition = oh.location.toLowerCase().includes('virtual');
                condition ||= oh.location.toLowerCase().includes('zoom');
                condition ||= oh.location.toLowerCase().includes('online');
                return !condition;
            });
        }
    }

    async function handleFavorites() {
        if (!showFavorites) {
            let favorites = userData.favorites;
            officeHours = page.data.officeHours.filter(oh => {
                return favorites.includes(oh.id);
            });
        } else {
            officeHours = page.data.officeHours;
        }
    }

    function nextMonth() {
        today = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        createCalendar();
    }

    function lastMonth() {
        today = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        createCalendar();
    }

    function makeColorLight(officeHour) {
        return `rgba(${officeHour.color[0]}, ${officeHour.color[1]}, ${officeHour.color[2]}, 0.2)`;
    }

    function makeColor(officeHour) {
        return `rgb(${officeHour.color[0]}, ${officeHour.color[1]}, ${officeHour.color[2]})`;
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

    onMount(async () => {
        //put data into the appropriate weekly buckets
        //check for exceptions here later
        // officeHours = data;
        createCalendar();

        await ensureAuth();
        loggedIn = !!user;
        userData = user ? await getUserData(user.uid) : null;
    });
</script>

<svelte:head>
    <title>Calendar</title>
    <link rel="stylesheet" href="/style/calendar.css">
</svelte:head>

<!-- define snippet since we don't really need a component here -->
{#snippet calendarOfficeHour(officeHour)}
    <a href="/office-hours/{officeHour.id}" class="office-hour"
    style="border-color: {makeColor(officeHour)}; background-color: {makeColorLight(officeHour)}">
        <div>
            {officeHour.department} {officeHour.courseNumber}
        </div>
        <div>
            {to12HourTime(officeHour.startTime)} 
            - {to12HourTime(officeHour.endTime)}
        </div>
    </a>
{/snippet}


<Header></Header>
<div class="w-full flex justify-center flex-col items-center">
    <div class="title">
        Calendar
    </div>
    <div class="subtitle">
        Office Hours for {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
    </div>
    <div class="arrows">
        <img src="/arrow.png" alt="next month" class="arrow" onclick={lastMonth} style="transform: rotate(180deg);">
        <img src="/arrow.png" alt="last month" class="arrow" onclick={nextMonth}>
    </div>
    <br>
    <div class="search">
        <input type="text" onkeyup={handleSearch} placeholder="Search office hours by keyword...">
        <img src="/search.png" alt="Search" class="relative right-0 top-0 w-[1.3em] h-[1.3em] left-[-2em]">
    </div>
    <div class="sort-by">
        <b>Sort Options</b>
        <div class="sort-options">
            <div class="sort-option">
                {#if loggedIn}
                    Favorites
                    <input type="checkbox" bind:checked={showFavorites} onclick={handleFavorites}>
                {/if}
            </div>
            <div class="sort-option">
                Include Virtual
                <input type="checkbox" bind:checked={showVirtual} onclick={handleVirtual}>
            </div>
        </div>
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
                            <div class="day-content">
                                {#each weeklyHours[j] as officeHour}
                                    {@render calendarOfficeHour(officeHour)}
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>