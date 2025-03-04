<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";
    import { onMount, tick } from "svelte";
    import { getUserData, updateUserData } from "$lib/firebase/db";
    import { ensureAuth, user } from "$lib/firebase/auth";
    import OfficeHour from "$lib/components/OfficeHour.svelte";
    import Swal from "sweetalert2";

    let owner = $state(false);
    const id = page.params.id;
    const data = page.data;
    let dataCopy = $state(JSON.parse(JSON.stringify(data)));
    console.log(data);

    let name = $state(data.name);
    let description = $state(data.description);
    let photoURL = $state(data.photoURL);

    async function handleSubmit(e) {
        e.preventDefault();
        
        const oh = data.officeHours;
        delete data.officeHours;
        await updateUserData(id, data);
        data.officeHours = oh;

        dataCopy.name = name;
        dataCopy.description = description;
        dataCopy.photoURL = photoURL;

        dataCopy = JSON.parse(JSON.stringify(dataCopy));

        await Swal.fire({
            title: 'Success!',
            text: 'Profile updated successfully.',
            icon: 'success'
        });
        tick();
    }

    onMount(async () => {
        await ensureAuth();
        owner = id == user.uid;
    });
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 50px;
    }

    h1 {
        font-size: 2em;
        font-weight: bold;
    }

    img {
        width: 12.5em;
        height: 12.5em;
        border-radius: 50%;
    }
    
    .info {
        max-width: 20em;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }

    @media (width < 800px) {
        img {
            width: 10em;
            height: 10em;
        }

        h1 {
            font-size: 1.5em;
        }

        .container {
            font-size: 0.8em;
        }
    }
</style>

<svelte:head>
    <title>User Profile - {dataCopy.name}</title>
    <link rel="stylesheet" href="/style/oh-form.css">
</svelte:head>
<Header></Header>

<div class="container">
    <div class="flex gap-4">
        <img src={dataCopy.photoURL} alt="{dataCopy.name}">
        <br>
        <div class="info">
            <h1>{dataCopy.name}</h1>
            <div>
                <span class="font-bold">Email:</span> {dataCopy.email}
            </div>
            <div>
                <span class="font-bold">Description:</span> {dataCopy.description ? dataCopy.description : "No description provided"}
            </div>
        </div>
    </div>

    {#if owner}
        <div class="subtitle">
            Edit profile
        </div>
        <form>
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" bind:value={data.name} autocomplete="off">
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <input id="description" name="description" rows="4" bind:value={data.description} autocomplete="off">
            </div>
            <div class="form-group">
                <label for="photoURL">Photo URL</label>
                <input type="text" id="photoURL" name="photoURL" bind:value={data.photoURL} autocomplete="off">
            </div>
            <button type="submit" onclick={handleSubmit}>Save</button>

        </form>
    {/if}

    <br><br><br>
    {#each data.officeHours as course}
        <OfficeHour oh={course} menu={'user'}  />
    {/each}
</div>