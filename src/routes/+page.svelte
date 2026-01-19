<script>
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Clock from '$lib/components/Clock.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const MEAL_TYPES = {
		fruehstueck: { label: 'Frühstück', icon: '🌅' },
		mittagessen: { label: 'Mittagessen', icon: '🍽️' },
		snack: { label: 'Nachmittagssnack', icon: '🍎' }
	};

	function calculateAge(birthday) {
		const today = new Date();
		const birth = new Date(birthday);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	}

	function getMealByType(type) {
		return data.meals.find((m) => m.typ === type);
	}

	onMount(() => {
		// Auto-refresh every 30 seconds
		const interval = setInterval(() => {
			invalidateAll();
		}, 30000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Kita Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-[#1a1a2e] p-6 text-white">
	<div class="mx-auto h-full max-w-[1920px]">
		<!-- Header -->
		<header class="animate-fade-in mb-8" style="animation-delay: 0s">
			<div class="flex items-center justify-between">
				<h1 class="font-heading text-4xl font-bold text-white">Sonnenschein Kita</h1>
				<Clock />
			</div>
		</header>

		<!-- Main Grid -->
		<div class="grid h-[calc(100vh-200px)] grid-cols-12 gap-6">
			<!-- Announcements Column (Left) -->
			<section class="animate-fade-in col-span-4" style="animation-delay: 0.1s">
				<div class="flex h-full flex-col rounded-2xl bg-[#16213e] p-6">
					<h2 class="font-heading mb-4 flex items-center gap-2 text-2xl font-bold text-white">
						<span>📢</span> Ankündigungen
					</h2>
					{#if data.announcements.length === 0}
						<div class="flex flex-1 items-center justify-center text-slate-400">
							<p>Keine Ankündigungen</p>
						</div>
					{:else}
						<div class="flex-1 space-y-4 overflow-y-auto pr-2">
							{#each data.announcements as announcement (announcement.id)}
								<div
									class="rounded-xl bg-[#0f3460] p-4 {announcement.prioritaet === 'wichtig'
										? 'border-2 border-[#e94560]'
										: ''}"
								>
									{#if announcement.prioritaet === 'wichtig'}
										<div class="mb-2 flex items-center gap-2">
											<span
												class="rounded bg-[#e94560] px-2 py-0.5 text-xs font-bold text-white uppercase"
											>
												Wichtig
											</span>
										</div>
									{/if}
									<h3 class="mb-2 text-lg font-bold text-white">{announcement.titel}</h3>
									<p class="text-sm leading-relaxed text-slate-300">{announcement.nachricht}</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</section>

			<!-- Center Column -->
			<div class="col-span-4 flex flex-col gap-6">
				<!-- Birthdays -->
				<section class="animate-fade-in flex-1" style="animation-delay: 0.2s">
					<div class="flex h-full flex-col rounded-2xl bg-[#16213e] p-6">
						<h2 class="font-heading mb-4 flex items-center gap-2 text-2xl font-bold text-white">
							<span>🎂</span> Geburtstag heute
						</h2>
						{#if data.birthdayChildren.length === 0}
							<div class="flex flex-1 items-center justify-center text-slate-400">
								<p>Heute hat niemand Geburtstag</p>
							</div>
						{:else}
							<div class="flex-1 overflow-y-auto">
								<div class="grid gap-4">
									{#each data.birthdayChildren as child (child.id)}
										<div
											class="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-pink-500/20 p-4"
										>
											{#if child.fotoPath}
												<img
													src={child.fotoPath}
													alt=""
													class="h-16 w-16 rounded-full border-4 border-amber-400 object-cover"
												/>
											{:else}
												<div
													class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-500/30 text-2xl"
												>
													🎈
												</div>
											{/if}
											<div>
												<p class="text-lg font-bold text-white">
													{child.vorname}
													{child.nachname}
												</p>
												<p class="text-amber-300">
													wird heute {calculateAge(child.geburtstag)} Jahre alt!
												</p>
												{#if child.gruppeName}
													<span
														class="mt-1 inline-block rounded px-2 py-0.5 text-xs text-white"
														style="background-color: {child.gruppeFarbe}"
													>
														{child.gruppeName}
													</span>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</section>
			</div>

			<!-- Right Column -->
			<div class="col-span-4 flex flex-col gap-6">
				<!-- Meals -->
				<section class="animate-fade-in" style="animation-delay: 0.3s">
					<div class="rounded-2xl bg-[#16213e] p-6">
						<h2 class="font-heading mb-4 flex items-center gap-2 text-2xl font-bold text-white">
							<span>🍴</span> Speiseplan heute
						</h2>
						{#if data.meals.length === 0}
							<div class="py-4 text-center text-slate-400">
								<p>Kein Speiseplan eingetragen</p>
							</div>
						{:else}
							<div class="space-y-3">
								{#each ['fruehstueck', 'mittagessen', 'snack'] as mealType (mealType)}
									{@const meal = getMealByType(mealType)}
									{@const mealInfo = MEAL_TYPES[mealType]}
									<div class="flex items-start gap-3 rounded-xl bg-[#0f3460] p-4">
										<span class="text-2xl">{mealInfo.icon}</span>
										<div>
											<p class="font-semibold text-white">{mealInfo.label}</p>
											<p class="text-sm text-slate-300">
												{meal ? meal.beschreibung : '—'}
											</p>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</section>

				<!-- Teachers on Duty -->
				<section class="animate-fade-in flex-1" style="animation-delay: 0.4s">
					<div class="flex h-full flex-col rounded-2xl bg-[#16213e] p-6">
						<h2 class="font-heading mb-4 flex items-center gap-2 text-2xl font-bold text-white">
							<span>👩‍🏫</span> Heute anwesend
						</h2>
						{#if data.teachersOnDuty.length === 0}
							<div class="flex flex-1 items-center justify-center text-slate-400">
								<p>Aktuell niemand im Dienst</p>
							</div>
						{:else}
							<div class="flex-1 overflow-y-auto">
								<div class="grid grid-cols-2 gap-3">
									{#each data.teachersOnDuty as teacher (teacher.id)}
										<div class="flex items-center gap-3 rounded-xl bg-[#0f3460] p-3">
											{#if teacher.erzieherFotoPath}
												<img
													src={teacher.erzieherFotoPath}
													alt=""
													class="h-12 w-12 rounded-full object-cover"
												/>
											{:else}
												<div
													class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/30 text-lg text-teal-300"
												>
													{teacher.erzieherVorname[0]}{teacher.erzieherNachname[0]}
												</div>
											{/if}
											<div>
												<p class="text-sm font-medium text-white">
													{teacher.erzieherVorname}
												</p>
												<p class="text-xs text-slate-400">
													{teacher.startZeit} - {teacher.endZeit}
												</p>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</section>
			</div>
		</div>

		<!-- Refresh Indicator -->
		<div class="fixed right-4 bottom-4 flex items-center gap-2 text-sm text-slate-500">
			<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
			<span>Auto-Aktualisierung aktiv</span>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.5s ease-out forwards;
		opacity: 0;
	}

	.font-heading {
		font-family: var(--font-heading);
	}
</style>
