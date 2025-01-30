<script>
    import Header from "$lib/components/Header.svelte";
    import { redirectIfNotLoggedIn } from "$lib/db/auth";
    import { onMount } from "svelte";

    onMount(() => {
        redirectIfNotLoggedIn();
    });
</script>

<style>
    .title {
        font-size: 3em;
        margin-top: 2em;
    }

    input {
        width: 100%;
        border: 1px solid black;
        border-radius: 999px; 
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    }

    .search {
        display: flex;
        align-items: center;
    }

    .search input {
        padding: 0.25em 0.5em;
        padding-right: 2.3em;
    }
</style>
<Header />
<div class="w-full flex justify-center flex-col items-center">
    <h1 class="title">
        Current Office Hours
    </h1>
    <br>
    <div>
        Search to refine results
    </div>
    <div class="search">
        <input type="text" class="relative">
        <img src="/search.png" alt="Search" class="relative right-0 top-0 w-[1.3em] h-[1.3em] left-[-2em]">
    </div>
</div>