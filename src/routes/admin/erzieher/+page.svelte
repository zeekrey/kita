<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import PhotoUpload from '$lib/components/PhotoUpload.svelte';

	let { data, form } = $props();

	let showModal = $state(false);
	let editingTeacher = $state(null);
	let deleteConfirm = $state(null);

	let formVorname = $state('');
	let formNachname = $state('');
	let formEmail = $state('');
	let formFotoPath = $state('');

	function openCreateModal() {
		editingTeacher = null;
		formVorname = '';
		formNachname = '';
		formEmail = '';
		formFotoPath = '';
		showModal = true;
	}

	function openEditModal(teacher) {
		editingTeacher = teacher;
		formVorname = teacher.vorname;
		formNachname = teacher.nachname;
		formEmail = teacher.email;
		formFotoPath = teacher.fotoPath || '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingTeacher = null;
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
			Erzieher
		</h1>
		<button
			onclick={openCreateModal}
			class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
		>
			Neue/r Erzieher/in
		</button>
	</div>

	<!-- Error message -->
	{#if form?.error}
		<div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
			{form.error}
		</div>
	{/if}

	<!-- Teachers list -->
	{#if data.erzieher.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
			Noch keine Erzieher vorhanden. Erstellen Sie einen neuen Eintrag.
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
							E-Mail
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Aktionen
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.erzieher as teacher (teacher.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								{#if teacher.fotoPath}
									<img
										src={teacher.fotoPath}
										alt="{teacher.vorname} {teacher.nachname}"
										class="w-10 h-10 rounded-full object-cover"
									/>
								{:else}
									<div
										class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
									>
										👤
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 font-medium text-gray-800">
								{teacher.vorname}
								{teacher.nachname}
							</td>
							<td class="px-6 py-4 text-gray-600">{teacher.email}</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => openEditModal(teacher)}
									class="text-blue-600 hover:text-blue-800 mr-4"
								>
									Bearbeiten
								</button>
								<button
									onclick={() => (deleteConfirm = teacher)}
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
				{editingTeacher ? 'Erzieher/in bearbeiten' : 'Neue/r Erzieher/in'}
			</h2>

			<form
				method="POST"
				action={editingTeacher ? '?/edit' : '?/create'}
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
				class="space-y-4"
			>
				{#if editingTeacher}
					<input type="hidden" name="id" value={editingTeacher.id} />
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
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={formEmail}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					/>
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
				Erzieher/in löschen?
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
