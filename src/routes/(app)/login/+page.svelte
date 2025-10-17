<script lang="ts">
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { onMount } from 'svelte';
    import { goto, invalidate } from '$app/navigation';

    let email = '';
    let password = '';
    let error = '';
    let isAuthenticated = false;

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        
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
                await invalidate('auth:session');
                await goto('/profile', { invalidateAll: true });
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
            window.location.href = '/api/auth/google';
        } catch (e) {
            error = 'Erreur lors de la connexion avec Google';
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
    <div class="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg min-w-[400px] max-w-[90vw] flex flex-col items-stretch">
        <h1 class="text-center mb-10 text-3xl font-bold text-gray-900 dark:text-white">Connexion</h1>
        {#if error}
            <div class="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md p-3 mb-4 text-center">{error}</div>
        {/if}
        
        <GoogleButtonComponent onclick={handleGoogleLogin} />
        
        <div class="flex items-center text-center my-6">
            <div class="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
            <span class="px-4 text-gray-600 dark:text-gray-400 text-sm">ou</span>
            <div class="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
        </div>

        <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-1">
            <TextFieldComponent
                variant="outlined"
                bind:value={email}
                label="Email"
                type="email"
                required={true}
                classe="w-full max-w-full box-border"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={password}
                label="Mot de passe"
                type="password"
                required={true}
                classe="w-full max-w-full box-border"
            />
            <div class="-mt-2 text-left text-xs">
                <a href="/forgotPassword" class="text-blue-600 font-normal link-hover">Mot de passe oublié ?</a>
            </div>
            <ButtonComponent
                color="primary"
                variant="raised"
                onClick={handleSubmit}
                classe="mt-8"
            >
                Se connecter
            </ButtonComponent>
        </form>
        <p class="mt-6 text-center text-base text-gray-700 dark:text-gray-300">
            Pas encore de compte ? <a href="/signup" class="text-blue-600 dark:text-blue-400 font-medium link-hover">S'inscrire</a>
        </p>
    </div>
</div>