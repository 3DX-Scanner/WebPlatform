<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
    import { onMount } from 'svelte';
    import { goto, invalidate } from '$app/navigation';

    let email = '';
    let password = '';
    let error = '';

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

<div class="min-h-screen flex items-center justify-center bg-muted px-4">
    <div class="bg-card p-12 rounded-2xl shadow-lg min-w-[400px] max-w-[90vw] flex flex-col items-stretch">
        <h1 class="text-center mb-10 text-3xl font-bold text-card-foreground">Connexion</h1>
        {#if error}
            <div class="text-destructive bg-destructive/10 rounded-md p-3 mb-4 text-center">{error}</div>
        {/if}
        
        <GoogleButtonComponent onclick={handleGoogleLogin} />
        
        <div class="flex items-center text-center my-6">
            <div class="flex-1 border-b border-border"></div>
            <span class="px-4 text-muted-foreground text-sm">ou</span>
            <div class="flex-1 border-b border-border"></div>
        </div>

        <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <Label for="email">Email</Label>
                <Input
                    id="email"
                    bind:value={email}
                    type="email"
                    required={true}
                    class="w-full"
                />
            </div>
            <div class="flex flex-col gap-2">
                <Label for="password">Mot de passe</Label>
                <Input
                    id="password"
                    bind:value={password}
                    type="password"
                    required={true}
                    class="w-full"
                />
            </div>
            <div class="-mt-2 text-left text-xs">
                <a href="/forgotPassword" class="text-primary font-normal link-hover">Mot de passe oublié ?</a>
            </div>
            <Button
                variant="default"
                onclick={handleSubmit}
                class="mt-8 w-full"
            >
                Se connecter
            </Button>
        </form>
        <p class="mt-6 text-center text-base text-muted-foreground">
            Pas encore de compte ? <a href="/signup" class="text-primary font-medium link-hover">S'inscrire</a>
        </p>
    </div>
</div>