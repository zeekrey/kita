<script>
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const MEAL_TYPES = {
		fruehstueck: { label: 'Frühstück', icon: '🥐', color: 'from-orange-400 to-yellow-300' },
		mittagessen: { label: 'Mittagessen', icon: '🍝', color: 'from-red-400 to-orange-300' },
		snack: { label: 'Snack', icon: '🍎', color: 'from-green-400 to-lime-300' }
	};

	// Current time state for the clock
	let currentTime = $state('');
	let currentDate = $state('');

	function updateClock() {
		const now = new Date();
		currentTime = now.toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
		currentDate = now.toLocaleDateString('de-DE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}

	function calculateAge(birthday) {
		const today = new Date();
		const birth = new Date(birthday);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	}

	function getMealByType(type) {
		return data.meals.find((m) => m.typ === type);
	}

	// Filter for important announcements only on kiosk
	const importantAnnouncements = $derived(
		data.announcements.filter((a) => a.prioritaet === 'wichtig')
	);

	onMount(() => {
		updateClock();

		// Update clock every second
		const clockInterval = setInterval(updateClock, 1000);

		// Auto-refresh data every 2 minutes (less frequent for kiosk)
		const refreshInterval = setInterval(() => {
			invalidateAll();
		}, 120000);

		return () => {
			clearInterval(clockInterval);
			clearInterval(refreshInterval);
		};
	});
</script>

<svelte:head>
	<title>Kita Kinder-Ansicht</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
</svelte:head>

<div class="kiosk-container">
	<!-- Animated Background Decorations -->
	<div class="decorations">
		<div class="cloud cloud-1">☁️</div>
		<div class="cloud cloud-2">☁️</div>
		<div class="cloud cloud-3">☁️</div>
		<div class="sun">🌞</div>
	</div>

	<!-- Header -->
	<header class="kiosk-header">
		<div class="header-left">
			<h1 class="kiosk-title">
				<span class="title-icon">🏠</span>
				Sonnenschein Kita
			</h1>
		</div>
		<div class="header-right">
			<div class="date-display">{currentDate}</div>
			<div class="time-display">{currentTime}</div>
		</div>
	</header>

	<!-- Main Content Grid -->
	<main class="kiosk-main">
		<!-- Birthday Section - Prominent when there are birthdays -->
		{#if data.birthdayChildren.length > 0}
			<section class="birthday-section animate-bounce-in">
				<div class="section-header birthday-header">
					<span class="header-icon">🎂</span>
					<h2>Geburtstag heute!</h2>
					<span class="header-icon">🎉</span>
				</div>
				<div class="birthday-cards">
					{#each data.birthdayChildren as child (child.id)}
						<div class="birthday-card">
							<div class="confetti-container">
								<span class="confetti">🎊</span>
								<span class="confetti delay-1">🎈</span>
								<span class="confetti delay-2">🎁</span>
								<span class="confetti delay-3">⭐</span>
							</div>
							<div class="birthday-photo">
								{#if child.fotoPath}
									<img src={child.fotoPath} alt="" class="photo-img" />
								{:else}
									<div class="photo-placeholder">🎈</div>
								{/if}
							</div>
							<div class="birthday-info">
								<p class="birthday-name">{child.vorname}</p>
								<p class="birthday-age">wird {calculateAge(child.geburtstag)} Jahre alt!</p>
								{#if child.gruppeName}
									<span class="group-badge" style="background-color: {child.gruppeFarbe}">
										{child.gruppeName}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Content Columns -->
		<div class="content-columns">
			<!-- Meals Section -->
			<section class="meals-section animate-slide-up" style="--delay: 0.1s">
				<div class="section-header meals-header">
					<span class="header-icon">🍴</span>
					<h2>Was gibt es heute?</h2>
				</div>
				<div class="meals-grid">
					{#each ['fruehstueck', 'mittagessen', 'snack'] as mealType (mealType)}
						{@const meal = getMealByType(mealType)}
						{@const mealInfo = MEAL_TYPES[mealType]}
						<div class="meal-card bg-gradient-to-br {mealInfo.color}">
							<div class="meal-icon">{mealInfo.icon}</div>
							<div class="meal-info">
								<h3 class="meal-type">{mealInfo.label}</h3>
								<p class="meal-description">
									{meal ? meal.beschreibung : 'Noch nicht eingetragen'}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Teachers Section -->
			<section class="teachers-section animate-slide-up" style="--delay: 0.2s">
				<div class="section-header teachers-header">
					<span class="header-icon">👩‍🏫</span>
					<h2>Wer ist heute da?</h2>
				</div>
				{#if data.teachersOnDuty.length === 0}
					<div class="empty-state">
						<span class="empty-icon">🌙</span>
						<p>Gerade niemand im Dienst</p>
					</div>
				{:else}
					<div class="teachers-grid">
						{#each data.teachersOnDuty as teacher (teacher.id)}
							<div class="teacher-card">
								{#if teacher.erzieherFotoPath}
									<img src={teacher.erzieherFotoPath} alt="" class="teacher-photo" />
								{:else}
									<div class="teacher-photo-placeholder">
										{teacher.erzieherVorname[0]}
									</div>
								{/if}
								<p class="teacher-name">{teacher.erzieherVorname}</p>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>

		<!-- Important Announcements Banner -->
		{#if importantAnnouncements.length > 0}
			<section class="announcements-banner animate-slide-up" style="--delay: 0.3s">
				<div class="announcement-scroll">
					{#each importantAnnouncements as announcement (announcement.id)}
						<div class="announcement-item">
							<span class="announcement-icon">⚠️</span>
							<span class="announcement-title">{announcement.titel}</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="kiosk-footer">
		<div class="footer-decorations">
			<span>🌷</span>
			<span>🌻</span>
			<span>🌸</span>
			<span>🌺</span>
			<span>🌼</span>
		</div>
	</footer>
</div>

<style>
	/* ================================
	   Base Styles & Variables
	   ================================ */
	.kiosk-container {
		min-height: 100vh;
		background: linear-gradient(180deg, #87ceeb 0%, #e0f4ff 50%, #98fb98 100%);
		padding: 1.5rem;
		font-family: var(--font-body);
		overflow: hidden;
		position: relative;
	}

	/* ================================
	   Decorations
	   ================================ */
	.decorations {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		pointer-events: none;
		z-index: 0;
	}

	.cloud {
		position: absolute;
		font-size: 4rem;
		opacity: 0.7;
		animation: float 20s ease-in-out infinite;
	}

	.cloud-1 {
		top: 5%;
		left: 10%;
		animation-delay: 0s;
	}

	.cloud-2 {
		top: 8%;
		right: 15%;
		animation-delay: -7s;
		font-size: 3rem;
	}

	.cloud-3 {
		top: 12%;
		left: 50%;
		animation-delay: -14s;
		font-size: 3.5rem;
	}

	.sun {
		position: absolute;
		top: 2%;
		right: 5%;
		font-size: 5rem;
		animation: pulse 3s ease-in-out infinite;
	}

	/* ================================
	   Header
	   ================================ */
	.kiosk-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 10;
	}

	.kiosk-title {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		font-weight: 700;
		color: #ff6b6b;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.title-icon {
		font-size: 2rem;
	}

	.header-right {
		text-align: right;
	}

	.date-display {
		font-size: 1.25rem;
		color: #666;
		font-weight: 500;
	}

	.time-display {
		font-size: 3rem;
		font-weight: 700;
		color: #4ecdc4;
		line-height: 1;
	}

	/* ================================
	   Main Content
	   ================================ */
	.kiosk-main {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ================================
	   Birthday Section
	   ================================ */
	.birthday-section {
		background: linear-gradient(135deg, #fff5e6 0%, #ffe4cc 100%);
		border-radius: 2rem;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
		border: 4px solid #ffb347;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		font-family: var(--font-heading);
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
	}

	.birthday-header h2 {
		color: #ff6b6b;
	}

	.header-icon {
		font-size: 2rem;
	}

	.birthday-cards {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
	}

	.birthday-card {
		background: white;
		border-radius: 1.5rem;
		padding: 1.5rem;
		text-align: center;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
		min-width: 180px;
	}

	.confetti-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100%;
		pointer-events: none;
	}

	.confetti {
		position: absolute;
		font-size: 1.5rem;
		animation: confetti-fall 3s ease-in-out infinite;
	}

	.confetti:nth-child(1) {
		left: 10%;
		animation-delay: 0s;
	}
	.confetti:nth-child(2) {
		left: 30%;
		animation-delay: 0.5s;
	}
	.confetti:nth-child(3) {
		left: 60%;
		animation-delay: 1s;
	}
	.confetti:nth-child(4) {
		left: 85%;
		animation-delay: 1.5s;
	}

	.birthday-photo {
		margin-bottom: 1rem;
	}

	.photo-img {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		border: 4px solid #ffb347;
	}

	.photo-placeholder {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: linear-gradient(135deg, #ffb347, #ff6b6b);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		margin: 0 auto;
	}

	.birthday-name {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		color: #333;
		margin: 0;
	}

	.birthday-age {
		font-size: 1rem;
		color: #ff6b6b;
		margin: 0.25rem 0;
		font-weight: 600;
	}

	.group-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	/* ================================
	   Content Columns
	   ================================ */
	.content-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	/* ================================
	   Meals Section
	   ================================ */
	.meals-section {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 2rem;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.meals-header h2 {
		color: #ff8c00;
	}

	.meals-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.meal-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-radius: 1.5rem;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.meal-icon {
		font-size: 3rem;
	}

	.meal-info {
		flex: 1;
	}

	.meal-type {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
	}

	.meal-description {
		font-size: 1rem;
		margin: 0.25rem 0 0;
		opacity: 0.95;
	}

	/* ================================
	   Teachers Section
	   ================================ */
	.teachers-section {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 2rem;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.teachers-header h2 {
		color: #4ecdc4;
	}

	.teachers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
	}

	.teacher-card {
		text-align: center;
		padding: 1rem;
		background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
		border-radius: 1.5rem;
	}

	.teacher-photo {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #4ecdc4;
		margin: 0 auto 0.5rem;
		display: block;
	}

	.teacher-photo-placeholder {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #4ecdc4, #45b7d1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 700;
		color: white;
		margin: 0 auto 0.5rem;
	}

	.teacher-name {
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 600;
		color: #333;
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.empty-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	/* ================================
	   Announcements Banner
	   ================================ */
	.announcements-banner {
		background: linear-gradient(90deg, #ff6b6b, #ff8e53);
		border-radius: 1.5rem;
		padding: 1rem 2rem;
		color: white;
		overflow: hidden;
	}

	.announcement-scroll {
		display: flex;
		gap: 3rem;
		animation: scroll-left 20s linear infinite;
	}

	.announcement-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
	}

	.announcement-icon {
		font-size: 1.5rem;
	}

	.announcement-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 600;
	}

	/* ================================
	   Footer
	   ================================ */
	.kiosk-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		z-index: 5;
	}

	.footer-decorations {
		display: flex;
		justify-content: center;
		gap: 2rem;
		font-size: 2rem;
		opacity: 0.8;
	}

	/* ================================
	   Animations
	   ================================ */
	@keyframes float {
		0%,
		100% {
			transform: translateX(0) translateY(0);
		}
		25% {
			transform: translateX(20px) translateY(-10px);
		}
		50% {
			transform: translateX(40px) translateY(5px);
		}
		75% {
			transform: translateX(20px) translateY(-5px);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	@keyframes confetti-fall {
		0% {
			transform: translateY(-20px) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translateY(100px) rotate(360deg);
			opacity: 0;
		}
	}

	@keyframes bounce-in {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes scroll-left {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}

	.animate-bounce-in {
		animation: bounce-in 0.6s ease-out forwards;
	}

	.animate-slide-up {
		animation: slide-up 0.5s ease-out forwards;
		animation-delay: var(--delay, 0s);
		opacity: 0;
	}

	/* ================================
	   Responsive - Tablet/TV Optimizations
	   ================================ */
	@media (max-width: 768px) {
		.content-columns {
			grid-template-columns: 1fr;
		}

		.kiosk-title {
			font-size: 1.75rem;
		}

		.time-display {
			font-size: 2rem;
		}
	}

	@media (min-width: 1920px) {
		.kiosk-container {
			padding: 2rem;
		}

		.kiosk-title {
			font-size: 3.5rem;
		}

		.time-display {
			font-size: 4rem;
		}

		.section-header h2 {
			font-size: 2.5rem;
		}

		.meal-icon {
			font-size: 4rem;
		}

		.teacher-photo,
		.teacher-photo-placeholder {
			width: 120px;
			height: 120px;
		}
	}
</style>
