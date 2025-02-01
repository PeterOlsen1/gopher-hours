<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { addToQueue, getSingleOfficeHour } from "$lib/firebase/db";
    import { to12HourTime } from "$lib/utils/utils";
    import { redirectIfNotLoggedIn, user } from "$lib/firebase/auth";

    const id = page.params.id;

    //testing data for now
    let data = $state({
        "startTime": "12:00",
        "department": "CSCI",
        "endTime": "14:00",
        "courseNumber": "4131",
        "queue": [
            {
                "currentlyQueued": true,
                "email": "olse0321@umn.edu",
                "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocIuL83tINGEnJFzMrilbAe4pENc4c7Nu0Ki5y04i70g6dONNIg=s96-c",
                "name": "Peter Olsen",
                "uid": "snVS969S9Uh6rgTRGsm8KiwivQr1",
                "queuedFor": "WItfOqt5ntizeg27kYhB",
                "lastLogin": {
                    "seconds": 1738348369,
                    "nanoseconds": 479000000
                }
            }
        ],
        "link": "",
        "host": {
            "name": "Peter Olsen",
            "email": "olse0321@umn.edu",
            "uid": "snVS969S9Uh6rgTRGsm8KiwivQr1",
            "lastLogin": {
                "seconds": 1738348369,
                "nanoseconds": 479000000
            },
            "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocIuL83tINGEnJFzMrilbAe4pENc4c7Nu0Ki5y04i70g6dONNIg=s96-c"
        },
        "location": "Lind L103",
        "description": "Homework 1 discussion",
        "date": "wednesday"
    });

    function handleQueueJoin() {
        console.log("join queue");
        addToQueue(id, user.uid);
    }

    let queue = $state([]);
    onMount(async () => {
        await redirectIfNotLoggedIn();
        // data = await getSingleOfficeHour(id);
        // console.log(data);
    });
</script>

<style>
    .title {
        font-size: 3em;
        margin-top: 2em;
    }

    .soft-title {
        font-size: 2em;
        margin-top: 0.5em;
    }

    .main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: 100%;
    }

    .host {
        display: flex;
        justify-content: space-evenly;
        gap: 1em;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
        border: 1px solid black;
        padding: 1em 2em;
        border-radius: 1em;
        width: 50%;
    }

    .host img {
        width: 8em;
        height: 8em;
        border-radius: 50%;
    }

    .host-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5em;
    }

    .queue-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5em 1em;
        border: 1px solid black;
        border-radius: 1em;
        margin: 0.5em;
    }
</style>

<svelte:head>
    <title>{data.department} {data.courseNumber} Office Hours</title>
</svelte:head>
<Header />

<div class="title">
    {data.department} {data.courseNumber} Office Hours
</div>
<br>
<div class="main">
    <div class="host">
        <img src={data.host.photoURL} alt="host photo" />
        <div class="host-info">
            <div><b>TA:</b> {data.host.name}</div>
            <div><b>Email:</b> {data.host.email}</div>
        </div>
        <div class="host-info"> 
            {#if data.link} 
                <div><a href="{data.link}"><b>Location:</b></a> {data.location}</div>
            {:else}
                <div><b>Location:</b> {data.location}</div>
            {/if}
            <div><b>Time:</b> {to12HourTime(data.startTime)} - {to12HourTime(data.endTime)}</div>
        </div>
    </div>

    {#if user.uid === data.host.uid}
        <div>
            Host controls!!!!
        </div>
    {/if}
    <div class="queue">
        <div class="soft-title">Queue</div>
        {#each data.queue as q}
            <div class="queue-item">
                <img src="{q.photoUrl}" alt="{q.name}">
            </div>
        {/each}
        {#if data.queue.length == 0}
            <div>No students in queue</div>
        {/if}
        <button onclick={handleQueueJoin}>Join Queue</button>
    </div>

    <br><br><br>
    <div>
        chat?????
    </div>
</div>