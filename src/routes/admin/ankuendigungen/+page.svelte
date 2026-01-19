<script>
	import { invalidateAll } from '$app/navigation';
	import { formatDate } from '$lib/utils/date.js';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let showForm = $state(false);
	let editingAnnouncement = $state(null);

	let titel = $state('');
	let nachricht = $state('');
	let gueltigVon = $state(formatDate(new Date()));
	let gueltigBis = $state(formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
	let prioritaet = $state('normal');
	let error = $state('');

	const today = formatDate(new Date());

	function getStatus(announcement) {
		if (announcement.gueltigBis < today) return 'abgelaufen';
		if (announcement.gueltigVon > today) return 'geplant';
		return 'aktiv';
	}

	function getStatusBadge(status) {
		switch (status) {
			case 'aktiv':
				return 'bg-green-100 text-green-800';
			case 'abgelaufen':
				return 'bg-slate-100 text-slate-600';
			case 'geplant':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-slate-100 text-slate-600';
		}
	}

	function getStatusLabel(status) {
		switch (status) {
			case 'aktiv':
				return 'Aktiv';
			case 'abgelaufen':
				return 'Abgelaufen';
			case 'geplant':
				return 'Geplant';
			default:
				return status;
		}
	}

	function formatDateRange(von, bis) {
		const vonDate = new Date(von);
		const bisDate = new Date(bis);
		const vonStr = vonDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
		const bisStr = bisDate.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		return `${vonStr} - ${bisStr}`;
	}

	function openAddForm() {
		editingAnnouncement = null;
		titel = '';
		nachricht = '';
		gueltigVon = formatDate(new Date());
		gueltigBis = formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
		prioritaet = 'normal';
		error = '';
		showForm = true;
	}

	function openEditForm(announcement) {
		editingAnnouncement = announcement;
		titel = announcement.titel;
		nachricht = announcement.nachricht;
		gueltigVon = announcement.gueltigVon;
		gueltigBis = announcement.gueltigBis;
		prioritaet = announcement.prioritaet;
		error = '';
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		editingAnnouncement = null;
		error = '';
	}

	async function handleSubmit() {
		if (!titel.trim() || !nachricht.trim() || !gueltigVon || !gueltigBis) {
			error = 'Alle Felder sind erforderlich';
			return;
		}

		if (gueltigBis < gueltigVon) {
			error = 'Enddatum muss nach Startdatum liegen';
			return;
		}

		const formData = new FormData();
		formData.append('titel', titel);
		formData.append('nachricht', nachricht);
		formData.append('gueltigVon', gueltigVon);
		formData.append('gueltigBis', gueltigBis);
		formData.append('prioritaet', prioritaet);

		if (editingAnnouncement) {
			formData.append('id', editingAnnouncement.id);
		}

		const action = editingAnnouncement ? '?/edit' : '?/create';
		const response = await fetch(action, {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			closeForm();
			invalidateAll();
		}
	}

	async function handleDelete(id) {
		if (!confirm('Möchten Sie diese Ankündigung wirklich löschen?')) return;

		const formData = new FormData();
		formData.append('id', id);

		const response = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			invalidateAll();
		}
	}
</script>

<div class="p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-slate-800">Ankündigungen</h1>
		<button
			onclick={openAddForm}
			class="rounded-md bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
		>
			Neue Ankündigung
		</button>
	</div>

	{#if showForm}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
				<h2 class="mb-4 text-xl font-bold text-slate-800">
					{editingAnnouncement ? 'Ankündigung bearbeiten' : 'Neue Ankündigung'}
				</h2>

				<div class="space-y-4">
					<div>
						<label for="titel" class="mb-1 block text-sm font-medium text-slate-700">Titel</label>
						<input
							id="titel"
							type="text"
							bind:value={titel}
							class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
							placeholder="Titel der Ankündigung"
						/>
					</div>

					<div>
						<label for="nachricht" class="mb-1 block text-sm font-medium text-slate-700"
							>Nachricht</label
						>
						<textarea
							id="nachricht"
							bind:value={nachricht}
							rows="4"
							maxlength="500"
							class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
							placeholder="Inhalt der Ankündigung..."
						></textarea>
						<div class="text-right text-xs text-slate-400">{nachricht.length}/500</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="gueltigVon" class="mb-1 block text-sm font-medium text-slate-700"
								>Gültig von</label
							>
							<input
								id="gueltigVon"
								type="date"
								bind:value={gueltigVon}
								class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
							/>
						</div>
						<div>
							<label for="gueltigBis" class="mb-1 block text-sm font-medium text-slate-700"
								>Gültig bis</label
							>
							<input
								id="gueltigBis"
								type="date"
								bind:value={gueltigBis}
								class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="prioritaet" class="mb-1 block text-sm font-medium text-slate-700"
							>Priorität</label
						>
						<select
							id="prioritaet"
							bind:value={prioritaet}
							class="w-full rounded-md border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
						>
							<option value="normal">Normal</option>
							<option value="wichtig">Wichtig</option>
						</select>
					</div>

					{#if error}
						<p class="text-sm text-red-600">{error}</p>
					{/if}

					<div class="flex justify-end gap-2 pt-2">
						<button
							onclick={closeForm}
							class="rounded-md px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100"
						>
							Abbrechen
						</button>
						<button
							onclick={handleSubmit}
							class="rounded-md bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700"
						>
							{editingAnnouncement ? 'Speichern' : 'Erstellen'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="rounded-lg border border-slate-200 bg-white shadow-sm">
		{#if data.announcements.length === 0}
			<div class="p-8 text-center text-slate-500">
				<p>Noch keine Ankündigungen vorhanden.</p>
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each data.announcements as announcement (announcement.id)}
					{@const status = getStatus(announcement)}
					<div
						class="p-4 transition-colors hover:bg-slate-50 {announcement.prioritaet === 'wichtig'
							? 'border-l-4 border-red-500'
							: ''}"
					>
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1">
								<div class="mb-1 flex items-center gap-2">
									<h3 class="font-semibold text-slate-800">{announcement.titel}</h3>
									{#if announcement.prioritaet === 'wichtig'}
										<span class="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
											Wichtig
										</span>
									{/if}
									<span class="rounded px-2 py-0.5 text-xs font-medium {getStatusBadge(status)}">
										{getStatusLabel(status)}
									</span>
								</div>
								<p class="mb-2 line-clamp-2 text-sm text-slate-600">{announcement.nachricht}</p>
								<p class="text-xs text-slate-400">
									{formatDateRange(announcement.gueltigVon, announcement.gueltigBis)}
								</p>
							</div>
							<div class="flex shrink-0 gap-2">
								<button
									onclick={() => openEditForm(announcement)}
									class="rounded px-3 py-1 text-sm text-teal-600 transition-colors hover:bg-teal-50"
								>
									Bearbeiten
								</button>
								<button
									onclick={() => handleDelete(announcement.id)}
									class="rounded px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
								>
									Löschen
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
