<script lang="ts"> //ts so i don't go insane
    import Header from "$lib/components/Header.svelte";
    import { onMount } from "svelte";
    import { data, to12HourTime, groupOfficeHoursByDate } from "$lib/utils/utils";
    import { page } from "$app/state";
    import { ensureAuth, user } from "$lib/firebase/auth";
    import { getUserData } from "$lib/firebase/db";
    import type { UserEntry } from "$lib/types/user";
    import OfficeHour from "$lib/components/OfficeHour.svelte";

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
    let userData: UserEntry|null = null;
    let loggedIn = $state(false);
    let calendar: HTMLDivElement|null = $state(null);
    let weeks = $state([0, 1, 2, 3, 4, 5]);
    let officeHours = $state(page.data.officeHours as any);
    let originalOfficeHours: OfficeHour[] = page.data.officeHours;

    let showFavorites = $state(false);
    let showVirtual = $state(true);

    let today = $state(new Date());

    function handleSearch(e: KeyboardEvent) {
        const target = e.target as HTMLInputElement | null;
        if (!target) return;

        const search = target.value.toLowerCase();
        officeHours = originalOfficeHours.filter(oh => {
            let officeHour = oh as any;
            let condition = JSON.stringify(officeHour).toLowerCase().includes(search);
            condition ||= (officeHour.department + ' ' + officeHour.courseNumber).toLowerCase().includes(search);
            return condition;
        });
    }

    function handleVirtual() {
        if (!showVirtual) {
            officeHours = originalOfficeHours;
        } else {
            officeHours = originalOfficeHours.filter(oh => {
                let officeHour = oh as any;
                let condition = officeHour.location.toLowerCase().includes('virtual');
                condition ||= officeHour.location.toLowerCase().includes('zoom');
                condition ||= officeHour.location.toLowerCase().includes('online');
                condition ||= officeHour.location.toLowerCase().includes('blended');
                return !condition;
            });
        }
    }

    async function handleFavorites() {
        if (!showFavorites && userData) {
            let favorites = userData.favorites;
            officeHours = originalOfficeHours.filter(oh => {
                return favorites.includes((oh as any).id);
            });
        } else {
            officeHours = originalOfficeHours;
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

    function makeColorLight(officeHour: any) {
        return `rgba(${officeHour.color[0]}, ${officeHour.color[1]}, ${officeHour.color[2]}, 0.2)`;
    }

    function makeColor(officeHour: any) {
        return `rgb(${officeHour.color[0]}, ${officeHour.color[1]}, ${officeHour.color[2]})`;
    }

    /**
     * Logic behind building the calendar
     */
    function createCalendar() {
        if (!calendar) return;

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
            let day = calendar.querySelector(`.week-0`);
            if (!day) {
                continue;
            }

            day = day.children[i];
            day.className = 'day';
            day.classList.add('invalid-day');
        }

        //loop over all the weeks
        for (let i = 0; i < 6; i++) {
            const week = calendar.querySelector<HTMLDivElement>(`.week-${i}`);
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
                let dayRef = day.querySelector('.day-header');
                if (!dayRef) {
                    continue;
                }
                dayRef.innerHTML = `${dayDate}`;

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
                        let week4 = calendar.querySelector<HTMLDivElement>('.week-4');
                        if (week4) {
                            week4.style.display = 'none';
                        }
                    }

                    //check if we need to remove last week
                    //either last day of month is saturday or we had an invalid day week 4
                    if (i == 4 || (i == 5 && j == 0)) {
                        let week5 = calendar.querySelector<HTMLDivElement>('.week-5');
                        if (week5) {
                            week5.style.display = 'none';
                        }
                    }
                }
            }

            //reset weekStartDay
            weekStartDay = 0;
        }
    }

    onMount(async () => {
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
 <!-- leave officeHour as type 'any' since the svelte/ts compiler yells at me if i leave it as OfficeHour -->
{#snippet calendarOfficeHour(officeHour: any)}
    {@const link = officeHour.exception ? `/office-hours/${officeHour.id}?exception=${officeHour.exceptionDate}` : `/office-hours/${officeHour.id}`}
    <a href={link} class="office-hour"
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
    <div class="subtitle arrows">
        <img src="/arrow.png" alt="next month" class="arrow" onclick={lastMonth} style="transform: rotate(180deg);">
        {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
        <img src="/arrow.png" alt="last month" class="arrow" onclick={nextMonth}>
    </div>

    <div class="search mt-10">
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
                <!-- this is some weird math. Basically, pass this function a 'date' that corresponds to the sunday of the given week -->
                {@const weeksHours = groupOfficeHoursByDate(officeHours, new Date(today.getFullYear(), today.getMonth(), (i - 1) * 7 + 2))}
                <div class="week week-{i}">
                    {#each [0, 1, 2, 3, 4, 5, 6] as j}
                        <div class="day">
                            <div class="day-header">
                                <!-- day number is placed here -->
                            </div>
                            <div class="day-content">
                                {#each weeksHours[dates[j]] as officeHour}
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