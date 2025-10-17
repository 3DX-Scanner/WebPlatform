<script lang="ts">
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { goto, invalidate } from '$app/navigation';

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

        error = '';

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username })
            });

            const data = await res.json();

            if (!res.ok) {
                error = data.error || 'Erreur lors de l’inscription';
                return;
            }

            await invalidate('auth:session');
            await goto('/profile', { invalidateAll: true });
        } catch (e) {
            error = 'Erreur réseau ou serveur';
        }
    }



    async function handleGoogleSignup() {
        try {
            window.location.href = '/api/auth/google';
        } catch (e) {
            error = 'Erreur lors de l\'inscription avec Google';
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
    <div class="bg-white p-12 rounded-2xl shadow-lg min-w-[400px] max-w-[90vw] flex flex-col items-stretch">
        <h1 class="text-center mb-10 text-3xl font-bold">Inscription</h1>
        {#if error}
            <div class="text-red-500 bg-red-50 rounded-md p-3 mb-4 text-center">{error}</div>
        {/if}
        
        <GoogleButtonComponent onclick={handleGoogleSignup} />
        
        <div class="flex items-center text-center my-6">
            <div class="flex-1 border-b border-gray-300"></div>
            <span class="px-4 text-gray-600 text-sm">ou</span>
            <div class="flex-1 border-b border-gray-300"></div>
        </div>

        <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-0">
            <TextFieldComponent
                variant="outlined"
                bind:value={username}
                label="Nom d'utilisateur"
                type="text"
                required={true}
                classe="w-full"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={email}
                label="Email"
                type="email"
                required={true}
                classe="w-full"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={password}
                label="Mot de passe"
                type="password"
                required={true}
                classe="w-full"
            />
            <TextFieldComponent
                variant="outlined"
                bind:value={confirmPassword}
                label="Confirmer le mot de passe"
                type="password"
                required={true}
                classe="w-full"
            />
            <ButtonComponent
                color="primary"
                variant="raised"
                onClick={handleSubmit}
                classe="mt-5"
            >
                S'inscrire
            </ButtonComponent>
        </form>
        <p class="mt-6 text-center text-base">
            Déjà un compte ? <a href="/login" class="text-blue-600 font-medium link-hover">Se connecter</a>
        </p>
    </div>
</div>