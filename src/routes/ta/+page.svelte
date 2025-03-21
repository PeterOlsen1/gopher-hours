<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import OfficeHour from "$lib/components/OfficeHour.svelte";
    import { redirectIfNotLoggedIn } from "$lib/firebase/auth";
    import { getTAOfficeHours, getUserDataCache, uploadNewOfficeHour } from "$lib/firebase/db";
    import { onMount } from "svelte";
    import { user } from "$lib/firebase/auth";
    import Swal from "sweetalert2";
    import type { OfficeHour as OfficeHourType } from "$lib/types/oh";

    let officeHours = $state(getTAOfficeHours());

    let department = $state("");
    let courseNumber = $state("");
    let location = $state("");
    let link = $state("");
    let date = $state("");
    let startTime = $state("");
    let endTime = $state("");
    let description = $state("");
    let queue = $state(true);

    async function handleFormInput(e: Event) {
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
        if ((location.toLowerCase().includes("zoom") || location.toLowerCase().includes("online") || location.toLowerCase().includes("blended")) && !link) {

            Swal.fire({
                title: 'Error!',
                text: 'You need to provide a link for online office hours!',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
            return;
        }

        const data: OfficeHourType = {
            host: user ? user.uid : "unknown",
            courseNumber,
            department,
            location,
            link,
            date,
            startTime,
            endTime,
            description,
            queueEnabled: queue,
            queue : [],
            color: [],
            exceptions: [],
            id: "",
            exceptionDate: null,
            exception: false
        }

        try {
            const ohId = await uploadNewOfficeHour(data);

            Swal.fire({
                title: 'Success!',
                text: 'Office hours uploaded successfully.',
                icon: 'success'
            });
            
            // const userData = await getUserDataCache(user ? user.uid : "");
            // data.host = userData;
            let officeHoursCopy = await officeHours;
            data.id = ohId;
            officeHoursCopy.push(data);
            officeHours = Promise.resolve(officeHoursCopy);

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
</style>

<svelte:head>
    <title>TA Menu</title>
    <link rel="stylesheet" href="/style/oh-form.css">
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
            <input type="url" id="link" name="link" bind:value={link} autocomplete="off">
        </div>
        <!-- <div> -->
            <div class="form-group">
                <label for="date"><i>*</i>Day:</label>
                <select id="date" name="date" bind:value={date}>
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
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
            <label for="description">Description:</label>
            <input type="text" id="description" name="description" bind:value={description} autocomplete="off" 
            placeholder="Homework 2 discussion, etc.">
        </div>
        <div class="queue-group">
            <label for="queue">Enable Queue?</label>
            <input type="checkbox" id="queue" name="queue" bind:checked={queue}>
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