<script>
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(event) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			const result = await authClient.signIn.email({
				email,
				password
			});

			if (result.error) {
				error = 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';
			} else {
				goto('/admin');
			}
		} catch {
			error = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-white p-8 shadow-md">
			<div class="mb-8 text-center">
				<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
					Kita Admin
				</h1>
				<p class="mt-2 text-gray-600">Bitte melden Sie sich an</p>
			</div>

			{#if error}
				<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
					{error}
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-6">
				<div>
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> E-Mail </label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						placeholder="admin@kita.de"
					/>
				</div>

				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
						Passwort
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
				>
					{loading ? 'Wird angemeldet...' : 'Anmelden'}
				</button>
			</form>
		</div>
	</div>
</div>
