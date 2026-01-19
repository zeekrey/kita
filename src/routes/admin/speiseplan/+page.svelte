<script>
	import { goto, invalidateAll } from '$app/navigation';
	import {
		getWeekNumber,
		formatDateShort,
		addDays,
		formatDate,
		DAY_NAMES_SHORT
	} from '$lib/utils/date.js';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let selectedCell = $state(null);
	let editingMeal = $state(null);
	let mealDescription = $state('');

	const MEAL_TYPES = [
		{ id: 'fruehstueck', label: 'Frühstück', icon: '🌅' },
		{ id: 'mittagessen', label: 'Mittagessen', icon: '🍽️' },
		{ id: 'snack', label: 'Nachmittagssnack', icon: '🍎' }
	];

	const weekStart = $derived(new Date(data.weekStart));
	const weekEnd = $derived(new Date(data.weekEnd));
	const weekNumber = $derived(getWeekNumber(weekStart));

	const weekDays = $derived.by(() => {
		const days = [];
		for (let i = 0; i < 5; i++) {
			days.push(addDays(weekStart, i));
		}
		return days;
	});

	function getMealForCell(typ, date) {
		const dateStr = formatDate(date);
		return data.meals.find((m) => m.typ === typ && m.datum === dateStr);
	}

	function navigateWeek(direction) {
		const newDate = addDays(weekStart, direction * 7);
		goto(`?week=${formatDate(newDate)}`);
	}

	function goToToday() {
		goto('/admin/speiseplan');
	}

	function openAddForm(typ, date) {
		selectedCell = { typ, date: formatDate(date) };
		editingMeal = null;
		mealDescription = '';
	}

	function openEditForm(meal) {
		editingMeal = meal;
		selectedCell = null;
		mealDescription = meal.beschreibung;
	}

	function closeForm() {
		selectedCell = null;
		editingMeal = null;
		mealDescription = '';
	}

	async function handleCreate() {
		if (!mealDescription.trim()) return;

		const formData = new FormData();
		formData.append('datum', selectedCell.date);
		formData.append('typ', selectedCell.typ);
		formData.append('beschreibung', mealDescription);

		const response = await fetch('?/create', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			closeForm();
			invalidateAll();
		}
	}

	async function handleEdit() {
		if (!mealDescription.trim()) return;

		const formData = new FormData();
		formData.append('id', editingMeal.id);
		formData.append('beschreibung', mealDescription);

		const response = await fetch('?/edit', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			closeForm();
			invalidateAll();
		}
	}

	async function handleDelete() {
		const formData = new FormData();
		formData.append('id', editingMeal.id);

		const response = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			closeForm();
			invalidateAll();
		}
	}

	function getMealTypeLabel(typ) {
		return MEAL_TYPES.find((t) => t.id === typ)?.label || typ;
	}

	function getMealTypeIcon(typ) {
		return MEAL_TYPES.find((t) => t.id === typ)?.icon || '🍴';
	}
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-slate-800">Speiseplan</h1>
	</div>

	<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
		<div class="flex items-center justify-between border-b border-slate-200 p-4">
			<button
				onclick={() => navigateWeek(-1)}
				class="rounded-md bg-slate-100 px-3 py-2 text-sm transition-colors hover:bg-slate-200"
			>
				&larr; Vorherige
			</button>

			<div class="flex items-center gap-4">
				<span class="font-medium text-slate-800">
					KW {weekNumber}, {formatDateShort(weekStart)} - {formatDateShort(weekEnd)}
					{weekEnd.getFullYear()}
				</span>
				<button
					onclick={goToToday}
					class="rounded-md px-3 py-1 text-sm text-teal-600 transition-colors hover:bg-teal-50"
				>
					Heute
				</button>
			</div>

			<button
				onclick={() => navigateWeek(1)}
				class="rounded-md bg-slate-100 px-3 py-2 text-sm transition-colors hover:bg-slate-200"
			>
				Nächste &rarr;
			</button>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="bg-slate-50">
						<th class="w-40 px-4 py-3 text-left text-sm font-medium text-slate-600"> Mahlzeit </th>
						{#each weekDays as day, i (formatDate(day))}
							<th class="min-w-[140px] px-4 py-3 text-center text-sm font-medium text-slate-600">
								<div>{DAY_NAMES_SHORT[i]}</div>
								<div class="text-xs text-slate-400">{formatDateShort(day)}</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each MEAL_TYPES as mealType (mealType.id)}
						<tr class="border-t border-slate-100">
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									<span class="text-xl">{mealType.icon}</span>
									<span class="font-medium text-slate-800">{mealType.label}</span>
								</div>
							</td>
							{#each weekDays as day (formatDate(day))}
								{@const meal = getMealForCell(mealType.id, day)}
								<td class="relative px-2 py-2 text-center">
									{#if meal}
										<button
											onclick={() => openEditForm(meal)}
											class="w-full rounded-md bg-amber-50 px-2 py-2 text-left text-sm text-amber-900 transition-colors hover:bg-amber-100"
										>
											<span class="line-clamp-2">{meal.beschreibung}</span>
										</button>
										{#if editingMeal?.id === meal.id}
											<div
												class="absolute top-full left-1/2 z-10 mt-1 min-w-[280px] -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg"
											>
												<div class="space-y-4">
													<div class="font-medium text-slate-800">
														{getMealTypeIcon(meal.typ)}
														{getMealTypeLabel(meal.typ)} bearbeiten
													</div>
													<textarea
														bind:value={mealDescription}
														rows="3"
														class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
														placeholder="Beschreibung der Mahlzeit..."
													></textarea>
													<div class="flex justify-end gap-2">
														<button
															onclick={handleDelete}
															class="rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
														>
															Löschen
														</button>
														<button
															onclick={closeForm}
															class="rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
														>
															Abbrechen
														</button>
														<button
															onclick={handleEdit}
															class="rounded-md bg-teal-600 px-3 py-2 text-sm text-white transition-colors hover:bg-teal-700"
														>
															Speichern
														</button>
													</div>
												</div>
											</div>
										{/if}
									{:else}
										<button
											onclick={() => openAddForm(mealType.id, day)}
											class="w-full rounded-md border-2 border-dashed border-slate-200 px-2 py-3 text-slate-400 transition-colors hover:border-teal-400 hover:text-teal-600"
										>
											+
										</button>
										{#if selectedCell?.typ === mealType.id && selectedCell?.date === formatDate(day)}
											<div
												class="absolute top-full left-1/2 z-10 mt-1 min-w-[280px] -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg"
											>
												<div class="space-y-4">
													<div class="font-medium text-slate-800">
														{mealType.icon}
														{mealType.label} hinzufügen
													</div>
													<textarea
														bind:value={mealDescription}
														rows="3"
														class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
														placeholder="z.B. Vollkornbrot mit Käse und Gurke"
													></textarea>
													<div class="flex justify-end gap-2">
														<button
															onclick={closeForm}
															class="rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
														>
															Abbrechen
														</button>
														<button
															onclick={handleCreate}
															class="rounded-md bg-teal-600 px-3 py-2 text-sm text-white transition-colors hover:bg-teal-700"
														>
															Speichern
														</button>
													</div>
												</div>
											</div>
										{/if}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
