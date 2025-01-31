<script>
    import Header from "$lib/components/Header.svelte";
    import { redirectIfNotLoggedIn } from "$lib/db/auth";
    import { getAllOfficeHours, uploadNewOfficeHour } from "$lib/db/db";
    import { onMount } from "svelte";
    import { user } from "$lib/db/auth";

    let course, location, link, date, startTime, endTime;
    course = "CSCI 4131";
    location = "Lind L103";
    link = "";
    date = "wednesday";
    startTime = "12:00";
    endTime = "14:00";

    async function handleFormInput(e) {
        e.preventDefault();

        console.log(startTime);
        //make fancy later
        if (!course || !location || !date || !startTime || !endTime) {
            console.log('nonono');
            return;
        }

        //this is a stretch, but make sure they have the link if it's a zoom meeting
        if (location.toLowerCase().includes("zoom") || location.toLowerCase().includes("online") && !link) {
            console.log('no link');
            return;
        }

        const data = {
            host: user.uid,
            course,
            location,
            link,
            date,
            startTime,
            endTime
        }

        const result = await uploadNewOfficeHour(data);
        if (result) {
            console.log("Error uploading office hour: " + result);
        }
        else {
            console.log("Office hour uploaded successfully!");
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
        text-align: center;
        gap: 1em;
    }

    form input, form select, form option {
        border: 1px solid black;
        border-radius: 999px;
        padding: 0.25em 0.5em;
    }

    form select {
        padding-top: 0.5em;
        padding-bottom: 0.5em;
    }

    .form-group {
        display: grid;
        grid-template-columns: 3fr 7fr;
        align-items: center;
    }

    .form-group label {
        text-align: right;
        padding-right: 1em;
        font-weight: bold;
    }

    button {
        border: 1px solid black;
        border-radius: 999px;
        padding: 0.25em 1em;
        cursor: pointer;
        margin-left: auto;
        margin-right: auto;
    }

    button:hover {
        background-color: #f0f0f0;
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
            <input type="text" id="course" name="course" bind:value={course} autocomplete="off">
        </div>
        <div class="form-group">
            <label for="location">Location:</label>
            <input type="text" id="location" name="location" bind:value={location} autocomplete="off">
        </div>
        <div class="form-group">
            <label for="link">Link (if online):</label>
            <input type="text" id="link" name="link" bind:value={link} autocomplete="off">
        </div>
        <!-- <div> -->
            <div class="form-group">
                <label for="date">Day:</label>
                <select id="date" name="date" bind:value={date}>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                </select>
            </div>
            <!-- <div class="max-w-full">
                <small>Dates repeat weekly. To simply update a time, use the <u>update</u> feature instead.</small>
            </div> -->
        <!-- </div> -->
        <div class="form-group">
            <label for="start-time">Start time:</label>
            <input type="time" id="start-time" name="start-time" bind:value={startTime} autocomplete="off">
        </div>
        <div class="form-group">
            <label for="end-time">End time:</label>
            <input type="time" id="end-time" name="end-time" bind:value={endTime} autocomplete="off">
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