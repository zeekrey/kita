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
		} catch {
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
			<img src={value} alt="Vorschau" class="h-32 w-32 rounded-lg border object-cover" />
			<button
				type="button"
				onclick={handleRemove}
				class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-sm text-white transition-colors hover:bg-red-600"
			>
				x
			</button>
		</div>
	{/if}

	<label class="upload-btn mt-2 block">
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFileSelect}
			disabled={uploading}
			class="hidden"
		/>
		<span
			class="inline-block cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 {uploading
				? 'cursor-not-allowed opacity-50'
				: ''}"
		>
			{uploading ? 'Lädt...' : value ? 'Foto ändern' : 'Foto auswählen'}
		</span>
	</label>

	{#if error}
		<p class="mt-2 text-sm text-red-600">{error}</p>
	{/if}
</div>
