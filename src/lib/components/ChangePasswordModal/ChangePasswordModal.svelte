<script lang="ts">
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';

    let { 
        isOpen = false,
        onclose = () => {},
        onsaved = () => {}
    }: { 
        isOpen?: boolean;
        onclose?: () => void;
        onsaved?: () => void;
    } = $props();
    let newPassword = $state('');
    let confirmPassword = $state('');
    let error = $state('');
    let loading = $state(false);

    function reset() {
        newPassword = '';
        confirmPassword = '';
        error = '';
        loading = false;
    }

    function close() {
        reset();
        onclose();
    }

    function handleBackdrop(e: MouseEvent) {
        if (e.target === e.currentTarget) close();
    }

    function handleKey(e: KeyboardEvent) {
        if (e.key === 'Escape') close();
    }

    $effect(() => {
        if (!newPassword && !confirmPassword) {
            error = '';
            return;
        }
        if (newPassword.length < 8) {
            error = 'Le mot de passe doit contenir au moins 8 caractères.';
            return;
        }
        if (newPassword !== confirmPassword) {
            error = 'Les mots de passe ne correspondent pas.';
            return;
        }
        error = '';
    });

    async function save() {
        if (error || !newPassword || !confirmPassword) return;
        loading = true;
        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword, confirmPassword }),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) {
                error = data?.error || 'Erreur lors du changement de mot de passe';
                loading = false;
                return;
            }
            reset();
            onsaved();
        } catch {
            error = 'Erreur réseau.';
            loading = false;
        }
    }
</script>

{#if isOpen}
<div class="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center" role="dialog" aria-modal="true" tabindex="-1" onclick={handleBackdrop} onkeydown={handleKey}>
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div class="flex items-start justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Changer le mot de passe</h3>
            <button class="text-gray-500 hover:text-gray-700" onclick={close}>✕</button>
        </div>

        <div class="grid gap-3">
            <div class="grid grid-cols-1 gap-2">
                <span class="font-semibold text-gray-700">Nouveau mot de passe</span>
                <TextFieldComponent label="" classe="nolabel" type="password" bind:value={newPassword} />
            </div>
            <div class="grid grid-cols-1 gap-2">
                <span class="font-semibold text-gray-700">Confirmer le mot de passe</span>
                <TextFieldComponent label="" classe="nolabel" type="password" bind:value={confirmPassword} />
            </div>

            {#if error}
                <div class="text-red-600 font-semibold">{error}</div>
            {/if}
        </div>

        <div class="mt-6 flex items-center justify-end gap-3">
            <ButtonComponent color="secondary" variant="outlined" href="" onClick={close}>Annuler</ButtonComponent>
            <ButtonComponent color="primary" variant="raised" href="" onClick={save} disabled={loading || !!error || !newPassword || !confirmPassword}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
            </ButtonComponent>
        </div>
    </div>
    </div>
{/if}


