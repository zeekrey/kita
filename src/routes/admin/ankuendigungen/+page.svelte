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
		const bisStr = bisDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-slate-800">Ankündigungen</h1>
		<button
			onclick={openAddForm}
			class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
		>
			Neue Ankündigung
		</button>
	</div>

	{#if showForm}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
				<h2 class="text-xl font-bold text-slate-800 mb-4">
					{editingAnnouncement ? 'Ankündigung bearbeiten' : 'Neue Ankündigung'}
				</h2>

				<div class="space-y-4">
					<div>
						<label for="titel" class="block text-sm font-medium text-slate-700 mb-1">Titel</label>
						<input
							id="titel"
							type="text"
							bind:value={titel}
							class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
							placeholder="Titel der Ankündigung"
						/>
					</div>

					<div>
						<label for="nachricht" class="block text-sm font-medium text-slate-700 mb-1">Nachricht</label>
						<textarea
							id="nachricht"
							bind:value={nachricht}
							rows="4"
							maxlength="500"
							class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
							placeholder="Inhalt der Ankündigung..."
						></textarea>
						<div class="text-xs text-slate-400 text-right">{nachricht.length}/500</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="gueltigVon" class="block text-sm font-medium text-slate-700 mb-1">Gültig von</label>
							<input
								id="gueltigVon"
								type="date"
								bind:value={gueltigVon}
								class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
							/>
						</div>
						<div>
							<label for="gueltigBis" class="block text-sm font-medium text-slate-700 mb-1">Gültig bis</label>
							<input
								id="gueltigBis"
								type="date"
								bind:value={gueltigBis}
								class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
							/>
						</div>
					</div>

					<div>
						<label for="prioritaet" class="block text-sm font-medium text-slate-700 mb-1">Priorität</label>
						<select
							id="prioritaet"
							bind:value={prioritaet}
							class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
						>
							<option value="normal">Normal</option>
							<option value="wichtig">Wichtig</option>
						</select>
					</div>

					{#if error}
						<p class="text-red-600 text-sm">{error}</p>
					{/if}

					<div class="flex gap-2 justify-end pt-2">
						<button
							onclick={closeForm}
							class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
						>
							Abbrechen
						</button>
						<button
							onclick={handleSubmit}
							class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
						>
							{editingAnnouncement ? 'Speichern' : 'Erstellen'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="bg-white rounded-lg shadow-sm border border-slate-200">
		{#if data.announcements.length === 0}
			<div class="p-8 text-center text-slate-500">
				<p>Noch keine Ankündigungen vorhanden.</p>
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each data.announcements as announcement (announcement.id)}
					{@const status = getStatus(announcement)}
					<div class="p-4 hover:bg-slate-50 transition-colors {announcement.prioritaet === 'wichtig' ? 'border-l-4 border-red-500' : ''}">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<h3 class="font-semibold text-slate-800">{announcement.titel}</h3>
									{#if announcement.prioritaet === 'wichtig'}
										<span class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
											Wichtig
										</span>
									{/if}
									<span class="px-2 py-0.5 text-xs font-medium rounded {getStatusBadge(status)}">
										{getStatusLabel(status)}
									</span>
								</div>
								<p class="text-sm text-slate-600 mb-2 line-clamp-2">{announcement.nachricht}</p>
								<p class="text-xs text-slate-400">
									{formatDateRange(announcement.gueltigVon, announcement.gueltigBis)}
								</p>
							</div>
							<div class="flex gap-2 shrink-0">
								<button
									onclick={() => openEditForm(announcement)}
									class="px-3 py-1 text-sm text-teal-600 hover:bg-teal-50 rounded transition-colors"
								>
									Bearbeiten
								</button>
								<button
									onclick={() => handleDelete(announcement.id)}
									class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
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
