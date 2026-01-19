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
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Erzieher
		</h1>
		<button
			onclick={openCreateModal}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			Neue/r Erzieher/in
		</button>
	</div>

	<!-- Error message -->
	{#if form?.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
			{form.error}
		</div>
	{/if}

	<!-- Teachers list -->
	{#if data.erzieher.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Noch keine Erzieher vorhanden. Erstellen Sie einen neuen Eintrag.
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
							E-Mail
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
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
										class="h-10 w-10 rounded-full object-cover"
									/>
								{:else}
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500"
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
									class="mr-4 text-blue-600 hover:text-blue-800"
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
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
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">E-Mail</label>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={formEmail}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
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
				Erzieher/in löschen?
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
