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
		return data.meals.find(m => m.typ === type);
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

<div class="min-h-screen bg-[#1a1a2e] text-white p-6">
	<div class="max-w-[1920px] mx-auto h-full">
		<!-- Header -->
		<header class="mb-8 animate-fade-in" style="animation-delay: 0s">
			<div class="flex items-center justify-between">
				<h1 class="text-4xl font-bold text-white font-heading">Sonnenschein Kita</h1>
				<Clock />
			</div>
		</header>

		<!-- Main Grid -->
		<div class="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
			<!-- Announcements Column (Left) -->
			<section class="col-span-4 animate-fade-in" style="animation-delay: 0.1s">
				<div class="bg-[#16213e] rounded-2xl p-6 h-full flex flex-col">
					<h2 class="text-2xl font-bold mb-4 text-white font-heading flex items-center gap-2">
						<span>📢</span> Ankündigungen
					</h2>
					{#if data.announcements.length === 0}
						<div class="flex-1 flex items-center justify-center text-slate-400">
							<p>Keine Ankündigungen</p>
						</div>
					{:else}
						<div class="flex-1 overflow-y-auto space-y-4 pr-2">
							{#each data.announcements as announcement (announcement.id)}
								<div class="bg-[#0f3460] rounded-xl p-4 {announcement.prioritaet === 'wichtig' ? 'border-2 border-[#e94560]' : ''}">
									{#if announcement.prioritaet === 'wichtig'}
										<div class="flex items-center gap-2 mb-2">
											<span class="px-2 py-0.5 text-xs font-bold bg-[#e94560] text-white rounded uppercase">
												Wichtig
											</span>
										</div>
									{/if}
									<h3 class="font-bold text-lg text-white mb-2">{announcement.titel}</h3>
									<p class="text-slate-300 text-sm leading-relaxed">{announcement.nachricht}</p>
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
					<div class="bg-[#16213e] rounded-2xl p-6 h-full flex flex-col">
						<h2 class="text-2xl font-bold mb-4 text-white font-heading flex items-center gap-2">
							<span>🎂</span> Geburtstag heute
						</h2>
						{#if data.birthdayChildren.length === 0}
							<div class="flex-1 flex items-center justify-center text-slate-400">
								<p>Heute hat niemand Geburtstag</p>
							</div>
						{:else}
							<div class="flex-1 overflow-y-auto">
								<div class="grid gap-4">
									{#each data.birthdayChildren as child (child.id)}
										<div class="bg-gradient-to-r from-amber-500/20 to-pink-500/20 rounded-xl p-4 flex items-center gap-4 border border-amber-500/30">
											{#if child.fotoPath}
												<img
													src={child.fotoPath}
													alt=""
													class="w-16 h-16 rounded-full object-cover border-4 border-amber-400"
												/>
											{:else}
												<div class="w-16 h-16 rounded-full bg-amber-500/30 flex items-center justify-center text-2xl border-4 border-amber-400">
													🎈
												</div>
											{/if}
											<div>
												<p class="font-bold text-lg text-white">
													{child.vorname} {child.nachname}
												</p>
												<p class="text-amber-300">
													wird heute {calculateAge(child.geburtstag)} Jahre alt!
												</p>
												{#if child.gruppeName}
													<span
														class="inline-block mt-1 px-2 py-0.5 text-xs rounded text-white"
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
					<div class="bg-[#16213e] rounded-2xl p-6">
						<h2 class="text-2xl font-bold mb-4 text-white font-heading flex items-center gap-2">
							<span>🍴</span> Speiseplan heute
						</h2>
						{#if data.meals.length === 0}
							<div class="text-slate-400 text-center py-4">
								<p>Kein Speiseplan eingetragen</p>
							</div>
						{:else}
							<div class="space-y-3">
								{#each ['fruehstueck', 'mittagessen', 'snack'] as mealType (mealType)}
									{@const meal = getMealByType(mealType)}
									{@const mealInfo = MEAL_TYPES[mealType]}
									<div class="bg-[#0f3460] rounded-xl p-4 flex items-start gap-3">
										<span class="text-2xl">{mealInfo.icon}</span>
										<div>
											<p class="font-semibold text-white">{mealInfo.label}</p>
											<p class="text-slate-300 text-sm">
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
					<div class="bg-[#16213e] rounded-2xl p-6 h-full flex flex-col">
						<h2 class="text-2xl font-bold mb-4 text-white font-heading flex items-center gap-2">
							<span>👩‍🏫</span> Heute anwesend
						</h2>
						{#if data.teachersOnDuty.length === 0}
							<div class="flex-1 flex items-center justify-center text-slate-400">
								<p>Aktuell niemand im Dienst</p>
							</div>
						{:else}
							<div class="flex-1 overflow-y-auto">
								<div class="grid grid-cols-2 gap-3">
									{#each data.teachersOnDuty as teacher (teacher.id)}
										<div class="bg-[#0f3460] rounded-xl p-3 flex items-center gap-3">
											{#if teacher.erzieherFotoPath}
												<img
													src={teacher.erzieherFotoPath}
													alt=""
													class="w-12 h-12 rounded-full object-cover"
												/>
											{:else}
												<div class="w-12 h-12 rounded-full bg-teal-500/30 flex items-center justify-center text-lg text-teal-300">
													{teacher.erzieherVorname[0]}{teacher.erzieherNachname[0]}
												</div>
											{/if}
											<div>
												<p class="font-medium text-white text-sm">
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
		<div class="fixed bottom-4 right-4 flex items-center gap-2 text-slate-500 text-sm">
			<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
