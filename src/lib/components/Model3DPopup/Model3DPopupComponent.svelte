<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from '$lib/components/ui/button';
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
        <div class="bg-card rounded-2xl shadow-2xl w-full max-w-5xl p-6">
            <div class="flex items-start justify-between mb-4">
                <h2 class="text-xl font-bold text-card-foreground">{title} - Visualisation Interactive</h2>
                <button class="text-muted-foreground hover:text-foreground text-2xl leading-none" onclick={closePopup}>✕</button>
            </div>
            <div class="w-full flex justify-center mb-4 px-4">
                <div class="w-full max-w-[1200px]">
                    <ThreeDViewverComponent bind:this={viewerRef} {modelPath} width={1200} height={550} noCard={true} />
                </div>
            </div>
            <div class="flex items-center justify-between -mx-1">
                <div class="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm font-medium mx-1">
                    {category}
                </div>
                <div class="flex items-center gap-3 mx-1">
                    <Button variant="outline" onclick={closePopup}>Fermer</Button>
                    <Button variant="default" onclick={downloadModel}>Télécharger</Button>
                </div>
            </div>
        </div>
    </div>
{/if}
