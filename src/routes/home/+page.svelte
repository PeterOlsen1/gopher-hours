<script>
    import Header from "$lib/components/Header.svelte";
    import { redirectIfNotLoggedIn } from "$lib/firebase/auth";
    import { onMount } from "svelte";
    import { getAllOfficeHours } from "$lib/firebase/db";
    import { data, groupOfficeHoursByDate, to12HourTime } from "$lib/utils/utils";

    let officeHours = $state(data);
    let groupedOfficeHours = $derived.by(() => {
        return groupOfficeHoursByDate(officeHours);
    });

    function handleSearch(e) {
        const search = e.target.value.toLowerCase();
        console.log(search);
        officeHours = data.filter(oh => {
            return JSON.stringify(oh).toLowerCase().includes(search);
        });
    }
    onMount(async () => {
        redirectIfNotLoggedIn();
    });
</script>

<style>
    .title {
        font-size: 3em;
        margin-top: 2em;
    }

    input {
        width: 100%;
        border: 1px solid black;
        border-radius: 999px; 
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    }

    .search {
        display: flex;
        align-items: center;
    }

    .search input {
        padding: 0.25em 0.5em;
        padding-right: 2.3em;
    }

    .main-container {
        width: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }

    .oh-container {
        border: 1px solid black;
        border-radius: 0.5em;
        padding: 0.5em;
        margin: 0.5em;
        display: flex;
        justify-content: flex-start;
        width: 80%;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    }

    .oh-info {
        margin-left: 1em;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
    }

    .oh-header {
        width: 75%;
        font-size: 2em;
        font-weight: bold;
        margin-top: 1em;
    }

    .oh-arrow {
        flex-grow: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 2em;
    }

    .oh-arrow img {
        cursor: pointer;
    }
</style>

<Header />
<div class="w-full flex justify-center flex-col items-center">
    <h1 class="title">
        All Office Hours
    </h1>
    <br>
    <div>
        Search to refine results
    </div>
    <div class="search">
        <input type="text" onkeyup={handleSearch}>
        <img src="/search.png" alt="Search" class="relative right-0 top-0 w-[1.3em] h-[1.3em] left-[-2em]">
    </div>
    <div class="main-container">
        <!-- {#await officeHours}
            <div>Loading...</div>
        {:then officeHours}
            {#each officeHours as officeHour}
                <div>
                    {officeHour.name}
                </div>
            {/each}
        {/await} -->
        {#each Object.keys(groupedOfficeHours) as group}
            <div class="oh-header">
                {group}
            </div>
            {#each groupedOfficeHours[group] as oh}
                <div class="oh-container">
                    <img src="{oh.host.photoURL}" alt="Host photo" class="w-[6em] h-[6em] rounded-full">
                    <div class="oh-info">
                        <div>
                            <b>{oh.course}</b> -
                            {#if oh.link}
                                <a href="{oh.link}" target="_blank" rel="noopener noreferrer">{oh.location}</a>
                            {:else}
                                {oh.location}
                            {/if}
                        </div>
                        <div>
                            {oh.date.slice(0, 1).toUpperCase() + oh.date.slice(1) + "s"}, 
                            {to12HourTime(oh.startTime)} - {to12HourTime(oh.endTime)}
                        </div>
                        <div>
                            Hosted by: {oh.host.name}, <small>{oh.host.email}</small>
                        </div>
                    </div>
                    <div class="oh-arrow">
                        <a href="/office-hours/{oh.id}">
                            <img src="/arrow.png" alt="Arrow" class="w-[3em] h-[3em]">
                        </a>
                    </div>
                </div>
            {/each}
        {/each}
    </div>
</div>