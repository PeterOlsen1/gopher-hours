<script>
    import Header from "$lib/components/Header.svelte";
    import { redirectIfNotLoggedIn } from "$lib/firebase/auth";
    import { onMount } from "svelte";
    import { getAllOfficeHours } from "$lib/firebase/db";
    import { data, groupOfficeHoursByDate, to12HourTime } from "$lib/utils/utils";
    import OfficeHour from "$lib/components/OfficeHour.svelte";
    import { load } from "../office-hours/[id]/+page";

    let officeHours = $state([]);
    let originalOfficeHours = [];
    let loading = $state(true);
    let groupedOfficeHours = $derived.by(() => {
        return groupOfficeHoursByDate(officeHours);
    });

    function handleSearch(e) {
        const search = e.target.value.toLowerCase();
        officeHours = originalOfficeHours.filter(oh => {
            return JSON.stringify(oh).toLowerCase().includes(search);
        });
    }

    onMount(async () => {
        await redirectIfNotLoggedIn();
        officeHours = await getAllOfficeHours();
        originalOfficeHours = officeHours;
        loading = false;
    });
</script>

<style>
    .title {
        margin-bottom: -0.2em;
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
        width: 60%;
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

    .oh-header {
        width: 75%;
        font-size: 2em;
        font-weight: bold;
        margin-top: 1em;
    }

    @media (width < 800px) {
        .subtitle {
            font-size: 0.9em;
        }

        .oh-header {
            font-size: 1.2em;
            width: 95%;
        }

        .search {
            width: 80%;
            font-size: 0.8em;
        }
    }
</style>

<svelte:head>
    <title>All Office Hours</title>
</svelte:head>

<Header />
<div class="w-full flex justify-center flex-col items-center">
    <h1 class="title">
        Office Hours
    </h1>
    <div class="subtitle">
        Find all office hours by date and time.
    </div>
    <br><br>
    <div class="search">
        <input type="text" onkeyup={handleSearch} placeholder="Search office hours by keyword...">
        <img src="/search.png" alt="Search" class="relative right-0 top-0 w-[1.3em] h-[1.3em] left-[-2em]">
    </div>
    <div class="main-container">
        {#if loading}
            <br><br>
            <div class="loading-spinner"></div>
        {/if}
        {#each Object.keys(groupedOfficeHours) as group}
            <div class="oh-header">
                {group}
            </div>
            {#each groupedOfficeHours[group] as oh}
                <OfficeHour {oh} menu={"home"}/>
            {/each}
        {/each}
        {#if officeHours.length === 0 && !loading}
            <br><br>
            <div class="text-xl">
                No office hours found!
            </div>
        {/if}
    </div>
</div>
<br>