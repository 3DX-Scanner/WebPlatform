<script lang="ts">
    import './signup.css';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';

    let email = '';
    let password = '';
    let confirmPassword = '';
    let username = '';
    let error = '';

    async function handleSubmit() {
        if (password !== confirmPassword) {
            error = 'Les mots de passe ne correspondent pas';
            return;
        }

        try {
            console.log('Signup attempt with:', { email, password, username });
        } catch (e) {
            error = 'Erreur lors de l\'inscription';
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
            >
                S'inscrire
            </ButtonComponent>
        </form>
        <p class="form-link">
            Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
    </div>
</div>