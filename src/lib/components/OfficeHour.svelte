<script>
    import { getUserDataCache } from "$lib/firebase/db";
    import { to12HourTime } from "$lib/utils/utils";
    import { onMount } from "svelte";
    let { oh, menu } = $props();

    let shortMenu = $state(menu == "user" || menu == "ta");
    let link = $state("");
    if (menu === "ta") {
        link = `/office-hours/edit/${oh.id}`;
    } else {
        link = `/office-hours/${oh.id}`;
        if (oh.exception) {
            link += `?exception=${oh.exceptionDate}`;
        }
    }
    
    //sometimes host data is passed in as a uid reference
    //this will allow for either
    let hostData = $state({});
    onMount(async () => {
        hostData = await getUserDataCache(oh.host);
    });
</script>

<style>
    .oh-container {
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

    .oh-description {
        margin-left: 1em;
        text-wrap: wrap;
        max-width: 50%;
    }

    .host-photo {
        width: 6em;
        height: 6em;
        border-radius: 50%;
    }

    @media (width < 800px) {
        .oh-container {
            width: 100%;
            border-radius: 0px;
            border-left: 0px;
            border-right: 0px;
            font-size: 0.8em;

            display: grid;
            grid-template-columns: repeat(1fr, 10);
            grid-template-rows: auto auto;
        }

        .oh-container img {
            grid-column: 1 / 3;
        }

        .oh-info {
            grid-column: 3 / 10;
            text-align: left;
        }

        .oh-description {
            grid-column: 1 / 6;
            max-width: 100%;
            margin: 0;
            text-align: center;
            display: grid;
            place-items: center;
        }

        .oh-arrow {
            grid-column: 7 / 8;
            padding: 0;
            margin-right: 1em;
        }

        .host-photo {
            width: 5em;
            height: 5em;
        }
    }
</style>

<!-- style="display: {shortMenu ? 'flex' : 'grid'}" -->
<div class="oh-container">
    {#if !shortMenu}
        <img src="{hostData.photoURL}" alt="Host" class="host-photo">
    {/if}
    <!-- style="flex: {shortMenu ? '1' : '0'}" -->
    <div class="oh-info">
        <div>
            {#if oh.exception}
                <b style="color: red">*</b>
            {/if}
            <b>{oh.department} {oh.courseNumber}</b> -
            {#if oh.link}
                <a href="{oh.link}" target="_blank" rel="noopener noreferrer">{oh.location}</a>
            {:else}
                {oh.location}
            {/if}
        </div>
        <div>
            {#if oh.exception}
                {oh.date.slice(0, 1).toUpperCase() + oh.date.slice(1)}
            {:else}
                {oh.date.slice(0, 1).toUpperCase() + oh.date.slice(1) + "s"}, 
            {/if}
            {to12HourTime(oh.startTime)} - {to12HourTime(oh.endTime)}
        </div>
        {#if !shortMenu}
            <div>
                Host: {hostData.name}, <small>{hostData.email}</small>
            </div>
        {/if}
    </div>
    {#if oh.description}
        <div class="oh-description" style="flex: {menu != 'user' ? '1' : menu != 'ta' ? '1' : '0'}">
            <div>
                <b>Description:</b> {oh.description}
            </div>
        </div>
    {/if}

    <div class="oh-arrow">
        <a href="{link}">
            <img src="/arrow.png" alt="Arrow" class="w-[3em] h-[3em]">
        </a>
    </div>
</div>