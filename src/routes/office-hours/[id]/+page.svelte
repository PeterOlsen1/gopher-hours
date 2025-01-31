<script>
    import Header from "$lib/components/Header.svelte";
    import { page } from "$app/state";

    const id = page.params.id;
</script>

<Header />

<h1>Office Hours</h1>
id is {id}. do more with that later