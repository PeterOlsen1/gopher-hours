<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(() => {
        goto("/home");
    });
</script>

<!-- 
    this isnt a page that exists, merely a route for conventional purposes.
    therefore, if someone tries to request here, send them back home!
    (since that's where the actual office hours are)
  -->