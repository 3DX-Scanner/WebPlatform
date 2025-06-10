<script lang="ts">
    let email = '';
    let password = '';
    let error = '';

    async function handleSubmit() {
        try {
            // TODO: Implémenter la logique de connexion
            console.log('Login attempt with:', { email, password });
        } catch (e) {
            error = 'Erreur lors de la connexion';
        }
    }
</script>

<div class="container">
    <div class="login-form">
        <h1>Connexion</h1>
        {#if error}
            <div class="error">{error}</div>
        {/if}
        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    required
                    placeholder="Entrez votre email"
                />
            </div>
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    required
                    placeholder="Entrez votre mot de passe"
                />
            </div>
            <button type="submit">Se connecter</button>
        </form>
        <p class="signup-link">
            Pas encore de compte ? <a href="/signup">S'inscrire</a>
        </p>
    </div>
</div>

<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
    }

    .login-form {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
    }

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 1.5rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    button {
        width: 100%;
        padding: 0.75rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: #45a049;
    }

    .error {
        color: #ff0000;
        margin-bottom: 1rem;
        text-align: center;
    }

    .signup-link {
        text-align: center;
        margin-top: 1rem;
    }

    .signup-link a {
        color: #4CAF50;
        text-decoration: none;
    }

    .signup-link a:hover {
        text-decoration: underline;
    }
</style> 