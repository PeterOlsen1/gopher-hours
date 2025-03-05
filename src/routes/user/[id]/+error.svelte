<script>
    import Header from "$lib/components/Header.svelte";
</script>

<Header></Header>
<div class="w-full grid place-items-center">
    <br><br><br>
    <div style="font-size: 3em; font-weight: 500">
        User not found
    </div>
    <div>
        The requested user does not exist.
    </div>
    <div>
        Head back <a href="/home" style="text-decoration: underline">home</a>.
    </div>
</div>