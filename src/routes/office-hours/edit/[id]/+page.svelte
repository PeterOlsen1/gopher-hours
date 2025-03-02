<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { deleteOfficeHour, getSingleOfficeHour, updateOfficeHour, uploadException } from "$lib/firebase/db";
    import { redirectIfNotLoggedIn, user } from "$lib/firebase/auth";
    import Swal from "sweetalert2";
    import { goto } from "$app/navigation";
    import { data } from "$lib/utils/utils";

    const dates = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    //page / url data
    const ref = page.url.searchParams.get('ref');
    const id = page.params.id;
    let ohData = $state(page.data);

    let department = $state(ohData.department);
    let courseNumber = $state(ohData.courseNumber);
    let location = $state(ohData.location);
    let link = $state(ohData.link);
    let date = $state(ohData.date);
    let startTime = $state(ohData.startTime);
    let endTime = $state(ohData.endTime);
    let description = $state(ohData.description);
    let queueEnabled = $state(ohData.queueEnabled);


    let locationMod = $state(ohData.location);
    let linkMod = $state(ohData.link);
    let dateMod = $state(ohData.date);
    let startTimeMod = $state(ohData.startTime);
    let endTimeMod = $state(ohData.endTime);
    let descriptionMod = $state(ohData.description);
    let queueEnabledMod = $state(ohData.queueEnabled);
    let originalWeek = $state('');

    async function handleFormInput(e) {
        e.preventDefault();

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
                text: 'You need to provide a link for online office hours!.',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
            return;
        }

        const data = {
            host: user.uid,
            department,
            courseNumber,
            location,
            link,
            date,
            startTime,
            endTime,
            description,
            queueEnabled
        }

        try {
            await updateOfficeHour(id, data);
            Swal.fire({
                title: 'Success!',
                text: 'Office hours updated successfully.',
                icon: 'success'
            });
            if (ref == 'oh') {
                goto('/office-hours/' + id);
            }
            else {
                goto('/ta');
            }
        }
        catch (e) {
            console.log("Error updating office hour: " + e);
            Swal.fire({
                title: 'Error!',
                text: 'Update failed, try again later.',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
        }
    }

    async function handleModInput(e) {
        e.preventDefault();
        console.log('modifying');

        if (!originalWeek || !locationMod || !dateMod || !startTimeMod || !endTimeMod) {
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

        if ((locationMod.toLowerCase().includes("zoom") || locationMod.toLowerCase().includes("online") || locationMod.toLowerCase().includes("blended")) && !linkMod) {
            Swal.fire({
                title: 'Error!',
                text: 'You need to provide a link for online office hours!.',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
            return;
        }

        //do some math to get the week the user requested
        const date = new Date(originalWeek);
        date.setDate(date.getDate() + 1);
        let dateDifference = date.getDay() - dates.indexOf(dateMod);
        date.setDate(date.getDate() - dateDifference);

        const exceptionData = {
            host: user.uid,
            location: locationMod,
            link: linkMod,
            date: dateMod,
            startTime: startTimeMod,
            endTime: endTimeMod,
            description: descriptionMod,
            queueEnabled: queueEnabledMod,
            dateChanged: date
        }

        uploadException(id, exceptionData);
        Swal.fire({
            title: 'Success!',
            text: 'Modification uploaded successfully.',
            icon: 'success'
        });
    }

    /**
     * Make sure they know what they are doing
     */
    async function confirmDelete(e) {
        e.preventDefault();

        let result = await Swal.fire({
            title: 'Warning!',
            text: 'Deleting an office hour can not be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel', 
            customClass: {
                confirmButton: 'custom-confirm-button', 
                cancelButton: 'custom-cancel-button'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            deleteOfficeHour(id);
            goto('/ta');
        }
    }

    onMount(async () => {
        await redirectIfNotLoggedIn();

        //make sure the user is on their own data!
        //we could show a modal here but the user could delete it and edit
        //data regardless. so just redirect instantly
        if (user.uid != page.data.host) {
            goto("/ta");
        }
    });
</script>

<style>
    .title {
        margin-bottom: -0.2em;
    }
</style>

<svelte:head>
    <title>Edit Office Hours</title>
    <link rel="stylesheet" href="/style/oh-form.css">
</svelte:head>
<Header />

<div class="title">
    Edit All Office Hours
</div>
<div class="subtitle">
    Edit information for an existing office hour, applying to all weeks
</div>
<br><br>
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
        <input type="text" id="location" name="location" bind:value={location} autocomplete="off">
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
        <label for="description">Description</label>
        <input type="text" id="description" name="description" bind:value={description} autocomplete="off" 
        placeholder="Homework 2 discussion, etc.">
    </div>
    <div class="queue-group">
        <label for="queue">Enable Queue?</label>
        <input type="checkbox" id="queue" name="queue" bind:checked={queueEnabled}>
    </div>
    <div class="button-container">
        <button type="submit" onclick={handleFormInput}>Save</button>
        <button onclick={(e) => {e.preventDefault(); if (ref == 'oh') goto('/office-hours/' + id); else goto('/ta')}}>Cancel</button>
        <button onclick={confirmDelete}>Delete</button>
    </div>
</form>


<br><br>
<div class="title">
    Change Office Hour
</div>
<div class="subtitle">
    Plan ahead--modify an office hour ahead of time
</div>
<div class="subtitle">
    Try to only use these when making one off time/date/location changes
</div>
<br><br>
<form>
    <div class="form-group">
        <label for="originalDate"><i>*</i>Week Of:</label>
        <input type="date" id="originalDate" name="originalDate" bind:value={originalWeek} autocomplete="off" placeholder="CSCI">
    </div>
    <small class="mt-[-0.5em]">Select a day from the week you wish to change</small>
    <div class="form-group">
        <label for="location"><i>*</i>Location:</label>
        <input type="text" id="location" name="location" bind:value={locationMod} autocomplete="off">
    </div>
    <div class="form-group">
        <label for="link">Link (if online):</label>
        <input type="url" id="link" name="link" bind:value={linkMod} autocomplete="off">
    </div>
    <!-- <div> -->
        <div class="form-group">
            <label for="date"><i>*</i>Day:</label>
            <select id="date" name="date" bind:value={dateMod}>
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
            </select>
        </div>
    <div class="form-group">
        <label for="start-time"><i>*</i>Start time:</label>
        <input type="time" id="start-time" name="start-time" bind:value={startTimeMod} autocomplete="off">
    </div>
    <div class="form-group">
        <label for="end-time"><i>*</i>End time:</label>
        <input type="time" id="end-time" name="end-time" bind:value={endTimeMod} autocomplete="off">
    </div>
    <div class="form-group">
        <label for="description">Description</label>
        <input type="text" id="description" name="description" bind:value={descriptionMod} autocomplete="off" 
        placeholder="Homework 2 discussion, etc.">
    </div>
    <div class="queue-group">
        <label for="queue">Enable Queue?</label>
        <input type="checkbox" id="queue" name="queue" bind:checked={queueEnabledMod}>
    </div>
    <div class="button-container">
        <button type="submit" onclick={handleModInput}>Save</button>
        <button>Cancel Office Hour</button>
    </div>
</form>
<br><br><br>
display previous edits to office hour here (automatically delete any after a certain time)