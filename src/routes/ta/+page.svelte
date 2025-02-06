<script>
    import Header from "$lib/components/Header.svelte";
    import OfficeHour from "$lib/components/OfficeHour.svelte";
    import { redirectIfNotLoggedIn } from "$lib/firebase/auth";
    import { getAllOfficeHours, getTAOfficeHours, getUserData, uploadNewOfficeHour } from "$lib/firebase/db";
    import { onMount } from "svelte";
    import { user } from "$lib/firebase/auth";
    import { to12HourTime } from "$lib/utils/utils";
    import Swal from "sweetalert2";

    let officeHours = $state(getTAOfficeHours());

    let department = $state("");
    let courseNumber = $state("");
    let location = $state("");
    let link = $state("");
    let date = $state("monday");
    let startTime = $state("");
    let endTime = $state("");
    let description = $state("");

    async function handleFormInput(e) {
        e.preventDefault();

        //make fancy later
        if (!department || !courseNumber || !location || !date || !startTime || !endTime) {
            Swal.fire({
                title: 'Error!',
                text: 'Required fields are missing.',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
            return;
        }

        //this is a stretch, but make sure they have the link if it's a zoom meeting
        if (location.toLowerCase().includes("zoom") || location.toLowerCase().includes("online") || location.toLowerCase().includes("blended") && !link) {
            Swal.fire({
                title: 'Error!',
                text: 'No link provided for online office hours.',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
            return;
        }

        const data = {
            host: user.uid,
            courseNumber,
            department,
            location,
            link,
            date,
            startTime,
            endTime,
            description,
            queue : []
        }

        try {
            await uploadNewOfficeHour(data);

            Swal.fire({
                title: 'Success!',
                text: 'Office hours uploaded successfully.',
                icon: 'success'
            });
            
            const userData = await getUserData(user.uid);
            data.host = userData;
            let officeHoursCopy = await officeHours;
            officeHoursCopy.push(data);
            officeHours = officeHoursCopy;

            department = "";
            courseNumber = "";
            location = "";
            link = "";
            date = "monday";
            startTime = "";
            endTime = "";
            description = "";

        }
        catch (e) {
            console.log("Error uploading office hour: " + e);
            Swal.fire({
                title: 'Error!',
                text: 'Upload failed, try again later.',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
        }
    }

    onMount(async () => {
        await redirectIfNotLoggedIn();
    });
</script>

<style>
    .title {
        margin-bottom: -0.2em;
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

    i {
        color: red;
    }

    .oh-container {
        width: 50%;
        gap: 1em;
    }

    @media (max-width: 800px) {
        form {
            gap: 0.5em;
            width: 85%;
            font-size: 0.9em;
        }

        form input, form select, form option {
            padding: 0.25em 0.5em;
            font-size: 0.8em;
        }

        .form-group {
            grid-template-columns: 1fr 3fr;
        }

        button {
            padding: 0.25em 0.5em;
            font-size: 0.9em;
            margin-top: 0.5em;
        }
    }
</style>

<svelte:head>
    <title>TA Menu</title>
</svelte:head>

<Header />
<div class="w-full flex justify-center flex-col items-center">
    <h1 class="title">
        TA Menu
    </h1>
    <div>
        Schedule new Office Hours
    </div>
    <br>
    <form>
        <div class="form-group">
            <label for="department"><i>*</i>Department:</label>
            <input type="text" id="department" name="department" bind:value={department} autocomplete="off" placeholder="CSCI">
        </div>
        <div class="form-group">
            <label for="course"><i>*</i>Course #:</label>
            <input type="text" id="course" name="course" bind:value={courseNumber} autocomplete="off" placeholder="1133">
        </div>
        <div class="form-group">
            <label for="location"><i>*</i>Location:</label>
            <input type="text" id="location" name="location" bind:value={location} autocomplete="off" placeholder="Keller Atrium, Zoom, etc.">
        </div>
        <div class="form-group">
            <label for="link">Link (if online):</label>
            <input type="text" id="link" name="link" bind:value={link} autocomplete="off">
        </div>
        <!-- <div> -->
            <div class="form-group">
                <label for="date"><i>*</i>Day:</label>
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
            <label for="start-time"><i>*</i>Start time:</label>
            <input type="time" id="start-time" name="start-time" bind:value={startTime} autocomplete="off">
        </div>
        <div class="form-group">
            <label for="end-time"><i>*</i>End time:</label>
            <input type="time" id="end-time" name="end-time" bind:value={endTime} autocomplete="off">
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <input type="text" id="description" name="description" bind:value={description} autocomplete="off" 
            placeholder="Homework 2 discussion, etc.">
        </div>
        <button type="submit" onclick={handleFormInput}>Submit</button>
    </form>
    <br>
    <div class="soft-title">
        Edit Office Hours
    </div>
    {#await officeHours}
        <div class="loading-spinner"></div>
    {:then officeHours} 
        {#each officeHours as oh}
            <OfficeHour oh={oh} menu={"ta"} />
        {/each}
        {#if officeHours.length == 0}
            <div>
                No office hours scheduled yet.
            </div>
        {/if}
    {/await}
        <br><br>
</div>