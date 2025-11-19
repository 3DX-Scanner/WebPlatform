<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';

    let email = '';
    let message = '';
    let error = '';

    async function handleForgotPassword() {
        message = '';
        error = '';
        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                message = data.message || 'Un mot de passe vous a été envoyé par mail';
            } else {
                error = data.error || 'Une erreur est survenue.';
            }
        } catch {
            error = 'Erreur réseau.';
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-muted px-4">
    <div class="bg-card p-12 rounded-2xl shadow-lg min-w-[400px] max-w-[90vw] flex flex-col items-stretch">
        <h1 class="text-center mb-10 text-3xl font-bold text-card-foreground">Mot de passe oublié</h1>

        {#if message}
            <div class="text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20 rounded-md p-3 mb-4 text-center">{message}</div>
        {/if}
        {#if error}
            <div class="text-destructive bg-destructive/10 rounded-md p-3 mb-4 text-center">{error}</div>
        {/if}

        <form on:submit|preventDefault={handleForgotPassword} class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <Label for="email">Adresse email</Label>
                <Input
                    id="email"
                    bind:value={email}
                    type="email"
                    required={true}
                    class="w-full"
                />
            </div>
            <Button
                variant="default"
                onclick={handleForgotPassword}
                class="mt-8 w-full"
            >
                Envoyer
            </Button>
        </form>
        <p class="mt-6 text-center text-base text-muted-foreground">
            <a href="/login" class="text-primary font-medium link-hover">← Retour à la connexion</a>
        </p>
    </div>
</div>
