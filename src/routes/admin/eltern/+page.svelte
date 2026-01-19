<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	let editingParent = $state(null);
	let linkingParent = $state(null);
	let unlinkConfirm = $state(null);
	let searchQuery = $state('');

	const beziehungLabels = {
		mutter: 'Mutter',
		vater: 'Vater',
		erziehungsberechtigter: 'Erziehungsberechtigte/r'
	};

	const beziehungBadgeColors = {
		mutter: 'bg-pink-100 text-pink-800',
		vater: 'bg-blue-100 text-blue-800',
		erziehungsberechtigter: 'bg-gray-100 text-gray-800'
	};

	let formTelefon = $state('');
	let formAdresse = $state('');
	let formKindId = $state('');
	let formBeziehung = $state('erziehungsberechtigter');

	let filteredEltern = $derived(
		data.eltern.filter((e) => {
			const matchesSearch =
				!searchQuery ||
				e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(e.telefon && e.telefon.includes(searchQuery)) ||
				e.kinder.some(
					(k) =>
						k.vorname.toLowerCase().includes(searchQuery.toLowerCase()) ||
						k.nachname.toLowerCase().includes(searchQuery.toLowerCase())
				);
			return matchesSearch;
		})
	);

	function openEditModal(parent) {
		editingParent = parent;
		formTelefon = parent.telefon || '';
		formAdresse = parent.adresse || '';
	}

	function openLinkModal(parent) {
		linkingParent = parent;
		formKindId = '';
		formBeziehung = 'erziehungsberechtigter';
	}

	function closeModal() {
		editingParent = null;
		linkingParent = null;
		unlinkConfirm = null;
	}

	async function handleFormSuccess() {
		closeModal();
		await invalidateAll();
	}

	// Get available children for linking (excluding already linked ones)
	function getAvailableChildren(parent) {
		const linkedKindIds = new Set(parent.kinder.map((k) => k.id));
		return data.alleKinder.filter((k) => !linkedKindIds.has(k.id));
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
			Eltern
		</h1>
		<div class="text-sm text-gray-500">
			{filteredEltern.length} von {data.eltern.length} Eltern
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
				placeholder="Nach Name, E-Mail, Telefon oder Kind suchen..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
			/>
		</div>
	</div>

	<!-- Parents list -->
	{#if data.eltern.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			<p class="mb-2">Noch keine Eltern vorhanden.</p>
			<p class="text-sm">
				Eltern werden automatisch erstellt, wenn einem Benutzer die Rolle "Elternteil" zugewiesen
				wird.
			</p>
		</div>
	{:else if filteredEltern.length === 0}
		<div class="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
			Keine Eltern gefunden.
		</div>
	{:else}
		<div class="space-y-4">
			{#each filteredEltern as parent (parent.id)}
				<div class="overflow-hidden rounded-lg bg-white shadow">
					<!-- Parent header -->
					<div class="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
						<div>
							<h3 class="text-lg font-semibold text-gray-800">{parent.name}</h3>
							<p class="text-sm text-gray-500">{parent.email}</p>
						</div>
						<div class="flex items-center gap-3">
							<button
								onclick={() => openLinkModal(parent)}
								class="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-700"
							>
								Kind verknüpfen
							</button>
							<button
								onclick={() => openEditModal(parent)}
								class="text-blue-600 hover:text-blue-800"
							>
								Profil bearbeiten
							</button>
						</div>
					</div>

					<!-- Contact info -->
					{#if parent.telefon || parent.adresse}
						<div class="border-b bg-gray-50/50 px-6 py-3">
							<div class="flex flex-wrap gap-6 text-sm">
								{#if parent.telefon}
									<div class="flex items-center gap-2">
										<span class="text-gray-400">📞</span>
										<span class="text-gray-600">{parent.telefon}</span>
									</div>
								{/if}
								{#if parent.adresse}
									<div class="flex items-center gap-2">
										<span class="text-gray-400">📍</span>
										<span class="text-gray-600">{parent.adresse}</span>
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Linked children -->
					<div class="px-6 py-4">
						{#if parent.kinder.length === 0}
							<p class="text-sm text-gray-400 italic">Keine Kinder verknüpft</p>
						{:else}
							<div class="space-y-2">
								<p class="text-xs font-medium tracking-wider text-gray-500 uppercase">
									Verknüpfte Kinder ({parent.kinder.length})
								</p>
								<div class="flex flex-wrap gap-2">
									{#each parent.kinder as kind (kind.linkId)}
										<div
											class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
										>
											<!-- Group color indicator -->
											{#if kind.gruppeFarbe}
												<span
													class="h-3 w-3 rounded-full"
													style="background-color: {kind.gruppeFarbe}"
													title={kind.gruppeName}
												></span>
											{/if}
											<span class="font-medium text-gray-800">{kind.vorname} {kind.nachname}</span>
											<span
												class="rounded-full px-2 py-0.5 text-xs font-medium {beziehungBadgeColors[
													kind.beziehung
												]}"
											>
												{beziehungLabels[kind.beziehung]}
											</span>
											<button
												onclick={() =>
													(unlinkConfirm = {
														parent,
														kind
													})}
												class="ml-1 text-gray-400 hover:text-red-600"
												title="Verknüpfung aufheben"
											>
												✕
											</button>
										</div>
									{/each}
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
{#if editingParent}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				Elternprofil bearbeiten
			</h2>

			<div class="mb-4 rounded-lg bg-gray-50 p-4">
				<p class="text-sm text-gray-600">
					<strong>Name:</strong>
					{editingParent.name}
				</p>
				<p class="text-sm text-gray-600">
					<strong>E-Mail:</strong>
					{editingParent.email}
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
				<input type="hidden" name="userId" value={editingParent.id} />

				<div>
					<label for="telefon" class="mb-1 block text-sm font-medium text-gray-700">Telefon</label>
					<input
						type="tel"
						id="telefon"
						name="telefon"
						bind:value={formTelefon}
						placeholder="z.B. 0151 12345678"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="adresse" class="mb-1 block text-sm font-medium text-gray-700">Adresse</label>
					<textarea
						id="adresse"
						name="adresse"
						bind:value={formAdresse}
						rows="2"
						placeholder="Straße, PLZ Ort"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					></textarea>
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

<!-- Link Child Modal -->
{#if linkingParent}
	{@const availableChildren = getAvailableChildren(linkingParent)}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
				Kind verknüpfen
			</h2>

			<div class="mb-4 rounded-lg bg-gray-50 p-4">
				<p class="text-sm text-gray-600">
					<strong>Elternteil:</strong>
					{linkingParent.name}
				</p>
			</div>

			{#if availableChildren.length === 0}
				<div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
					<p>Alle Kinder sind bereits mit diesem Elternteil verknüpft.</p>
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
					action="?/linkChild"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success' || result.type === 'redirect') {
								handleFormSuccess();
							}
						};
					}}
					class="space-y-4"
				>
					<input type="hidden" name="userId" value={linkingParent.id} />

					<div>
						<label for="kindId" class="mb-1 block text-sm font-medium text-gray-700">Kind</label>
						<select
							id="kindId"
							name="kindId"
							bind:value={formKindId}
							required
							class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Kind auswählen...</option>
							{#each availableChildren as kind (kind.id)}
								<option value={kind.id}>
									{kind.nachname}, {kind.vorname}
									{#if kind.gruppeName}
										({kind.gruppeName})
									{/if}
								</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="beziehung" class="mb-1 block text-sm font-medium text-gray-700"
							>Beziehung</label
						>
						<select
							id="beziehung"
							name="beziehung"
							bind:value={formBeziehung}
							required
							class="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						>
							<option value="mutter">Mutter</option>
							<option value="vater">Vater</option>
							<option value="erziehungsberechtigter">Erziehungsberechtigte/r</option>
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
				Möchten Sie die Verknüpfung zwischen <strong>{unlinkConfirm.parent.name}</strong> und
				<strong>{unlinkConfirm.kind.vorname} {unlinkConfirm.kind.nachname}</strong> wirklich aufheben?
			</p>

			<form
				method="POST"
				action="?/unlinkChild"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'redirect') {
							handleFormSuccess();
						}
					};
				}}
			>
				<input type="hidden" name="linkId" value={unlinkConfirm.kind.linkId} />
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
