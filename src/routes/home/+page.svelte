<script>
    import Header from "$lib/components/Header.svelte";
    import { redirectIfNotLoggedIn } from "$lib/firebase/auth";
    import { onMount } from "svelte";
    import { getAllOfficeHours } from "$lib/firebase/db";
    import { data, groupOfficeHoursByDate, to12HourTime } from "$lib/utils/utils";
    import OfficeHour from "$lib/components/OfficeHour.svelte";

    let officeHours = $state([]);
    let groupedOfficeHours = $derived.by(() => {
        return groupOfficeHoursByDate(officeHours);
    });

    function handleSearch(e) {
        const search = e.target.value.toLowerCase();
        console.log(search);
        officeHours = officeHours.filter(oh => {
            console.log(oh);
            return JSON.parse(oh).toLowerCase().includes(search);
        });
    }

    onMount(async () => {
        await redirectIfNotLoggedIn();
        officeHours = await getAllOfficeHours();
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

    .oh-header {
        width: 75%;
        font-size: 2em;
        font-weight: bold;
        margin-top: 1em;
    }

    @media (width < 800px) {
        .title {
            font-size: 2em;
        }

        .oh-header {
            font-size: 1.5em;
            width: 95%;
        }
    }
</style>

<svelte:head>
    <title>All Office Hours</title>
</svelte:head>

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
        {#if !officeHours.length}
            <br><br>
            <div>
                Loading...
            </div>
        {/if}
        {#each Object.keys(groupedOfficeHours) as group}
            <div class="oh-header">
                {group}
            </div>
            {#each groupedOfficeHours[group] as oh}
                <OfficeHour {oh} menu={"home"}/>
            {/each}
        {/each}
    </div>
</div>