<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { X } from 'lucide-svelte';
    
    let { 
        isOpen = false,
        onclose = () => {},
        onuploaded = () => {}
    }: {
        isOpen?: boolean;
        onclose?: () => void;
        onuploaded?: () => void;
    } = $props();

    let folderName = $state('');
    let imageFile: File | null = $state(null);
    let modelFile: File | null = $state(null);
    let isUploading = $state(false);
    let uploadError = $state('');
    let uploadSuccess = $state(false);

    function closePopup() {
        if (!isUploading) {
            resetForm();
            onclose();
        }
    }

    function resetForm() {
        folderName = '';
        imageFile = null;
        modelFile = null;
        isUploading = false;
        uploadError = '';
        uploadSuccess = false;
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget && !isUploading) {
            closePopup();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && !isUploading) {
            closePopup();
        }
    }

    function handleImageChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            imageFile = target.files[0];
        }
    }

    function handleModelChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            modelFile = target.files[0];
        }
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (!folderName.trim()) {
            uploadError = 'Le nom du dossier est requis';
            return;
        }

        if (!imageFile) {
            uploadError = 'L\'image est requise';
            return;
        }

        if (!modelFile) {
            uploadError = 'Le fichier 3D est requis';
            return;
        }

        // Validation des types de fichiers
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!imageTypes.includes(imageFile.type)) {
            uploadError = 'L\'image doit être au format JPEG, PNG ou WebP';
            return;
        }

        const modelExtensions = ['.blend1', '.x3d', '.blend', '.glb', '.gltf', '.ply', '.stl', '.obj', '.usdc', '.svg', '.mtl', '.fbx', '.dae', '.abc'];
        const modelExtension = '.' + modelFile.name.split('.').pop()?.toLowerCase();
        if (!modelExtensions.includes(modelExtension)) {
            uploadError = 'Le fichier 3D doit être au format BLEND, BLEND1, X3D, GLB, GLTF, PLY, STL, OBJ, USDC, SVG, MTL, FBX, DAE ou ABC';
            return;
        }

        isUploading = true;
        uploadError = '';
        uploadSuccess = false;

        try {
            const formData = new FormData();
            formData.append('folderName', folderName.trim());
            formData.append('image', imageFile);
            formData.append('model', modelFile);

            const response = await fetch('/api/upload-model', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'upload');
            }

            uploadSuccess = true;
            setTimeout(() => {
                resetForm();
                onclose();
                onuploaded();
            }, 2000);
        } catch (error: any) {
            console.error('Erreur lors de l\'upload:', error);
            uploadError = error.message || 'Erreur lors de l\'upload. Veuillez réessayer.';
        } finally {
            isUploading = false;
        }
    }
</script>

{#if isOpen}
    <div 
        class="fixed inset-0 z-[1000] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" 
        role="dialog" 
        aria-modal="true" 
        tabindex="-1" 
        onclick={handleBackdropClick} 
        onkeydown={handleKeydown}
    >
        <div class="bg-card border border-border rounded-3xl shadow-lg w-full max-w-2xl p-6 transform transition-all duration-300 scale-100">
            <div class="flex items-start justify-between mb-6">
                <h2 class="text-2xl font-bold text-card-foreground">Importer un modèle 3D</h2>
                <Button 
                    variant="ghost" 
                    size="icon"
                    onclick={closePopup}
                    disabled={isUploading}
                    class="h-8 w-8"
                >
                    <X class="h-4 w-4" />
                </Button>
            </div>

            <form onsubmit={handleSubmit} class="space-y-6">
                <!-- Nom du dossier -->
                <div>
                    <Label for="folderName" class="mb-2">
                        Nom du dossier <span class="text-destructive">*</span>
                    </Label>
                    <Input
                        id="folderName"
                        type="text"
                        bind:value={folderName}
                        placeholder="Ex: mon-modele-3d"
                        disabled={isUploading}
                        required
                        class="w-full"
                    />
                </div>

                <!-- Image -->
                <div>
                    <Label for="imageFile" class="mb-2">
                        Image <span class="text-destructive">*</span>
                    </Label>
                    <input
                        id="imageFile"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onchange={handleImageChange}
                        class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUploading}
                        required
                    />
                    {#if imageFile}
                        <p class="mt-2 text-sm text-muted-foreground">
                            Fichier sélectionné: {imageFile.name}
                        </p>
                    {/if}
                </div>

                <!-- Fichier 3D -->
                <div>
                    <Label for="modelFile" class="mb-2">
                        Fichier 3D <span class="text-destructive">*</span>
                    </Label>
                    <input
                        id="modelFile"
                        type="file"
                        accept=".blend1,.x3d,.blend,.glb,.gltf,.ply,.stl,.obj,.usdc,.svg,.mtl,.fbx,.dae,.abc"
                        onchange={handleModelChange}
                        class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUploading}
                        required
                    />
                    {#if modelFile}
                        <p class="mt-2 text-sm text-muted-foreground">
                            Fichier sélectionné: {modelFile.name}
                        </p>
                    {/if}
                </div>

                <!-- Messages d'erreur et de succès -->
                {#if uploadError}
                    <div class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p class="text-sm text-destructive">{uploadError}</p>
                    </div>
                {/if}

                {#if uploadSuccess}
                    <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p class="text-sm text-green-600 dark:text-green-400">
                            ✅ Modèle importé avec succès !
                        </p>
                    </div>
                {/if}

                <!-- Boutons -->
                <div class="flex items-center justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onclick={closePopup}
                        disabled={isUploading}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        disabled={isUploading || !folderName.trim() || !imageFile || !modelFile}
                    >
                        {#if isUploading}
                            <span class="flex items-center gap-2">
                                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Upload en cours...
                            </span>
                        {:else}
                            Importer
                        {/if}
                    </Button>
                </div>
            </form>
        </div>
    </div>
{/if}

