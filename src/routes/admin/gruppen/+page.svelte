<script>
	import { enhance } from '$app/forms';

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

	function handleFormSuccess() {
		closeModal();
		deleteConfirm = null;
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Gruppen
		</h1>
		<button
			onclick={openCreateModal}
			class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
		>
			Neue Gruppe
		</button>
	</div>

	<!-- Error message -->
	{#if form?.error}
		<div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
			{form.error}
		</div>
	{/if}

	<!-- Groups list -->
	{#if data.gruppen.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
			Noch keine Gruppen vorhanden. Erstellen Sie eine neue Gruppe.
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Farbe
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Name
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Aktionen
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.gruppen as group (group.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								<div
									class="w-8 h-8 rounded-full border-2 border-gray-200"
									style="background-color: {group.farbe}"
								></div>
							</td>
							<td class="px-6 py-4 font-medium text-gray-800">{group.name}</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => openEditModal(group)}
									class="text-blue-600 hover:text-blue-800 mr-4"
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
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
			<h2 class="text-xl font-bold text-gray-800 mb-4" style="font-family: var(--font-heading);">
				{editingGroup ? 'Gruppe bearbeiten' : 'Neue Gruppe'}
			</h2>

			<form
				method="POST"
				action={editingGroup ? '?/edit' : '?/create'}
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || (result.type === 'redirect')) {
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
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={formName}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
						placeholder="z.B. Sonnenkäfer"
					/>
				</div>

				<div>
					<span class="block text-sm font-medium text-gray-700 mb-2">Farbe</span>
					<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Farbauswahl">
						{#each presetColors as color, i (color)}
							<button
								type="button"
								onclick={() => (formFarbe = color)}
								aria-label="Farbe {color}"
								aria-pressed={formFarbe === color}
								class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 {formFarbe ===
								color
									? 'border-gray-800 scale-110'
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
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
			<h2 class="text-xl font-bold text-gray-800 mb-2" style="font-family: var(--font-heading);">
				Gruppe löschen?
			</h2>
			<p class="text-gray-600 mb-6">
				Möchten Sie die Gruppe "{deleteConfirm.name}" wirklich löschen?
			</p>

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || (result.type === 'redirect')) {
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
						class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
					>
						Löschen
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
