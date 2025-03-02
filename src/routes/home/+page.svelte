<script>
    import Header from "$lib/components/Header.svelte";
    import { ensureAuth, redirectIfNotLoggedIn, user } from "$lib/firebase/auth";
    import { onMount } from "svelte";
    import { getAllOfficeHours, getUserData } from "$lib/firebase/db";
    import { data, groupOfficeHoursByDate, to12HourTime } from "$lib/utils/utils";
    import OfficeHour from "$lib/components/OfficeHour.svelte";
    import { load } from "../office-hours/[id]/+page";

    let sort_order = $state([ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    let showFavorites = $state(false);
    let showVirtual = $state(true);
    let loggedIn = $state(false);
    let userData = null;
    let officeHours = $state([]);
    let originalOfficeHours = [];
    let loading = $state(true);
    let groupedOfficeHours = $derived.by(() => {
        return groupOfficeHoursByDate(officeHours);
    });

    function handleSearch(e) {
        const search = e.target.value.toLowerCase();
        officeHours = originalOfficeHours.filter(oh => {
            let condition = JSON.stringify(oh).toLowerCase().includes(search);
            condition = condition || (oh.department + ' ' + oh.courseNumber).toLowerCase().includes(search);
            return condition;
        });
    }

    function handleVirtual() {
        if (!showVirtual) {
            officeHours = originalOfficeHours;
        } else {
            officeHours = originalOfficeHours.filter(oh => {
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
            console.log(favorites);
            officeHours = originalOfficeHours.filter(oh => {
                return favorites.includes(oh.id);
            });
        } else {
            officeHours = originalOfficeHours;
        }
    }

    onMount(async () => {
        officeHours = await getAllOfficeHours();

        // do some math to make it so that today shows up first
        const today = new Date().getDay();
        const leftover = sort_order.slice(0, today);
        sort_order = sort_order.slice(today).concat(leftover);
        originalOfficeHours = officeHours;
        loading = false;

        await ensureAuth();
        loggedIn = !!user;
        userData = user ? await getUserData(user.uid) : null;
    });
</script>

<style>
    .title {
        margin-bottom: -0.2em;
    }
    input[type="text"] {
        width: 100%;
        border: 1px solid black;
        border-radius: 0.25em; 
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
        font-size: 1.75em;
        font-weight: bold;
        margin-top: 1em;
    }

    .sort-by {
        width: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        margin-top: 0.5em;
    }

    .sort-options {
        width: 90%;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        text-align: center;
        margin-right: auto;
        margin-left: auto;
        gap: 1em;
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

        .sort-by {
            font-size: 0.8em;

            input {
                width: 1em;
            }
        }
    }
</style>

<svelte:head>
    <title>All Office Hours</title>
</svelte:head>

<Header />
<div class="w-full flex justify-center flex-col items-center">
    <br><br>
    <h1 class="title">
        Gopher Hours
    </h1>
    <div class="subtitle">
        Find and queue for UMN office hours anywhere.
    </div>
    <br><br>
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
    <div class="main-container">
        {#if loading}
            <br><br>
            <div class="loading-spinner"></div>
        {/if}
        {#each sort_order as group}
            {#if groupedOfficeHours[group]}
                <div class="oh-header">
                    {group}
                </div>
            {/if}
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