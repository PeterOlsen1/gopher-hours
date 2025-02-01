<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { getSingleOfficeHour } from "$lib/firebase/db";
    import { to12HourTime } from "$lib/utils/utils";

    const id = page.params.id;

    //testing data for now
    let data = $state({
    "department": "CSCI",
    "startTime": "12:00",
    "date": "wednesday",
    "host": {
        "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocIuL83tINGEnJFzMrilbAe4pENc4c7Nu0Ki5y04i70g6dONNIg=s96-c",
        "uid": "snVS969S9Uh6rgTRGsm8KiwivQr1",
        "email": "olse0321@umn.edu",
        "lastLogin": {
            "seconds": 1738348369,
            "nanoseconds": 479000000
        },
        "name": "Peter Olsen"
    },
    "courseNumber": "4131",
    "endTime": "14:00",
    "location": "Lind L103",
    "link": "",
    "description": "Homework 1 discussion"
});

    onMount(async () => {
        // data = await getSingleOfficeHour(id);
        // console.log(data);
    });
</script>

<style>
    .title {
        font-size: 3em;
        margin-top: 2em;
    }

    .main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .host {
        display: flex;
        justify-content: space-evenly;
        gap: 1em;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
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
</style>

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
            <div><b>Location:</b> {data.location}</div>
            <div><b>Time:</b> {to12HourTime(data.startTime)} - {to12HourTime(data.endTime)}</div>
        </div>
    </div>

    <div>
        add host options! (change description, time / location?)
    </div>
    <div>
        queue!
    </div>
    <div>
        chat?????
    </div>
</div>