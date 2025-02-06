<script>
    import { logout } from "$lib/firebase/auth";
</script>

<style>
    .maroon {
        /* background-color: rgb(78, 2, 2); */
        background: url("/maroon.png");
        color: white;
    }

    .header {
        width: 95%;
        display: grid;
        grid-template-columns: 2fr 7fr;
        font-size: 1.5em;
        padding-top: 0.7em;
        padding-bottom: 0.7em;
        text-align: center;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
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
        width: 3em;
        height: 3em;
        background-color: white;
        border-radius: 0.1em;
    }

    @media (width < 800px) {
        .links {
            gap: 0.75em;
        }

        .header {
            font-size: 0.9em;
        }
    }
</style>

<!-- <div class="w-full">
    <div class="header">
        <a href="/home" class="home logout">
            <img src="/old-gopher.png" alt="Gopher">
            Home
        </a>
        <div class="links">
            <a href="/ta">
                TA Menu
            </a>
        </div>
        <div class="logout" onclick={logout}>
            Logout
            <img src="/logout.png" alt="log out arrow">
        </div>
    </div>
</div> -->


<div class="w-full maroon flex justify-center">
    <div class="header">
        <div>
            <img src="/gopher-comic.png" alt="old gopher" class="old-gopher">
        </div>
        <div class="links">
            <a href="/ta">
                TA Menu
            </a>
            <a href="/home" class="home">
                Home
            </a>
            <div class="logout" onclick={logout}>
                Logout
                <img src="/logout.png" alt="log out arrow" style="filter: invert(1);">
            </div>
        </div>
    </div>
</div>