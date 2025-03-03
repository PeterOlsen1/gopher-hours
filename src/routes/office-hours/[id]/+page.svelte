<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { addToFavorites, addToQueue, getOfficeHourListener, getSingleOfficeHour, getUserData, getUserDataCache, removeFromFavorites, removeFromQueue, updateOfficeHourDescription } from "$lib/firebase/db";
    import { to12HourTime } from "$lib/utils/utils";
    import { ensureAuth, redirectIfNotLoggedIn, signInWithGoogle, user } from "$lib/firebase/auth";
    import { Timestamp } from "firebase/firestore";
    import Swal from "sweetalert2";
    import { addNewChatMessage, getChatListener } from "$lib/firebase/chat";
    import QRCode from "qrcode";

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    const id = page.params.id;
    const hostData = page.data.host;

    let code;
    let chatbox;
    let googleCalendarLink = $state('');
    let favorited = $state(false);
    let loading = $state(false);
    let data = $state(page.data);
    let chatMessage = $state("");
    let host = $state(false);
    let currentUid = $state("");
    let descriptionText = $state("");
    let chat = $state([]);
    let codeShown = $state(false);


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

        const userData = await getUserData(user.uid);
        if (userData.queuedFor) {
            const queueData = await getSingleOfficeHour(userData.queuedFor);

            //case where the office hour was deleted but the user is still queued
            if (!queueData) {
                loading = true;
                await addToQueue(id, user.uid);
                loading = false;
                return;
            }

            Swal.fire({
                title: 'Error!',
                text: `You are already in the queue for ${queueData.department} ${queueData.courseNumber}.`,
                icon: 'error',
                customClass: {
                    confirmButton: 'swal2-error-button'
                },
            });
            return;
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
     * Function to handle an incoming chat message
     * 
     * @param messages
     */
    function handleChatMessage(messages) {
        console.log(messages.length);
        messages.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
        chat = messages;
    }

    function handleChatKeyPress(e) {
        if (e.key === "Enter") {
            addNewChatMessage(id, user, chatMessage);
            chatMessage = "";
        }
    }

    function toggleQR() {
        codeShown = !codeShown;
        QRCode.toCanvas(code, window.location.href, { errorCorrectionLevel: 'H' });
    }

    function updateFavorite() {
        if (favorited) {
            removeFromFavorites(id);
        }
        else {
            addToFavorites(id);
        }
        favorited = !favorited;
    }

    onMount(async () => {
        if (window.innerWidth >= 800 && window.innerHeight >= 800) {
            let windowHeight = window.innerHeight;
            let chatboxTop = chatbox.getBoundingClientRect().top;
            chatbox.style.height = `calc(${windowHeight - chatboxTop}px)`;
        }
        else if (window.innerHeight >= 800) {
            let windowHeight = window.innerHeight;
            let chatboxTop = chatbox.getBoundingClientRect().top;
            chatbox.style.minHeight = `calc(${windowHeight - chatboxTop}px)`;
        }

        await ensureAuth();
        currentUid = user ? user.uid : "";
        host = currentUid === data.host.uid;
        
        if (currentUid) {
            //update if it is favorited
            const currentUserData = await getUserDataCache(currentUid);
            if (currentUserData.favorites.includes(id)) {
                favorited = true;
            }
        }

        //generate google calendar link
        const ohDayIdx = days.indexOf(page.data.date);
        console.log(ohDayIdx);
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + (ohDayIdx - startTime.getDay() + 7) % 7);
        startTime.setHours(data.startTime.split(":")[0]);
        startTime.setMinutes(data.startTime.split(":")[1]);
        startTime.setSeconds(0);

        const endTime = new Date(startTime);
        endTime.setHours(data.endTime.split(":")[0]);
        endTime.setMinutes(data.endTime.split(":")[1]);
        endTime.setSeconds(0);

        //some magic
        googleCalendarLink = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${page.data.department}+${page.data.courseNumber}+Office+Hours
&dates=${startTime.toISOString().replace(/-|:|\.\d+/g, '')}%2F${endTime.toISOString().replace(/-|:|\.\d+/g, '')}
&details=${page.data.description}&location=${page.data.location}`;

        //get subscribers so we can have live-updating data
        const unsubscribeChat = getChatListener(id, handleChatMessage);
        const unsunscribeQueue = getOfficeHourListener(id, (returnedData) => {
            //dont update this if the host made an exception
            if (!page.data.exception) {
                data = returnedData;
                data.host = hostData;
                descriptionText = data.description;
            }
            else {
                data.queue = returnedData.queue;
            }

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
/* svelte freaks out if we remove this. so just dont i guess */
</style>

<Header />

<svelte:head>
    <title>{data.department} {data.courseNumber} Office Hours</title>
    <link rel="stylesheet" href="/style/oh-single.css">
</svelte:head>

<div class="title">
    <div>
        {data.department} {data.courseNumber} Office Hours
    </div>
    {#if currentUid}
        {#if favorited}
            <img src='/bookmark.svg' alt="remove bookmark" onclick={updateFavorite}>
        {:else}
            <img src='/bookmark-outline.svg' alt="bookmark" onclick={updateFavorite}>
        {/if}
    {/if}
</div>
{#if data.exception}
    <div class="subtitle">
        <b style="color: red">*</b>This week's office hour was updated from its original schedule.
    </div>
{/if}
<a href={googleCalendarLink} class="subtitle" target="_blank" style="text-decoration: underline;">
    Add to Google Calendar
</a>
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
                <div>
                    <a href="{data.link}" target="_blank">
                        <b>Location:</b>
                        <span style="text-decoration: underline">
                            {data.location}
                        </span>
                    </a>
                </div>
            {:else}
                <div><b>Location:</b> {data.location}</div>
            {/if}
            <div><b>Time:</b> {to12HourTime(data.startTime)} - {to12HourTime(data.endTime)}</div>
        </div>
    </div>

    {#if host}
        <a href="/office-hours/edit/{id}?ref=oh">
            <button>
                Edit Office Hour
            </button>
        </a>
    {/if}

    {#if data.description}
        <div class="w-full">
            <div class="soft-title">Description</div>
            <div class="description">
                {data.description}
            </div>
        </div>
    {/if}

    <!-- {#if host}
        <button onclick={toggleQR}>{
            codeShown ? "Hide QR Code"
            : "Show QR Code"}
        </button>
    {/if} -->
    {#if page.data.queueEnabled}
        <canvas id="canvas" bind:this={code} style="display: {codeShown ? 'block' : 'none'}"></canvas>
        <div class="soft-title" style="margin-bottom: 0">Queue</div>
        <div class="queue">
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
        </div>
        {#if !currentUid}
            <button onclick={signInWithGoogle}>Login to queue!</button>
        {:else}
            <button onclick={handleQueueJoin}>Join Queue</button>
        {/if}
    {/if}
    <br class="flex-1">
    <div class="chatbox" bind:this={chatbox}>
        <div class="chatbox-upper">
            {#each chat as msg}
                {#if msg.userData.uid == user.uid}
                    <div class="message right">
                        <div class="chat-message-text">
                            {msg.message}
                        </div>
                        <img src="{msg.userData.photoURL}" alt="user">
                    </div>
                    <div class="timestamp-right">
                        {msg.timestamp.toDate().toLocaleTimeString()}
                    </div>
                {:else}
                    <div class="message left">
                        <img src="{msg.userData.photoURL}" alt="user">
                        <div class="chat-message-text">
                            {msg.message}
                        </div>
                    </div>
                    <div class="timestamp-left">
                        {msg.timestamp.toDate().toLocaleTimeString()}
                    </div>
                {/if}
            {/each}
            {#if !chat.length}
                <div class="no-messages">No messages yet!</div>
            {/if}
        </div>
        {#if !currentUid}
            <button onclick={signInWithGoogle}>Login to chat!</button>
        {:else}
            <div class="chat-input">
                <input type="text" bind:value={chatMessage} onkeypress={handleChatKeyPress}
                placeholder="Send a message to the room...">
                <img src="/send.png" alt="send" class="send-button"
                onclick={() => {addNewChatMessage(id, user, chatMessage); chatMessage = ""}}>
            </div>
        {/if}
        <small style="margin-top: -1em">
            Messages are automatically deleted after 24 hours.
        </small>
    </div>
</div>