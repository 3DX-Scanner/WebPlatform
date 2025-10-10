<script lang="ts">
    import './login.css';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { onMount } from 'svelte';

    let email = '';
    let password = '';
    let error = '';
    let isAuthenticated = false;

    // Gérer les erreurs OAuth dans l'URL
    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        
        // Seulement afficher les erreurs réelles
        if (errorParam) {
            const errorMessages: Record<string, string> = {
                'access_denied': 'Vous avez refusé l\'accès à Google',
                'no_code': 'Code d\'autorisation manquant',
                'token_exchange_failed': 'Échec de l\'échange de token',
                'user_info_failed': 'Impossible de récupérer vos informations',
                'email_not_verified': 'Votre email Google n\'est pas vérifié',
                'auth_failed': 'Erreur lors de l\'authentification Google'
            };
            
            error = errorMessages[errorParam] || 'Erreur d\'authentification';
            
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, '/login');
        }
    });

    async function handleSubmit() {
        error = '';
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                isAuthenticated = true;
                window.location.href = '/profile';
            } else {
                const data = await res.json();
                error = data.message || 'Erreur lors de la connexion';
            }
        } catch (e) {
            error = 'Erreur réseau';
        }
    }


    async function handleGoogleLogin() {
        try {
            // Rediriger vers l'endpoint Google OAuth
            window.location.href = '/api/auth/google';
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
            <div class="forgot-password-link">
            <a href="/forgotPassword">Mot de passe oublié ?</a>
            </div>
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