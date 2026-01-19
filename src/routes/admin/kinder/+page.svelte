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
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Kinder
		</h1>
		<button
			onclick={openCreateModal}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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
				class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<div>
			<select
				bind:value={selectedGruppe}
				class="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
			{form.error}
		</div>
	{/if}

	<!-- Results count -->
	<p class="text-sm text-gray-500">
		{filteredKinder.length} von {data.kinder.length} Kindern
	</p>

	<!-- Children list -->
	{#if data.kinder.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Noch keine Kinder vorhanden. Erstellen Sie einen neuen Eintrag.
		</div>
	{:else if filteredKinder.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Keine Kinder gefunden.
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Foto
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Name
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Geburtstag
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Gruppe
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
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
										class="h-10 w-10 rounded-full object-cover"
									/>
								{:else}
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500"
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
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
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
									class="mr-4 text-blue-600 hover:text-blue-800"
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
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
					<label for="vorname" class="mb-1 block text-sm font-medium text-gray-700">Vorname</label>
					<input
						type="text"
						id="vorname"
						name="vorname"
						bind:value={formVorname}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="nachname" class="mb-1 block text-sm font-medium text-gray-700">Nachname</label
					>
					<input
						type="text"
						id="nachname"
						name="nachname"
						bind:value={formNachname}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="geburtstag" class="mb-1 block text-sm font-medium text-gray-700"
						>Geburtstag</label
					>
					<input
						type="date"
						id="geburtstag"
						name="geburtstag"
						bind:value={formGeburtstag}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="gruppeId" class="mb-1 block text-sm font-medium text-gray-700">Gruppe</label>
					<select
						id="gruppeId"
						name="gruppeId"
						bind:value={formGruppeId}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Keine Gruppe</option>
						{#each data.gruppen as gruppe (gruppe.id)}
							<option value={gruppe.id}>{gruppe.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<span class="mb-1 block text-sm font-medium text-gray-700">Foto</span>
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
				Kind löschen?
			</h2>
			<p class="mb-6 text-gray-600">
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
						class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Löschen
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
