<script lang="ts">
	import { onMount } from 'svelte';

	let newPassword = '';
	let error = '';
	let loading = true;

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (!token) {
			error = 'Lien invalide';
			loading = false;
			return;
		}

		try {
			const res = await fetch(`/api/reset-password?token=${token}`);
			const data = await res.json();

			if (res.ok && data.success) {
				newPassword = data.newPassword;
			} else {
				error = data.error || 'Erreur inconnue.';
			}
		} catch {
			error = 'Erreur réseau.';
		} finally {
			loading = false;
		}
	});
</script>

<div class="login-background">
	<div class="login-card">
		<h1 class="form-title">Réinitialisation du mot de passe</h1>

		{#if loading}
			<p>Chargement...</p>
		{:else if error}
			<div class="form-error">{error}</div>
		{:else}
			<p>Voici votre nouveau mot de passe :</p>
			<p class="new-password">{newPassword}</p>
			<p>
				Vous pouvez maintenant vous <a href="/login">connecter</a> avec ce mot de passe,
				puis le modifier dans votre profil.
			</p>
		{/if}
	</div>
</div>

<style>
	.new-password {
		font-weight: bold;
		font-size: 1.4rem;
		color: #2b6cb0;
		background: #f1f5f9;
		padding: 8px 12px;
		border-radius: 8px;
		word-break: break-all;
		margin: 12px 0;
	}
</style>
