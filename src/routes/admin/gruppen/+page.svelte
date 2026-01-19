<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	let showModal = $state(false);
	let editingGroup = $state(null);
	let deleteConfirm = $state(null);

	const presetColors = [
		'#FF6B6B',
		'#4ECDC4',
		'#45B7D1',
		'#96CEB4',
		'#FFEAA7',
		'#DDA0DD',
		'#98D8C8',
		'#F7DC6F',
		'#BB8FCE',
		'#85C1E9'
	];

	let formName = $state('');
	let formFarbe = $state(presetColors[0]);

	function openCreateModal() {
		editingGroup = null;
		formName = '';
		formFarbe = presetColors[0];
		showModal = true;
	}

	function openEditModal(group) {
		editingGroup = group;
		formName = group.name;
		formFarbe = group.farbe;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingGroup = null;
	}

	async function handleFormSuccess() {
		closeModal();
		deleteConfirm = null;
		await invalidateAll();
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Gruppen
		</h1>
		<button
			onclick={openCreateModal}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			Neue Gruppe
		</button>
	</div>

	<!-- Error message -->
	{#if form?.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
			{form.error}
		</div>
	{/if}

	<!-- Groups list -->
	{#if data.gruppen.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Noch keine Gruppen vorhanden. Erstellen Sie eine neue Gruppe.
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Farbe
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Name
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Aktionen
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.gruppen as group (group.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								<div
									class="h-8 w-8 rounded-full border-2 border-gray-200"
									style="background-color: {group.farbe}"
								></div>
							</td>
							<td class="px-6 py-4 font-medium text-gray-800">{group.name}</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => openEditModal(group)}
									class="mr-4 text-blue-600 hover:text-blue-800"
								>
									Bearbeiten
								</button>
								<button
									onclick={() => (deleteConfirm = group)}
									class="text-red-600 hover:text-red-800"
								>
									Löschen
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				{editingGroup ? 'Gruppe bearbeiten' : 'Neue Gruppe'}
			</h2>

			<form
				method="POST"
				action={editingGroup ? '?/edit' : '?/create'}
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
				class="space-y-4"
			>
				{#if editingGroup}
					<input type="hidden" name="id" value={editingGroup.id} />
				{/if}

				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={formName}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						placeholder="z.B. Sonnenkäfer"
					/>
				</div>

				<div>
					<span class="mb-2 block text-sm font-medium text-gray-700">Farbe</span>
					<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Farbauswahl">
						{#each presetColors as color (color)}
							<button
								type="button"
								onclick={() => (formFarbe = color)}
								aria-label="Farbe {color}"
								aria-pressed={formFarbe === color}
								class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 {formFarbe ===
								color
									? 'scale-110 border-gray-800'
									: 'border-gray-200'}"
								style="background-color: {color}"
							></button>
						{/each}
					</div>
					<input type="hidden" name="farbe" value={formFarbe} />
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button
						type="button"
						onclick={closeModal}
						class="px-4 py-2 text-gray-600 hover:text-gray-800"
					>
						Abbrechen
					</button>
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
					>
						Speichern
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-2 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				Gruppe löschen?
			</h2>
			<p class="mb-6 text-gray-600">
				Möchten Sie die Gruppe "{deleteConfirm.name}" wirklich löschen?
			</p>

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
			>
				<input type="hidden" name="id" value={deleteConfirm.id} />
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => (deleteConfirm = null)}
						class="px-4 py-2 text-gray-600 hover:text-gray-800"
					>
						Abbrechen
					</button>
					<button
						type="submit"
						class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Löschen
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
