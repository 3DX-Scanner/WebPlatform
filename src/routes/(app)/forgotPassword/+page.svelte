<script lang="ts">
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';

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

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="bg-white p-12 rounded-2xl shadow-lg min-w-[400px] max-w-[90vw] flex flex-col items-stretch">
        <h1 class="text-center mb-10 text-3xl font-bold">Mot de passe oublié</h1>

        {#if message}
            <div class="text-green-500 bg-green-50 rounded-md p-3 mb-4 text-center">{message}</div>
        {/if}
        {#if error}
            <div class="text-red-500 bg-red-50 rounded-md p-3 mb-4 text-center">{error}</div>
        {/if}

        <form on:submit|preventDefault={handleForgotPassword} class="flex flex-col gap-1">
            <TextFieldComponent
                variant="outlined"
                bind:value={email}
                label="Adresse email"
                type="email"
                required={true}
                classe="w-full max-w-full box-border"
            />
            <ButtonComponent 
                color="primary" 
                variant="raised" 
                onClick={handleForgotPassword}
                classe="mt-8"
            >
                Envoyer
            </ButtonComponent>
        </form>
        <p class="mt-6 text-center text-base">
            <a href="/login" class="text-blue-600 font-medium link-hover">← Retour à la connexion</a>
        </p>
    </div>
</div>
