<script lang="ts">
    import './login.css';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';

    let email = '';
    let password = '';
    let error = '';
    let isAuthenticated = false;

    async function handleSubmit() {
        try {
            console.log('Login attempt with:', { email, password });
        } catch (e) {
            error = 'Erreur lors de la connexion';
        }
    }

    async function handleGoogleLogin() {
        try {
            // TODO: Implémenter la connexion Google
            console.log('Google login attempt');
        } catch (e) {
            error = 'Erreur lors de la connexion avec Google';
        }
    }
</script>

<div class="login-background">
    <div class="login-card">
        <h1 class="form-title">Connexion</h1>
        {#if error}
            <div class="form-error">{error}</div>
        {/if}
        
        <GoogleButtonComponent onClick={handleGoogleLogin} />
        
        <div class="separator">
            <span>ou</span>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <TextFieldComponent
                variant="outlined"
                bind:value={email}
                label="Email"
                type="email"
                required={true}
                classe="login-input"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={password}
                label="Mot de passe"
                type="password"
                required={true}
                classe="login-input"
            />
            <ButtonComponent
                color="primary"
                variant="raised"
                on:click={handleSubmit}
            >
                Se connecter
            </ButtonComponent>
        </form>
        <p class="form-link">
            Pas encore de compte ? <a href="/signup">S'inscrire</a>
        </p>
    </div>
</div>