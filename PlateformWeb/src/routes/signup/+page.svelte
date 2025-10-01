<script lang="ts">
    import './signup.css';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { signup } from '$lib/api';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let confirmPassword = '';
    let username = '';
    let error = '';
    let isLoading = false;

    async function handleSubmit() {
        if (!email || !password || !username) {
            error = 'Veuillez remplir tous les champs';
            return;
        }

        if (password !== confirmPassword) {
            error = 'Les mots de passe ne correspondent pas';
            return;
        }

        if (password.length < 6) {
            error = 'Le mot de passe doit contenir au moins 6 caractères';
            return;
        }

        isLoading = true;
        error = '';

        try {
            const result = await signup(email, password, username);
            
            if (result.success) {
                console.log('Inscription réussie:', result.user);
                goto('/home');
            } else {
                error = result.error || 'Erreur lors de l\'inscription';
            }
        } catch (e) {
            error = 'Erreur lors de l\'inscription';
            console.error('Signup error:', e);
        } finally {
            isLoading = false;
        }
    }

    async function handleGoogleSignup() {
        try {
            console.log('Google signup attempt');
        } catch (e) {
            error = 'Erreur lors de l\'inscription avec Google';
        }
    }
</script>

<div class="signup-background">
    <div class="signup-card">
        <h1 class="form-title">Inscription</h1>
        {#if error}
            <div class="form-error">{error}</div>
        {/if}
        
        <GoogleButtonComponent onClick={handleGoogleSignup} />
        
        <div class="separator">
            <span>ou</span>
        </div>

        <form on:submit|preventDefault={handleSubmit}>
            <TextFieldComponent
                variant="outlined"
                bind:value={username}
                label="Nom d'utilisateur"
                type="text"
                required={true}
                classe="signup-input"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={email}
                label="Email"
                type="email"
                required={true}
                classe="signup-input"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={password}
                label="Mot de passe"
                type="password"
                required={true}
                classe="signup-input"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={confirmPassword}
                label="Confirmer le mot de passe"
                type="password"
                required={true}
                classe="signup-input"
            />
            <ButtonComponent
                color="primary"
                variant="raised"
                on:click={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </ButtonComponent>
        </form>
        <p class="form-link">
            Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
    </div>
</div>