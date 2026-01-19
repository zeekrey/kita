<script>
	/**
	 * @type {{ startZeit?: string, endZeit?: string, onSave: (data: { startZeit: string, endZeit: string }) => void, onCancel: () => void, onDelete?: () => void }}
	 */
	let { startZeit = '07:00', endZeit = '14:00', onSave, onCancel, onDelete } = $props();

	let start = $state(startZeit);
	let end = $state(endZeit);
	let error = $state('');

	const presets = [
		{ label: 'Frühdienst', start: '07:00', end: '14:00' },
		{ label: 'Spätdienst', start: '12:00', end: '18:00' },
		{ label: 'Ganztag', start: '07:00', end: '18:00' }
	];

	function applyPreset(preset) {
		start = preset.start;
		end = preset.end;
		error = '';
	}

	function handleSave() {
		if (start >= end) {
			error = 'Startzeit muss vor Endzeit liegen';
			return;
		}
		error = '';
		onSave({ startZeit: start, endZeit: end });
	}

	function handleDelete() {
		if (onDelete) {
			onDelete();
		}
	}
</script>

<div class="min-w-[280px] rounded-lg bg-white p-4 shadow-lg">
	<div class="space-y-4">
		<div class="flex gap-2">
			{#each presets as preset (preset.label)}
				<button
					type="button"
					onclick={() => applyPreset(preset)}
					class="flex-1 rounded bg-slate-100 px-2 py-1 text-xs transition-colors hover:bg-slate-200"
				>
					{preset.label}
				</button>
			{/each}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="start-time" class="mb-1 block text-sm font-medium text-slate-700">Von</label>
				<input
					id="start-time"
					type="time"
					bind:value={start}
					class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
				/>
			</div>
			<div>
				<label for="end-time" class="mb-1 block text-sm font-medium text-slate-700">Bis</label>
				<input
					id="end-time"
					type="time"
					bind:value={end}
					class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
				/>
			</div>
		</div>

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<div class="flex justify-end gap-2">
			{#if onDelete}
				<button
					type="button"
					onclick={handleDelete}
					class="rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
				>
					Löschen
				</button>
			{/if}
			<button
				type="button"
				onclick={onCancel}
				class="rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
			>
				Abbrechen
			</button>
			<button
				type="button"
				onclick={handleSave}
				class="rounded-md bg-teal-600 px-3 py-2 text-sm text-white transition-colors hover:bg-teal-700"
			>
				Speichern
			</button>
		</div>
	</div>
</div>
