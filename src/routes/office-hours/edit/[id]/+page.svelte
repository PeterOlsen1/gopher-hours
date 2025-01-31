<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { getSingleOfficeHour } from "$lib/firebase/db";
    import { redirectIfNotLoggedIn } from "$lib/firebase/auth";

    const id = page.params.id;
    let ohData;

    let department = $state("")
    let courseNumber = $state("")
    let location = $state("")
    let link = $state("")
    let date = $state("")
    let startTime = $state("")
    let endTime = $state("")
    let description = $state("");
    // department = "CSCI";
    // courseNumber = "4131";
    location = "Lind L103";
    link = "";
    date = "wednesday";
    startTime = "12:00";
    endTime = "14:00";

    async function handleFormInput(e) {
        e.preventDefault();

        console.log(startTime);
        //make fancy later
        if (!department || !courseNumber || !location || !date || !startTime || !endTime) {
            console.log('nonono');
            return;
        }

        //this is a stretch, but make sure they have the link if it's a zoom meeting
        if (location.toLowerCase().includes("zoom") || location.toLowerCase().includes("online") || location.toLowerCase().include("blended") && !link) {
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

    onMount(async () => {
        await redirectIfNotLoggedIn();
        ohData = await getSingleOfficeHour(id);
    });
</script>

<svelte:head>
    <title>Edit Office Hours</title>
    <link rel="stylesheet" src="/style/oh-form.css">
</svelte:head>
<Header />

<h1>Edit office hours</h1>
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