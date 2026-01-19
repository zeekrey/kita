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

<div class="bg-white rounded-lg shadow-lg p-4 min-w-[280px]">
	<div class="space-y-4">
		<div class="flex gap-2">
			{#each presets as preset (preset.label)}
				<button
					type="button"
					onclick={() => applyPreset(preset)}
					class="flex-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
				>
					{preset.label}
				</button>
			{/each}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="start-time" class="block text-sm font-medium text-slate-700 mb-1">Von</label>
				<input
					id="start-time"
					type="time"
					bind:value={start}
					class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
				/>
			</div>
			<div>
				<label for="end-time" class="block text-sm font-medium text-slate-700 mb-1">Bis</label>
				<input
					id="end-time"
					type="time"
					bind:value={end}
					class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
				/>
			</div>
		</div>

		{#if error}
			<p class="text-red-600 text-sm">{error}</p>
		{/if}

		<div class="flex gap-2 justify-end">
			{#if onDelete}
				<button
					type="button"
					onclick={handleDelete}
					class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
				>
					Löschen
				</button>
			{/if}
			<button
				type="button"
				onclick={onCancel}
				class="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
			>
				Abbrechen
			</button>
			<button
				type="button"
				onclick={handleSave}
				class="px-3 py-2 text-sm bg-teal-600 text-white hover:bg-teal-700 rounded-md transition-colors"
			>
				Speichern
			</button>
		</div>
	</div>
</div>
