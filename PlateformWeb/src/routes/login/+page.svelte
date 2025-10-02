<script lang="ts">
    import './login.css';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { login } from '$lib/api';
    import { goto } from '$app/navigation';
    import { user, isAuthenticated } from '$lib/stores/auth';

    let email = '';
    let password = '';
    let error = '';
    let isLoading = false;

    async function handleSubmit() {
        if (!email || !password) {
            error = 'Veuillez remplir tous les champs';
            return;
        }

        isLoading = true;
        error = '';

        try {
            const result = await login(email, password);
            
            if (result.success && result.user) {
                console.log('Connexion réussie:', result.user);
                // Mettre à jour les stores d'authentification
                user.set(result.user);
                isAuthenticated.set(true);
                goto('/home');
            } else {
                error = result.error || 'Erreur lors de la connexion';
            }
        } catch (e) {
            error = 'Erreur lors de la connexion';
            console.error('Login error:', e);
        } finally {
            isLoading = false;
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
                disabled={isLoading}
            >
                {isLoading ? 'Connexion...' : 'Se connecter'}
            </ButtonComponent>
        </form>
        <p class="form-link">
            Pas encore de compte ? <a href="/signup">S'inscrire</a>
        </p>
    </div>
</div>