<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import PhotoUpload from '$lib/components/PhotoUpload.svelte';

	let { data, form } = $props();

	let showModal = $state(false);
	let editingChild = $state(null);
	let deleteConfirm = $state(null);

	let searchQuery = $state('');
	let selectedGruppe = $state('');

	let formVorname = $state('');
	let formNachname = $state('');
	let formGeburtstag = $state('');
	let formGruppeId = $state('');
	let formFotoPath = $state('');

	let filteredKinder = $derived(
		data.kinder.filter((kind) => {
			const matchesSearch =
				!searchQuery ||
				kind.vorname.toLowerCase().includes(searchQuery.toLowerCase()) ||
				kind.nachname.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesGruppe = !selectedGruppe || kind.gruppe?.id === selectedGruppe;

			return matchesSearch && matchesGruppe;
		})
	);

	function formatDate(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('de-DE');
	}

	function openCreateModal() {
		editingChild = null;
		formVorname = '';
		formNachname = '';
		formGeburtstag = '';
		formGruppeId = '';
		formFotoPath = '';
		showModal = true;
	}

	function openEditModal(child) {
		editingChild = child;
		formVorname = child.vorname;
		formNachname = child.nachname;
		formGeburtstag = child.geburtstag;
		formGruppeId = child.gruppeId || '';
		formFotoPath = child.fotoPath || '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingChild = null;
	}

	async function handleFormSuccess() {
		closeModal();
		deleteConfirm = null;
		await invalidateAll();
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Kinder
		</h1>
		<button
			onclick={openCreateModal}
			class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
		>
			Neues Kind
		</button>
	</div>

	<!-- Search and filter -->
	<div class="flex gap-4">
		<div class="flex-1">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Name suchen..."
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
			/>
		</div>
		<div>
			<select
				bind:value={selectedGruppe}
				class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
			>
				<option value="">Alle Gruppen</option>
				{#each data.gruppen as gruppe (gruppe.id)}
					<option value={gruppe.id}>{gruppe.name}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Error message -->
	{#if form?.error}
		<div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
			{form.error}
		</div>
	{/if}

	<!-- Results count -->
	<p class="text-sm text-gray-500">
		{filteredKinder.length} von {data.kinder.length} Kindern
	</p>

	<!-- Children list -->
	{#if data.kinder.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
			Noch keine Kinder vorhanden. Erstellen Sie einen neuen Eintrag.
		</div>
	{:else if filteredKinder.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
			Keine Kinder gefunden.
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Foto
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Name
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Geburtstag
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Gruppe
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Aktionen
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each filteredKinder as child (child.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								{#if child.fotoPath}
									<img
										src={child.fotoPath}
										alt="{child.vorname} {child.nachname}"
										class="w-10 h-10 rounded-full object-cover"
									/>
								{:else}
									<div
										class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
									>
										👶
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 font-medium text-gray-800">
								{child.vorname}
								{child.nachname}
							</td>
							<td class="px-6 py-4 text-gray-600">{formatDate(child.geburtstag)}</td>
							<td class="px-6 py-4">
								{#if child.gruppe}
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
										style="background-color: {child.gruppe.farbe}"
									>
										{child.gruppe.name}
									</span>
								{:else}
									<span class="text-gray-400">-</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => openEditModal(child)}
									class="text-blue-600 hover:text-blue-800 mr-4"
								>
									Bearbeiten
								</button>
								<button
									onclick={() => (deleteConfirm = child)}
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
				{editingChild ? 'Kind bearbeiten' : 'Neues Kind'}
			</h2>

			<form
				method="POST"
				action={editingChild ? '?/edit' : '?/create'}
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
				class="space-y-4"
			>
				{#if editingChild}
					<input type="hidden" name="id" value={editingChild.id} />
				{/if}

				<div>
					<label for="vorname" class="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
					<input
						type="text"
						id="vorname"
						name="vorname"
						bind:value={formVorname}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					/>
				</div>

				<div>
					<label for="nachname" class="block text-sm font-medium text-gray-700 mb-1">Nachname</label
					>
					<input
						type="text"
						id="nachname"
						name="nachname"
						bind:value={formNachname}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					/>
				</div>

				<div>
					<label for="geburtstag" class="block text-sm font-medium text-gray-700 mb-1"
						>Geburtstag</label
					>
					<input
						type="date"
						id="geburtstag"
						name="geburtstag"
						bind:value={formGeburtstag}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					/>
				</div>

				<div>
					<label for="gruppeId" class="block text-sm font-medium text-gray-700 mb-1">Gruppe</label>
					<select
						id="gruppeId"
						name="gruppeId"
						bind:value={formGruppeId}
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					>
						<option value="">Keine Gruppe</option>
						{#each data.gruppen as gruppe (gruppe.id)}
							<option value={gruppe.id}>{gruppe.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<span class="block text-sm font-medium text-gray-700 mb-1">Foto</span>
					<PhotoUpload bind:value={formFotoPath} />
					<input type="hidden" name="fotoPath" value={formFotoPath} />
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
				Kind löschen?
			</h2>
			<p class="text-gray-600 mb-6">
				Möchten Sie {deleteConfirm.vorname}
				{deleteConfirm.nachname} wirklich löschen?
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
						class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
					>
						Löschen
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
