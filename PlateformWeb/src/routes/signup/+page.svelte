<script lang="ts">
    import './signup.css';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { signup } from '$lib/api';
    import { goto } from '$app/navigation';
    import { isAuthenticated, user } from '$lib/stores/auth';

    let email = '';
    let password = '';
    let confirmPassword = '';
    let error = '';
    let isLoading = false;
    let showSuccessPopup = false;

    async function handleSubmit() {
        console.log('=== BOUTON CLIQUE ===');
        console.log('handleSubmit called with:', { email, password: password ? '***' : 'empty' });
        
        if (!email || !password) {
            error = 'Veuillez remplir tous les champs';
            console.log('Validation failed: missing fields');
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            error = 'Veuillez entrer une adresse email valide';
            console.log('Validation failed: invalid email format');
            return;
        }

        if (password !== confirmPassword) {
            error = 'Les mots de passe ne correspondent pas';
            console.log('Validation failed: passwords do not match');
            return;
        }

        if (password.length < 6) {
            error = 'Le mot de passe doit contenir au moins 6 caractères';
            console.log('Validation failed: password too short');
            return;
        }

        console.log('All validations passed, calling signup API');
        isLoading = true;
        error = '';

        try {
            const result = await signup(email, password);
            
            console.log('Signup API returned:', result);
            
            if (result.success) {
                console.log('Inscription réussie:', result.user);
                // Mettre à jour l'état d'authentification
                isAuthenticated.set(true);
                user.set(result.user);
                showSuccessPopup = true;
                // Rediriger vers home après 2 secondes
                setTimeout(() => {
                    goto('/home');
                }, 2000);
            } else {
                error = result.error || 'Erreur lors de l\'inscription';
                console.log('Signup failed:', error);
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
                onClick={handleSubmit}
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

<!-- Popup de succès -->
{#if showSuccessPopup}
    <div class="success-popup-overlay" on:click={() => showSuccessPopup = false}>
        <div class="success-popup" on:click|stopPropagation>
            <div class="success-icon">✅</div>
            <h2>Inscription réussie !</h2>
            <p>Votre compte a été créé avec succès.</p>
            <p class="redirect-message">Redirection vers l'accueil...</p>
        </div>
    </div>
{/if}