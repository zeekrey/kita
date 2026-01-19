<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	let editingEmployee = $state(null);
	let linkingEmployee = $state(null);
	let unlinkConfirm = $state(null);
	let searchQuery = $state('');

	let formPosition = $state('');
	let formErzieherId = $state('');

	let filteredMitarbeiter = $derived(
		data.mitarbeiter.filter((m) => {
			const matchesSearch =
				!searchQuery ||
				m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(m.position && m.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(m.erzieherVorname &&
					m.erzieherVorname.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(m.erzieherNachname &&
					m.erzieherNachname.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchesSearch;
		})
	);

	function openEditModal(employee) {
		editingEmployee = employee;
		formPosition = employee.position || '';
	}

	function openLinkModal(employee) {
		linkingEmployee = employee;
		formErzieherId = '';
	}

	function closeModal() {
		editingEmployee = null;
		linkingEmployee = null;
		unlinkConfirm = null;
	}

	async function handleFormSuccess() {
		closeModal();
		await invalidateAll();
	}

	// Get available erzieher for linking (excluding already linked ones, but include currently linked for this employee)
	function getAvailableErzieher(employee) {
		const linkedErzieherIds = new Set(data.linkedErzieherIds);
		return data.alleErzieher.filter(
			(e) => !linkedErzieherIds.has(e.id) || e.id === employee.erzieherId
		);
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Mitarbeiter
		</h1>
		<div class="text-sm text-gray-500">
			{filteredMitarbeiter.length} von {data.mitarbeiter.length} Mitarbeiter
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

	<!-- Search -->
	<div class="flex flex-wrap gap-4">
		<div class="flex-1">
			<input
				type="text"
				placeholder="Nach Name, E-Mail, Position oder Erzieher suchen..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
			/>
		</div>
	</div>

	<!-- Employees list -->
	{#if data.mitarbeiter.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			<p class="mb-2">Noch keine Mitarbeiter vorhanden.</p>
			<p class="text-sm">
				Mitarbeiter werden automatisch erstellt, wenn einem Benutzer die Rolle "Mitarbeiter"
				zugewiesen wird.
			</p>
		</div>
	{:else if filteredMitarbeiter.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Keine Mitarbeiter gefunden.
		</div>
	{:else}
		<div class="space-y-4">
			{#each filteredMitarbeiter as employee (employee.id)}
				<div class="overflow-hidden rounded-lg bg-white shadow">
					<!-- Employee header -->
					<div class="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
						<div>
							<h3 class="text-lg font-semibold text-gray-800">{employee.name}</h3>
							<p class="text-sm text-gray-500">{employee.email}</p>
						</div>
						<div class="flex items-center gap-3">
							{#if !employee.erzieherId}
								<button
									onclick={() => openLinkModal(employee)}
									class="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-700"
								>
									Erzieher verknüpfen
								</button>
							{/if}
							<button
								onclick={() => openEditModal(employee)}
								class="text-blue-600 hover:text-blue-800"
							>
								Profil bearbeiten
							</button>
						</div>
					</div>

					<!-- Position info -->
					{#if employee.position}
						<div class="border-b bg-gray-50/50 px-6 py-3">
							<div class="flex items-center gap-2 text-sm">
								<span class="text-gray-400">💼</span>
								<span class="text-gray-600">{employee.position}</span>
							</div>
						</div>
					{/if}

					<!-- Linked erzieher -->
					<div class="px-6 py-4">
						{#if !employee.erzieherId}
							<p class="text-sm text-gray-400 italic">Kein Erzieher verknüpft</p>
						{:else}
							<div class="space-y-2">
								<p class="text-xs font-medium tracking-wider text-gray-500 uppercase">
									Verknüpfter Erzieher
								</p>
								<div class="flex items-center gap-3">
									<div
										class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
									>
										<!-- Erzieher photo -->
										{#if employee.erzieherFotoPath}
											<img
												src={employee.erzieherFotoPath}
												alt="{employee.erzieherVorname} {employee.erzieherNachname}"
												class="h-10 w-10 rounded-full object-cover"
											/>
										{:else}
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
											>
												👩‍🏫
											</div>
										{/if}
										<div>
											<span class="font-medium text-gray-800">
												{employee.erzieherVorname}
												{employee.erzieherNachname}
											</span>
											<p class="text-sm text-gray-500">{employee.erzieherEmail}</p>
										</div>
										<button
											onclick={() => (unlinkConfirm = employee)}
											class="ml-3 text-gray-400 hover:text-red-600"
											title="Verknüpfung aufheben"
										>
											✕
										</button>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Edit Profile Modal -->
{#if editingEmployee}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				Mitarbeiterprofil bearbeiten
			</h2>

			<div class="mb-4 rounded-lg bg-gray-50 p-4">
				<p class="text-sm text-gray-600">
					<strong>Name:</strong>
					{editingEmployee.name}
				</p>
				<p class="text-sm text-gray-600">
					<strong>E-Mail:</strong>
					{editingEmployee.email}
				</p>
			</div>

			<form
				method="POST"
				action="?/updateProfile"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="userId" value={editingEmployee.id} />

				<div>
					<label for="position" class="mb-1 block text-sm font-medium text-gray-700">Position</label
					>
					<input
						type="text"
						id="position"
						name="position"
						bind:value={formPosition}
						placeholder="z.B. Erzieherin, Praktikantin, Küchenhilfe"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
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

<!-- Link Erzieher Modal -->
{#if linkingEmployee}
	{@const availableErzieher = getAvailableErzieher(linkingEmployee)}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				Erzieher verknüpfen
			</h2>

			<div class="mb-4 rounded-lg bg-gray-50 p-4">
				<p class="text-sm text-gray-600">
					<strong>Mitarbeiter:</strong>
					{linkingEmployee.name}
				</p>
			</div>

			{#if availableErzieher.length === 0}
				<div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
					<p>Alle Erzieher sind bereits mit einem Mitarbeiter verknüpft.</p>
				</div>
				<div class="mt-4 flex justify-end">
					<button
						type="button"
						onclick={closeModal}
						class="px-4 py-2 text-gray-600 hover:text-gray-800"
					>
						Schließen
					</button>
				</div>
			{:else}
				<form
					method="POST"
					action="?/linkErzieher"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success' || result.type === 'redirect') {
								handleFormSuccess();
							}
						};
					}}
					class="space-y-4"
				>
					<input type="hidden" name="userId" value={linkingEmployee.id} />

					<div>
						<label for="erzieherId" class="mb-1 block text-sm font-medium text-gray-700"
							>Erzieher</label
						>
						<select
							id="erzieherId"
							name="erzieherId"
							bind:value={formErzieherId}
							required
							class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Erzieher auswählen...</option>
							{#each availableErzieher as e (e.id)}
								<option value={e.id}>
									{e.nachname}, {e.vorname}
									({e.email})
								</option>
							{/each}
						</select>
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
							class="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
						>
							Verknüpfen
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<!-- Unlink Confirmation Modal -->
{#if unlinkConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-2 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				Verknüpfung aufheben?
			</h2>
			<p class="mb-6 text-gray-600">
				Möchten Sie die Verknüpfung zwischen <strong>{unlinkConfirm.name}</strong> und
				<strong>{unlinkConfirm.erzieherVorname} {unlinkConfirm.erzieherNachname}</strong> wirklich aufheben?
			</p>

			<form
				method="POST"
				action="?/unlinkErzieher"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
			>
				<input type="hidden" name="userId" value={unlinkConfirm.id} />
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => (unlinkConfirm = null)}
						class="px-4 py-2 text-gray-600 hover:text-gray-800"
					>
						Abbrechen
					</button>
					<button
						type="submit"
						class="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
					>
						Verknüpfung aufheben
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
