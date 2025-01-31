<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(() => {
        goto("/ta");
    });
</script>

<!-- 
    this isnt a page that exists, merely a route for conventional purposes.
    therefore, if someone tries to request here, send them back to the TA menu
    (since that's where your own office hours are)!
  -->