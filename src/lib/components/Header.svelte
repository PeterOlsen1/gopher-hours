<script>
    import { ensureAuth, logout, signInWithGoogle, user } from "$lib/firebase/auth";
    import { onMount } from "svelte";
    
    let loggedIn = $state(true);
    let uid = $state(null);
    onMount(async () => {
        await ensureAuth();
        uid = user ? user.uid : null;
        loggedIn = !!user;
    })
</script>

<style>
    .maroon {
        background-color: rgb(112, 3, 3);
        background: linear-gradient(270deg, rgba(112,3,3,1) 0%, rgb(120, 4, 4) 100%);
        color: white;
        /* color: rgb(0, 0, 0); */
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .header {
        width: 95%;
        display: grid;
        grid-template-columns: 2fr 7fr;
        font-size: 1.25em;
        font-weight: 500;
        padding-top: 0.7em;
        padding-bottom: 0.7em;
        text-align: center;
    }

    .links {
        width: 100%;
        display: flex;
        /* justify-content: space-evenly; */
        justify-content: flex-end;
        gap: 1.5em;
        align-items: center;
    }

    .logout {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.7em;
    }

    .logout img {
        max-width: 1.3em;
        max-height: 1.3em;
    }

    .home img {
        max-width: 2em;
        max-height: 2em;
    }

    .old-gopher {
        height: 3em;
        filter: grayscale(1);
    }

    @media (width < 800px) {
        .links {
            gap: 0.75em;
        }

        .header {
            font-size: 0.7em;
        }
    }
</style>


<div class="w-full maroon flex justify-center">
    <div class="header">
        <div>
            <a href="/home">
                <!-- <img src="/logo.png" alt="old gopher" class="old-gopher"> -->
                 <b style="font-sioze">GopherHours.</b>
            </a>
        </div>
        <div class="links">
            <a href="/calendar">
                Calendar
            </a>
            {#if loggedIn}
                <a href="/user/{uid}">
                    Profile
                </a>
                <a href="/ta">
                    TA Menu
                </a>
                <div class="logout" onclick={logout}>
                    Logout
                    <img src="/logout.png" alt="log out arrow" style="filter: invert(1);">
                </div>
            {:else}
                <div onclick={signInWithGoogle} class="logout">
                    Login
                    <img src="/logout.png" alt="log out arrow" style="filter: invert(1); rotate: 180deg;">
                </div>
            {/if}
        </div>
    </div>
</div>