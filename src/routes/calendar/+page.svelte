<script>
    import Header from "$lib/components/Header.svelte";
    import { onMount } from "svelte";
    import { data } from "$lib/utils/utils";

    const dates = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ]

    const weeklyHours = [
        [], [], [], [], [], [], []
    ]


    onMount(() => {
        //put data into the appropriate weekly buckets
        //check for exceptions here later
        for (let officeHour of data) {
            const day = officeHour.date[0].toUpperCase() + officeHour.date.slice(1);
            console.log(day);
            const dayIdx = dates.indexOf(day);
            weeklyHours[dayIdx].push(officeHour);
        }

        const today = new Date();
        const date = today.getDate();
        const month = today.getMonth();
        // const dayName = today.getDay();
        // console.log(dayName);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        let weekIdx = 0;
        let dayIdx = monthStart.getDay();

        for (let i = 0; i < 5; i++) {
            const week = document.querySelector(`.week-${i}`);
            for (let j = dayIdx; j < 7; j++) {
                console.log(dayIdx);
                const day = week.children[j];

                day.innerHTML = `${dayIdx + j + weekIdx * 7}`;
            }
            dayIdx = 0;
            weekIdx++;
        }
    })
</script>

<svelte:head>
    <title>Calendar</title>
    <link rel="stylesheet" href="/style/calendar.css">
</svelte:head>


<Header></Header>
<div class="w-full flex justify-center flex-col items-center">
    <div class="title">
        Calendar
    </div>
    <div>
        View Office Hours Schedule in Calendar View
    </div>
    <br><br><br>

    <div class="calendar">
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
            <div class="week week-0">
                <div class="day">1</div>
                <div class="day">2</div>
                <div class="day">3</div>
                <div class="day">4</div>
                <div class="day">5</div>
                <div class="day">6</div>
                <div class="day">7</div>
            </div>
            <div class="week week-1">
                <div class="day">8</div>
                <div class="day">9</div>
                <div class="day">10</div>
                <div class="day">11</div>
                <div class="day">12</div>
                <div class="day">13</div>
                <div class="day">14</div>
            </div>
            <div class="week week-2">
                <div class="day">15</div>
                <div class="day">16</div>
                <div class="day">17</div>
                <div class="day">18</div>
                <div class="day">19</div>
                <div class="day">20</div>
                <div class="day">21</div>
            </div>
            <div class="week week-3">
                <div class="day">22</div>
                <div class="day">23</div>
                <div class="day">24</div>
                <div class="day">25</div>
                <div class="day">26</div>
                <div class="day">27</div>
                <div class="day">28</div>
            </div>
            <div class="week week-4">
                <div class="day">29</div>
                <div class="day">30</div>
                <div class="day">31</div>
                <div class="day">1</div>
                <div class="day">2</div>
                <div class="day">3</div>
                <div class="day">4</div>
            </div>
        </div>
    </div>
</div>