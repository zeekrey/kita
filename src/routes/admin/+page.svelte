<script>
	let { data } = $props();
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<a href="/admin/kinder" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
			<div class="flex items-center gap-4">
				<div class="text-4xl">👶</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-800">Kinder</h3>
					<p class="text-gray-600 text-sm">Kinder verwalten</p>
				</div>
			</div>
		</a>

		<a href="/admin/gruppen" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
			<div class="flex items-center gap-4">
				<div class="text-4xl">👥</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-800">Gruppen</h3>
					<p class="text-gray-600 text-sm">Gruppen verwalten</p>
				</div>
			</div>
		</a>

		<a href="/admin/erzieher" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
			<div class="flex items-center gap-4">
				<div class="text-4xl">👩‍🏫</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-800">Erzieher</h3>
					<p class="text-gray-600 text-sm">Personal verwalten</p>
				</div>
			</div>
		</a>

		<a href="/admin/dienstplan" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
			<div class="flex items-center gap-4">
				<div class="text-4xl">📅</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-800">Dienstplan</h3>
					<p class="text-gray-600 text-sm">Dienste planen</p>
				</div>
			</div>
		</a>

		<a href="/admin/speiseplan" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
			<div class="flex items-center gap-4">
				<div class="text-4xl">🍽️</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-800">Speiseplan</h3>
					<p class="text-gray-600 text-sm">Mahlzeiten planen</p>
				</div>
			</div>
		</a>

		<a href="/admin/ankuendigungen" class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
			<div class="flex items-center gap-4">
				<div class="text-4xl">📢</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-800">Ankündigungen</h3>
					<p class="text-gray-600 text-sm">Nachrichten verwalten</p>
				</div>
			</div>
		</a>
	</div>
</div>
