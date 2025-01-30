<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="w-full grid place-items-center">
	{@render children()}
</div>
