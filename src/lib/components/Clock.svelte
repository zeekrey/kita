<script>
	import { onMount } from 'svelte';

	let time = $state(new Date());

	const timeStr = $derived(
		time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
	);

	const dateStr = $derived(
		time.toLocaleDateString('de-DE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="text-center">
	<div class="text-6xl font-bold tracking-tight text-white">{timeStr}</div>
	<div class="mt-2 text-xl text-slate-300">{dateStr}</div>
</div>
