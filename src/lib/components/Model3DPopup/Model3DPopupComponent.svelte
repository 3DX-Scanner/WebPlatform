<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import ThreeDViewverComponent from '$lib/components/3DViewver/3DViewverComponent.svelte';

    let { isOpen = false, title = '', category = '', modelPath = '' } = $props();
    const dispatch = createEventDispatcher();
    let viewerRef = $state<any>(null);

    function closePopup() { dispatch('close'); }
    function downloadModel() { dispatch('download', { modelPath, title }); }
    function handleBackdropClick(event: MouseEvent) { if (event.target === event.currentTarget) closePopup(); }
    function handleKeydown(event: KeyboardEvent) { if (event.key === 'Escape') closePopup(); }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center" role="dialog" aria-modal="true" tabindex="-1" onclick={handleBackdropClick} onkeydown={handleKeydown}>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6">
            <div class="flex items-start justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900">{title} - Visualisation Interactive</h2>
                <button class="text-gray-500 hover:text-gray-700 text-2xl leading-none" onclick={closePopup}>✕</button>
            </div>
            <div class="mb-4">
                <ThreeDViewverComponent bind:this={viewerRef} {modelPath} width={975} height={500} />
            </div>
            <div class="flex items-center justify-between -mx-1">
                <div class="bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium mx-1">
                    {category}
                </div>
                <div class="flex items-center gap-3 mx-1">
                    <ButtonComponent href="" variant="outlined" color="primary" onClick={closePopup}>Fermer</ButtonComponent>
                    <ButtonComponent href="" variant="raised" color="primary" onClick={downloadModel}>Télécharger</ButtonComponent>
                </div>
            </div>
        </div>
    </div>
{/if}
