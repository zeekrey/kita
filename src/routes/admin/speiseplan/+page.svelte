<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { getMonday, getWeekNumber, formatDateShort, addDays, formatDate, DAY_NAMES_SHORT } from '$lib/utils/date.js';

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
		return data.meals.find(m => m.typ === typ && m.datum === dateStr);
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
		return MEAL_TYPES.find(t => t.id === typ)?.label || typ;
	}

	function getMealTypeIcon(typ) {
		return MEAL_TYPES.find(t => t.id === typ)?.icon || '🍴';
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-slate-800">Speiseplan</h1>
	</div>

	<div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
		<div class="p-4 border-b border-slate-200 flex items-center justify-between">
			<button
				onclick={() => navigateWeek(-1)}
				class="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
			>
				&larr; Vorherige
			</button>

			<div class="flex items-center gap-4">
				<span class="font-medium text-slate-800">
					KW {weekNumber}, {formatDateShort(weekStart)} - {formatDateShort(weekEnd)} {weekEnd.getFullYear()}
				</span>
				<button
					onclick={goToToday}
					class="px-3 py-1 text-sm text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
				>
					Heute
				</button>
			</div>

			<button
				onclick={() => navigateWeek(1)}
				class="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
			>
				Nächste &rarr;
			</button>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="bg-slate-50">
						<th class="px-4 py-3 text-left text-sm font-medium text-slate-600 w-40">
							Mahlzeit
						</th>
						{#each weekDays as day, i (formatDate(day))}
							<th class="px-4 py-3 text-center text-sm font-medium text-slate-600 min-w-[140px]">
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
								<td class="px-2 py-2 text-center relative">
									{#if meal}
										<button
											onclick={() => openEditForm(meal)}
											class="w-full px-2 py-2 bg-amber-50 text-amber-900 rounded-md text-sm hover:bg-amber-100 transition-colors text-left"
										>
											<span class="line-clamp-2">{meal.beschreibung}</span>
										</button>
										{#if editingMeal?.id === meal.id}
											<div class="absolute top-full left-1/2 -translate-x-1/2 z-10 mt-1 bg-white rounded-lg shadow-lg p-4 min-w-[280px]">
												<div class="space-y-4">
													<div class="font-medium text-slate-800">
														{getMealTypeIcon(meal.typ)} {getMealTypeLabel(meal.typ)} bearbeiten
													</div>
													<textarea
														bind:value={mealDescription}
														rows="3"
														class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
														placeholder="Beschreibung der Mahlzeit..."
													></textarea>
													<div class="flex gap-2 justify-end">
														<button
															onclick={handleDelete}
															class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
														>
															Löschen
														</button>
														<button
															onclick={closeForm}
															class="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
														>
															Abbrechen
														</button>
														<button
															onclick={handleEdit}
															class="px-3 py-2 text-sm bg-teal-600 text-white hover:bg-teal-700 rounded-md transition-colors"
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
											class="w-full px-2 py-3 border-2 border-dashed border-slate-200 rounded-md text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-colors"
										>
											+
										</button>
										{#if selectedCell?.typ === mealType.id && selectedCell?.date === formatDate(day)}
											<div class="absolute top-full left-1/2 -translate-x-1/2 z-10 mt-1 bg-white rounded-lg shadow-lg p-4 min-w-[280px]">
												<div class="space-y-4">
													<div class="font-medium text-slate-800">
														{mealType.icon} {mealType.label} hinzufügen
													</div>
													<textarea
														bind:value={mealDescription}
														rows="3"
														class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
														placeholder="z.B. Vollkornbrot mit Käse und Gurke"
													></textarea>
													<div class="flex gap-2 justify-end">
														<button
															onclick={closeForm}
															class="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
														>
															Abbrechen
														</button>
														<button
															onclick={handleCreate}
															class="px-3 py-2 text-sm bg-teal-600 text-white hover:bg-teal-700 rounded-md transition-colors"
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
