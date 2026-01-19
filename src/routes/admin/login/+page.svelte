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
		} catch (e) {
			error = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<div class="w-full max-w-md">
		<div class="bg-white rounded-lg shadow-md p-8">
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold text-gray-800" style="font-family: var(--font-heading);">
					Kita Admin
				</h1>
				<p class="text-gray-600 mt-2">Bitte melden Sie sich an</p>
			</div>

			{#if error}
				<div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
					{error}
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						E-Mail
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
						placeholder="admin@kita.de"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Passwort
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
				>
					{loading ? 'Wird angemeldet...' : 'Anmelden'}
				</button>
			</form>
		</div>
	</div>
</div>
