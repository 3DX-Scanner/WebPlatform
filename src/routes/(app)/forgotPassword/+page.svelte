<script lang="ts">
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';

    let email = '';
    let message = '';
    let error = '';

    async function handleForgotPassword() {
        message = '';
        error = '';
        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                message = data.message || 'Un mot de passe vous a été envoyé par mail';
            } else {
                error = data.error || 'Une erreur est survenue.';
            }
        } catch {
            error = 'Erreur réseau.';
        }
    }
</script>

<div class="login-background">
    <div class="login-card">
        <h1 class="form-title">Mot de passe oublié</h1>

        {#if message}
            <div class="form-success">{message}</div>
        {/if}
        {#if error}
            <div class="form-error">{error}</div>
        {/if}

        <form on:submit|preventDefault={handleForgotPassword}>
            <TextFieldComponent
                variant="outlined"
                bind:value={email}
                label="Adresse email"
                type="email"
                required={true}
                classe="login-input"
            />
            <ButtonComponent color="primary" variant="raised" on:click={handleForgotPassword}>
                Envoyer
            </ButtonComponent>
        </form>
        <p class="form-link">
            <a href="/login">← Retour à la connexion</a>
        </p>
    </div>
</div>
