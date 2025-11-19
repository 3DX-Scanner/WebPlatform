<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import GoogleButtonComponent from '$lib/components/Button/GoogleButtonComponent.svelte';
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

<div class="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
    <div class="bg-card p-12 rounded-2xl shadow-lg min-w-[400px] max-w-[90vw] flex flex-col items-stretch">
        <h1 class="text-center mb-10 text-3xl font-bold text-card-foreground">Inscription</h1>
        {#if error}
            <div class="text-destructive bg-destructive/10 rounded-md p-3 mb-4 text-center">{error}</div>
        {/if}

        <GoogleButtonComponent onclick={handleGoogleSignup} />

        <div class="flex items-center text-center my-6">
            <div class="flex-1 border-b border-border"></div>
            <span class="px-4 text-muted-foreground text-sm">ou</span>
            <div class="flex-1 border-b border-border"></div>
        </div>

        <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <Label for="username">Nom d'utilisateur</Label>
                <Input
                    id="username"
                    bind:value={username}
                    type="text"
                    required={true}
                    class="w-full"
                />
            </div>
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
            <div class="flex flex-col gap-2">
                <Label for="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                    id="confirmPassword"
                    bind:value={confirmPassword}
                    type="password"
                    required={true}
                    class="w-full"
                />
            </div>
            <Button
                variant="default"
                onclick={handleSubmit}
                class="mt-5 w-full"
            >
                S'inscrire
            </Button>
        </form>
        <p class="mt-6 text-center text-base text-muted-foreground">
            Déjà un compte ? <a href="/login" class="text-primary font-medium link-hover">Se connecter</a>
        </p>
    </div>
</div>