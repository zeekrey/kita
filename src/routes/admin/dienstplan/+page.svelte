<script>
	import { goto, invalidateAll } from '$app/navigation';
	import TimeSlotPicker from '$lib/components/TimeSlotPicker.svelte';
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
	let editingEntry = $state(null);

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

	function getScheduleForCell(teacherId, date) {
		const dateStr = formatDate(date);
		return data.schedules.find((s) => s.erzieherId === teacherId && s.datum === dateStr);
	}

	function navigateWeek(direction) {
		const newDate = addDays(weekStart, direction * 7);
		goto(`?week=${formatDate(newDate)}`);
	}

	function goToToday() {
		goto('/admin/dienstplan');
	}

	function openAddPicker(teacherId, date) {
		selectedCell = { teacherId, date: formatDate(date) };
		editingEntry = null;
	}

	function openEditPicker(entry) {
		editingEntry = entry;
		selectedCell = null;
	}

	function closePicker() {
		selectedCell = null;
		editingEntry = null;
	}

	async function handleCreate(formData) {
		const response = await fetch('?/create', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			closePicker();
			invalidateAll();
		}
	}

	async function handleEdit(formData) {
		const response = await fetch('?/edit', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			closePicker();
			invalidateAll();
		}
	}

	async function handleDelete(id) {
		const formData = new FormData();
		formData.append('id', id);
		const response = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			closePicker();
			invalidateAll();
		}
	}

	function formatTimeRange(start, end) {
		return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
	}
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-slate-800">Dienstplan</h1>
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

		{#if data.teachers.length === 0}
			<div class="p-8 text-center text-slate-500">
				<p>Noch keine Erzieher vorhanden.</p>
				<a href="/admin/erzieher" class="mt-2 inline-block text-teal-600 hover:underline">
					Erzieher hinzufügen
				</a>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="bg-slate-50">
							<th class="w-48 px-4 py-3 text-left text-sm font-medium text-slate-600">
								Erzieher/in
							</th>
							{#each weekDays as day, i (formatDate(day))}
								<th class="min-w-[120px] px-4 py-3 text-center text-sm font-medium text-slate-600">
									<div>{DAY_NAMES_SHORT[i]}</div>
									<div class="text-xs text-slate-400">{formatDateShort(day)}</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data.teachers as teacher (teacher.id)}
							<tr class="border-t border-slate-100">
								<td class="px-4 py-3">
									<div class="flex items-center gap-3">
										{#if teacher.fotoPath}
											<img
												src={teacher.fotoPath}
												alt=""
												class="h-8 w-8 rounded-full object-cover"
											/>
										{:else}
											<div
												class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm text-slate-500"
											>
												{teacher.vorname[0]}{teacher.nachname[0]}
											</div>
										{/if}
										<span class="font-medium text-slate-800">
											{teacher.vorname}
											{teacher.nachname}
										</span>
									</div>
								</td>
								{#each weekDays as day (formatDate(day))}
									{@const schedule = getScheduleForCell(teacher.id, day)}
									<td class="relative px-2 py-2 text-center">
										{#if schedule}
											<button
												onclick={() => openEditPicker(schedule)}
												class="w-full rounded-md bg-teal-100 px-2 py-2 text-sm text-teal-800 transition-colors hover:bg-teal-200"
											>
												{formatTimeRange(schedule.startZeit, schedule.endZeit)}
											</button>
											{#if editingEntry?.id === schedule.id}
												<div class="absolute top-full left-1/2 z-10 mt-1 -translate-x-1/2">
													<TimeSlotPicker
														startZeit={schedule.startZeit}
														endZeit={schedule.endZeit}
														onSave={({ startZeit, endZeit }) => {
															const formData = new FormData();
															formData.append('id', schedule.id);
															formData.append('startZeit', startZeit);
															formData.append('endZeit', endZeit);
															handleEdit(formData);
														}}
														onCancel={closePicker}
														onDelete={() => handleDelete(schedule.id)}
													/>
												</div>
											{/if}
										{:else}
											<button
												onclick={() => openAddPicker(teacher.id, day)}
												class="w-full rounded-md border-2 border-dashed border-slate-200 px-2 py-2 text-slate-400 transition-colors hover:border-teal-400 hover:text-teal-600"
											>
												+
											</button>
											{#if selectedCell?.teacherId === teacher.id && selectedCell?.date === formatDate(day)}
												<div class="absolute top-full left-1/2 z-10 mt-1 -translate-x-1/2">
													<TimeSlotPicker
														onSave={({ startZeit, endZeit }) => {
															const formData = new FormData();
															formData.append('erzieherId', teacher.id);
															formData.append('datum', formatDate(day));
															formData.append('startZeit', startZeit);
															formData.append('endZeit', endZeit);
															handleCreate(formData);
														}}
														onCancel={closePicker}
													/>
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
		{/if}
	</div>
</div>
