<script>
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';
    import { redirectIfNotLoggedIn } from '$lib/firebase/auth';

    onMount(() => {
        redirectIfNotLoggedIn();
    });
</script>

<Header />
<div class="w-full grid place-items-center">
    <br><br><br>
    <div style="font-size: 3em; font-weight: 500">
        This page does not exist.
    </div>
    <div>
        Head back <a href="/home" style="text-decoration: underline">home</a>.
    </div>
</div>