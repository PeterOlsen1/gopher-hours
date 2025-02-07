<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { addToQueue, getOfficeHourListener, getSingleOfficeHour, getUserData, removeFromQueue, updateOfficeHourDescription } from "$lib/firebase/db";
    import { to12HourTime } from "$lib/utils/utils";
    import { redirectIfNotLoggedIn, user } from "$lib/firebase/auth";
    import { Timestamp } from "firebase/firestore";
    import Swal from "sweetalert2";
    import { addNewChatMessage, getChatListener } from "$lib/firebase/chat";

    const id = page.params.id;

    let loading = $state(false);
    let data = $state(page.data);
    let currentlyEditing = $state(false);
    let chatMessage = $state("testing chat");
    let host = $state(false);
    let currentUid = $state("");
    let descriptionText = $state("");


    /**
     * Function to handle a queue join
     */
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
        loading = false;
    }
    
    /**
     * Function to handle a queue removal
     * 
     * @param removalId userId to remove from queue
     */
    function handleQueueRemove(removalId) {
        if (host || currentUid == removalId) {
            removeFromQueue(id, removalId);
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

    /**
     * Function to handle editing the description
     */
    function handleEditDescription() {
        if (currentlyEditing) {
            updateOfficeHourDescription(id, descriptionText);
        }
        currentlyEditing = !currentlyEditing;
    }
    
    /**
     * Function to handle an incoming chat message
     * 
     * @param messages
     */
    function handleChatMessage(messages) {
        console.log(messages);
    }

    onMount(async () => {
        await redirectIfNotLoggedIn();
        currentUid = user.uid;
        host = user.uid === data.host.uid;

        //get subscribers so we can have live-updating data
        const unsubscribeChat = getChatListener(id, handleChatMessage);
        const unsunscribeQueue = getOfficeHourListener(id, (returnedData) => {
            data = returnedData;
            descriptionText = data.description;
            data.queue.forEach((q, idx) => {
                q.position = idx + 1;
            });
        });

        // remove subscribers on unmount
        return () => {
            unsubscribeChat();
            unsunscribeQueue();
        };
    });
</script>

<style>
/* moved to oh-single.css for length purposes */
</style>

<Header />

<svelte:head>
    <title>{data.department} {data.courseNumber} Office Hours</title>
    <link rel="stylesheet" href="/style/oh-single.css">
</svelte:head>

<div class="title">
    {data.department} {data.courseNumber} Office Hours
</div>
<br>
<div class="main">
    <div class="host">
        <img src={data.host.photoURL} alt="host" />
        <div class="host-info info-1">
            <div><b>TA:</b> {data.host.name}</div>
            <div><b>Email:</b> {data.host.email}</div>
        </div>
        <div class="host-info info-2"> 
            {#if data.link} 
                <div><a href="{data.link}"><b>Location:</b></a> {data.location}</div>
            {:else}
                <div><b>Location:</b> {data.location}</div>
            {/if}
            <div><b>Time:</b> {to12HourTime(data.startTime)} - {to12HourTime(data.endTime)}</div>
        </div>
    </div>

    {#if data.description}
        <div class="w-full">
            <div class="soft-title">Description</div>
            <div class="description" style="display: {currentlyEditing ? 'none' : 'block'}">
                {data.description}
            </div>
        </div>
    {/if}

    <!-- give host the magic description editing button -->
    {#if host}
        <input type="text" bind:value={descriptionText}
        style="display: {currentlyEditing ? 'block' : 'none'}">
        <button onclick={handleEditDescription}>
            {currentlyEditing ? "Save" : "Edit Description"}
        </button>
    {/if}
    <div class="queue">
        <div class="soft-title">Queue</div>
        {#each data.queue as q}
            <div class="queue-item">
                <b>{q.position}</b>
                <img src="{q.photoURL}" alt="{q.name}">
                <div class="queue-item-info">
                    <div>{q.name || q.displayName}</div>
                    <div>{q.email}</div>
                    <div><b>Queued at:</b> {q.queueTime.toDate().toLocaleTimeString()}</div>
                </div>
                {#if host || currentUid == q.uid}
                    <button onclick={() => handleQueueRemove(q.uid)}>Remove</button>
                {/if}
            </div>
        {/each}
        {#if data.queue && data.queue.length == 0}
            <div>No students in queue</div>
        {/if}
        <div class="loading-spinner" style="display: {loading ? 'block' : 'none'}"></div>
        <button onclick={handleQueueJoin}>Join Queue</button>
    </div>

    <br><br><br>
    <div>
        <input type="text" bind:value={chatMessage} 
        placeholder="Send a message to the room...">
        <button onclick={() => addNewChatMessage(id, user, chatMessage)}>Send</button>
    </div>
</div>