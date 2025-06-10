<script lang="ts">
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
            // TODO: Implémenter la logique d'inscription
            console.log('Signup attempt with:', { email, password, username });
        } catch (e) {
            error = 'Erreur lors de l\'inscription';
        }
    }
</script>

<div class="container">
    <div class="signup-form">
        <h1>Inscription</h1>
        {#if error}
            <div class="error">{error}</div>
        {/if}
        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input
                    type="text"
                    id="username"
                    bind:value={username}
                    required
                    placeholder="Choisissez un nom d'utilisateur"
                />
            </div>
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
                    placeholder="Choisissez un mot de passe"
                />
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirmer le mot de passe</label>
                <input
                    type="password"
                    id="confirmPassword"
                    bind:value={confirmPassword}
                    required
                    placeholder="Confirmez votre mot de passe"
                />
            </div>
            <button type="submit">S'inscrire</button>
        </form>
        <p class="login-link">
            Déjà un compte ? <a href="/login">Se connecter</a>
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

    .signup-form {
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

    .login-link {
        text-align: center;
        margin-top: 1rem;
    }

    .login-link a {
        color: #4CAF50;
        text-decoration: none;
    }

    .login-link a:hover {
        text-decoration: underline;
    }
</style> 