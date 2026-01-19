<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	let editingUser = $state(null);
	let deleteConfirm = $state(null);
	let filterRole = $state('');
	let searchQuery = $state('');

	const roleLabels = {
		admin: 'Administrator',
		parent: 'Elternteil',
		employee: 'Mitarbeiter'
	};

	const roleBadgeColors = {
		admin: 'bg-purple-100 text-purple-800',
		parent: 'bg-blue-100 text-blue-800',
		employee: 'bg-green-100 text-green-800'
	};

	let formRole = $state('parent');

	let filteredUsers = $derived(
		data.benutzer.filter((u) => {
			const matchesRole = !filterRole || u.role === filterRole;
			const matchesSearch =
				!searchQuery ||
				u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesRole && matchesSearch;
		})
	);

	function openEditModal(user) {
		editingUser = user;
		formRole = user.role;
	}

	function closeModal() {
		editingUser = null;
	}

	async function handleFormSuccess() {
		closeModal();
		deleteConfirm = null;
		await invalidateAll();
	}

	function formatDate(date) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Benutzer
		</h1>
		<div class="text-sm text-gray-500">
			{filteredUsers.length} von {data.benutzer.length} Benutzer
		</div>
	</div>

	<!-- Error message -->
	{#if form?.error}
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
			{form.error}
		</div>
	{/if}

	<!-- Success message -->
	{#if form?.success}
		<div class="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
			Aktion erfolgreich ausgeführt
		</div>
	{/if}

	<!-- Filters -->
	<div class="flex flex-wrap gap-4">
		<div class="flex-1">
			<input
				type="text"
				placeholder="Nach Name oder E-Mail suchen..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<div>
			<select
				bind:value={filterRole}
				class="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
			>
				<option value="">Alle Rollen</option>
				<option value="admin">Administrator</option>
				<option value="parent">Elternteil</option>
				<option value="employee">Mitarbeiter</option>
			</select>
		</div>
	</div>

	<!-- Users list -->
	{#if data.benutzer.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Noch keine Benutzer vorhanden.
		</div>
	{:else if filteredUsers.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Keine Benutzer gefunden.
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
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
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Rolle
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Registriert
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Aktionen
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each filteredUsers as benutzer (benutzer.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 font-medium text-gray-800">
								{benutzer.name}
							</td>
							<td class="px-6 py-4 text-gray-600">
								{benutzer.email}
							</td>
							<td class="px-6 py-4">
								<span
									class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {roleBadgeColors[
										benutzer.role
									]}"
								>
									{roleLabels[benutzer.role]}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-gray-500">
								{formatDate(benutzer.createdAt)}
							</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => openEditModal(benutzer)}
									class="mr-4 text-blue-600 hover:text-blue-800"
								>
									Bearbeiten
								</button>
								<button
									onclick={() => (deleteConfirm = benutzer)}
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

<!-- Edit Role Modal -->
{#if editingUser}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				Benutzerrolle bearbeiten
			</h2>

			<div class="mb-4 rounded-lg bg-gray-50 p-4">
				<p class="text-sm text-gray-600">
					<strong>Name:</strong>
					{editingUser.name}
				</p>
				<p class="text-sm text-gray-600">
					<strong>E-Mail:</strong>
					{editingUser.email}
				</p>
			</div>

			<form
				method="POST"
				action="?/updateRole"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={editingUser.id} />

				<div>
					<label for="role" class="mb-1 block text-sm font-medium text-gray-700">Rolle</label>
					<select
						id="role"
						name="role"
						bind:value={formRole}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					>
						<option value="admin">Administrator</option>
						<option value="parent">Elternteil</option>
						<option value="employee">Mitarbeiter</option>
					</select>
				</div>

				<div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
					<strong>Hinweis:</strong> Die Rolle bestimmt, auf welche Bereiche der Benutzer Zugriff
					hat.
					<ul class="mt-2 list-inside list-disc space-y-1">
						<li><strong>Administrator:</strong> Voller Zugriff auf alle Bereiche</li>
						<li><strong>Elternteil:</strong> Zugriff auf Eltern-Dashboard und eigene Kinder</li>
						<li><strong>Mitarbeiter:</strong> Zugriff auf Mitarbeiter-Dashboard und Gruppen</li>
					</ul>
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
				Benutzer löschen?
			</h2>
			<p class="mb-6 text-gray-600">
				Möchten Sie den Benutzer "{deleteConfirm.name}" ({deleteConfirm.email}) wirklich löschen?
				Diese Aktion kann nicht rückgängig gemacht werden.
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
