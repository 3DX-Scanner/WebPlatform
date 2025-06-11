<script lang="ts">
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
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
</script>

<div class="login-background">
    <div class="login-card">
        <h1 class="form-title">Connexion</h1>
        {#if error}
            <div class="form-error">{error}</div>
        {/if}
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

<style>
.login-background {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6fa;
}

.login-card {
    background: #fff;
    padding: 2.5rem 2rem 2rem 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    min-width: 350px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.form-title {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: bold;
}

.form-error {
    color: #ff0000;
    background: #ffeaea;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.login-input {
    width: 100%;
}

.login-btn {
    margin-top: 1rem;
    width: 100%;
    font-size: 1.1rem;
}

.form-link {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 1rem;
}
.form-link a {
    color: #1976d2;
    text-decoration: none;
    font-weight: 500;
}
.form-link a:hover {
    text-decoration: underline;
}
</style>