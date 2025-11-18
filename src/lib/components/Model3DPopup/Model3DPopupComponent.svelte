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
    <div class="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" tabindex="-1" onclick={handleBackdropClick} onkeydown={handleKeydown}>
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] w-full max-w-7xl p-6 transform transition-all duration-300 scale-100">
            <div class="flex items-start justify-between mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{title} - Visualisation Interactive</h2>
                <button class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none transition-colors" onclick={closePopup}>✕</button>
            </div>
            <div class="w-full flex justify-center mb-4">
                <div class="px-8">
                    <ThreeDViewverComponent bind:this={viewerRef} {modelPath} width={1200} height={550} noCard={true} />
                </div>
            </div>
            <div class="flex items-center justify-between -mx-1">
                <div class="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium mx-1">
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
