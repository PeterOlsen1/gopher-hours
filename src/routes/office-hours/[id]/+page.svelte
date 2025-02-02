<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { addToQueue, getSingleOfficeHour, getUserData, removeFromQueue } from "$lib/firebase/db";
    import { to12HourTime } from "$lib/utils/utils";
    import { redirectIfNotLoggedIn, user } from "$lib/firebase/auth";
    import { Timestamp } from "firebase/firestore";
    import Swal from "sweetalert2";

    const id = page.params.id;

    //testing data for now
    let loading = $state(false);
    let data = $state(page.data);
    let currentlyEditing = $state(false);


    async function handleQueueJoin() {
        for (const q of data.queue) {
            if (q.uid === user.uid) {
                Swal.fire({
                    title: 'Error!',
                    text: 'You are already in the queue.',
                    icon: 'error',
                    customClass: {
                        confirmButton: 'swal2-error-button'
                    },
                });
                return;
            }
        }
        loading = true;
        await addToQueue(id, user.uid);

        const nextIdx = data.queue.length + 1;
        const userCopy = user;
        userCopy.position = nextIdx;
        userCopy.queueTime = Timestamp.now();
        data.queue.push(userCopy); 
        loading = false;
    }
    
    function handleQueueRemove(removalId) {
        if (host || currentUid == removalId) {
            removeFromQueue(id, removalId);
            data.queue = data.queue.filter(q => q.uid !== removalId);
        }
        else {
            Swal.fire({
                title: 'Error!',
                text: 'You cannot remove others from the queue.',
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
        }
    } 

    function handleEditDescription() {
        if (currentlyEditing) {
            
        }
        
        currentlyEditing = !currentlyEditing;
    }

    let host = $state(false);
    let currentUid = $state("");
    onMount(async () => {
        await redirectIfNotLoggedIn();
        currentUid = user.uid;
        host = user.uid === data.host.uid;
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
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
        border: 1px solid black;
        padding: 1em 2em;
        border-radius: 1em;
        width: 50%;
    }

    .host-top {
        display: flex;
        justify-content: space-evenly;
        gap: 1em;
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
        text-wrap: wrap;
        text-align: left;
    }

    .queue {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
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
        gap: 1em;
    }

    .queue-item img {
        width: 5em;
        height: 5em;
        border-radius: 50%;
    }
</style>

<Header />

<svelte:head>
    <title>{data.department} {data.courseNumber} Office Hours</title>
</svelte:head>

<div class="title">
    {data.department} {data.courseNumber} Office Hours
</div>
<br>
<div class="main">
    <div class="host">
        <div class="host-top">
            <img src={data.host.photoURL} alt="host" />
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
    </div>

    {#if data.description}
        <div class="soft-title">Description</div>
        <div>
            {data.description}
        </div>
        {#if host}
            <button>Edit Description</button>
        {/if}
    {/if}
    <div class="queue">
        <div class="soft-title">Queue</div>
        {#each data.queue as q}
            <div class="queue-item">
                <b>{q.position}</b>
                <img src="{q.photoURL}" alt="{q.name}">
                <div>
                    <div>{q.name || q.displayName}</div>
                    <div>{q.email}</div>
                    <div><b>Queued at:</b> {q.queueTime.toDate().toLocaleTimeString()}</div>
                </div>
                {#if host || currentUid == q.uid}
                    <button onclick={() => handleQueueRemove(q.uid)}>Remove</button>
                {/if}
            </div>
        {/each}
        {#if data.queue.length == 0}
            <div>No students in queue</div>
        {/if}
        <div class="loading-spinner" style="display: {loading ? 'block' : 'none'}"></div>
        <button onclick={handleQueueJoin}>Join Queue</button>
    </div>

    <br><br><br>
    <div>
        chat?????
    </div>
</div>