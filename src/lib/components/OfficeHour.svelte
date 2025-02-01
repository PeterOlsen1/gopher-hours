<script>
    import { to12HourTime } from "$lib/utils/utils";
    let { oh, menu } = $props();

    let link = $state("");
    if (menu === "ta") {
        link = `/office-hours/edit/${oh.id}`;
    } else {
        link = `/office-hours/${oh.id}`;
    }
</script>

<div class="oh-container">
    <img src="{oh.host.photoURL}" alt="Host photo" class="w-[6em] h-[6em] rounded-full">
    <div class="oh-info">
        <div>
            <b>{oh.department} {oh.courseNumber}</b> -
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
    {#if oh.description}
        <div class="oh-description">
            <b>Description:</b> {oh.description}
        </div>
    {/if}
    <div class="oh-arrow">
        <a href="{link}">
            <img src="/arrow.png" alt="Arrow" class="w-[3em] h-[3em]">
        </a>
    </div>
</div>