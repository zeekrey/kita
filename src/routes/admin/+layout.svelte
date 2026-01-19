<script>
	import { page } from '$app/stores';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { data, children } = $props();

	const navItems = [
		{ href: '/admin', label: 'Übersicht', icon: '📊' },
		{ href: '/admin/kinder', label: 'Kinder', icon: '👶' },
		{ href: '/admin/gruppen', label: 'Gruppen', icon: '👥' },
		{ href: '/admin/erzieher', label: 'Erzieher', icon: '👩‍🏫' },
		{ href: '/admin/dienstplan', label: 'Dienstplan', icon: '📅' },
		{ href: '/admin/speiseplan', label: 'Speiseplan', icon: '🍽️' },
		{ href: '/admin/ankuendigungen', label: 'Ankündigungen', icon: '📢' },
		{ href: '/admin/benutzer', label: 'Benutzer', icon: '👤' },
		{ href: '/admin/eltern', label: 'Eltern', icon: '👨‍👩‍👧' }
	];

	async function handleLogout() {
		await authClient.signOut();
		goto('/admin/login');
	}

	function isActive(href) {
		if (href === '/admin') {
			return $page.url.pathname === '/admin';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

{#if $page.url.pathname === '/admin/login'}
	{@render children()}
{:else}
	<div class="flex h-screen bg-gray-100">
		<!-- Sidebar -->
		<aside class="w-64 bg-white shadow-md">
			<div class="border-b p-4">
				<h1 class="text-xl font-bold text-gray-800" style="font-family: var(--font-heading);">
					Kita Admin
				</h1>
			</div>
			<nav class="p-4">
				<ul class="space-y-2">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								class="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors {isActive(
									item.href
								)
									? 'bg-blue-100 text-blue-700'
									: 'text-gray-600 hover:bg-gray-100'}"
							>
								<span>{item.icon}</span>
								<span>{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</aside>

		<!-- Main content -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- Header -->
			<header class="bg-white shadow-sm">
				<div class="flex items-center justify-between px-6 py-4">
					<h2 class="text-lg font-semibold text-gray-800">
						{navItems.find((item) => isActive(item.href))?.label ?? 'Admin'}
					</h2>
					{#if data.user}
						<div class="flex items-center gap-4">
							<span class="text-sm text-gray-600">{data.user.email}</span>
							<button
								onclick={handleLogout}
								class="rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
							>
								Abmelden
							</button>
						</div>
					{/if}
				</div>
			</header>

			<!-- Page content -->
			<main class="flex-1 overflow-auto p-6">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
