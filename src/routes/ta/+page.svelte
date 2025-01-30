<script>
    import Header from "$lib/components/Header.svelte";
    import { redirectIfNotLoggedIn } from "$lib/db/auth";
    import { onMount } from "svelte";

    let course, location, link, date, startTime, endTime;
    location = 'online';

    function handleFormInput(e) {
        e.preventDefault();

        //make fancy later
        if (!course || !location || !date || !startTime || !endTime) {
            console.log('nonono');
            // return;
        }

        //this is a stretch, but make sure they have the link if it's a zoom meeting
        if (location.toLowerCase().includes("zoom") || location.toLowerCase().includes("online") && !link) {
            console.log('no link');
            return;
        }
    }

    onMount(() => {
        redirectIfNotLoggedIn();
    });
</script>

<style>
    .title {
        font-size: 3em;
        margin-top: 1.5em;
    }

    .soft-title {
        font-size: 2em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }

    form {
        display: flex;
        justify-content: center;
        flex-direction: column;
        gap: 1em;
    }

    form input {
        border: 1px solid black;
        border-radius: 999px;
        padding: 0.25em 0.5em;
    }

    .form-group {
        display: grid;
        grid-template-columns: 4fr 6fr;
        align-items: center;
    }

    .form-group label {
        text-align: right;
        padding-right: 1em;
        font-weight: bold;
    }
</style>

<Header />
<div class="w-full flex justify-center flex-col items-center">
    <h1 class="title">
        TA Menu
    </h1>
    <br>
    <div class="soft-title">
        Schedule new Office Hours
    </div>
    <form>
        <div class="form-group">
            <label for="course">Course:</label>
            <input type="text" id="course" name="course" bind:value={course}>
        </div>
        <div class="form-group">
            <label for="location">Location:</label>
            <input type="text" id="location" name="location" bind:value={location}>
        </div>
        <div class="form-group">
            <label for="link">Link (if online):</label>
            <input type="text" id="link" name="link" bind:value={link}>
        </div>
        <div class="form-group">
            <label for="date">Date:</label>
            <input type="date" id="date" name="date" bind:value={date}>
        </div>
        <div class="form-group">
            <label for="start-time">Start time:</label>
            <input type="start-time" id="start-time" name="start-time" bind:value={startTime}>
        </div>
        <div class="form-group">
            <label for="end-time">End time:</label>
            <input type="end-time" id="end-time" name="end-time" bind:value={endTime}>
        </div>
        <button type="submit" onclick={handleFormInput}>Submit</button>
    </form>
    <div class="soft-title">
        Update Office Hours
    </div>
    <div class="soft-title">
        Remove Office Hours
    </div>

</div>