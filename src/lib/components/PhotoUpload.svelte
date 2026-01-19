<script>
	let { value = $bindable(), onUpload } = $props();

	let uploading = $state(false);
	let error = $state('');

	async function handleFileSelect(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		uploading = true;
		error = '';

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error;
				return;
			}

			value = result.path;
			onUpload?.(result.path);
		} catch (e) {
			error = 'Upload fehlgeschlagen';
		} finally {
			uploading = false;
		}
	}

	function handleRemove() {
		value = '';
		onUpload?.('');
	}
</script>

<div class="photo-upload">
	{#if value}
		<div class="relative inline-block">
			<img src={value} alt="Vorschau" class="w-32 h-32 object-cover rounded-lg border" />
			<button
				type="button"
				onclick={handleRemove}
				class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
			>
				x
			</button>
		</div>
	{/if}

	<label class="upload-btn block mt-2">
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFileSelect}
			disabled={uploading}
			class="hidden"
		/>
		<span
			class="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors {uploading
				? 'opacity-50 cursor-not-allowed'
				: ''}"
		>
			{uploading ? 'Lädt...' : value ? 'Foto ändern' : 'Foto auswählen'}
		</span>
	</label>

	{#if error}
		<p class="text-red-600 text-sm mt-2">{error}</p>
	{/if}
</div>
