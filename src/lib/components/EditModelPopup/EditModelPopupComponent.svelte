<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { X } from 'lucide-svelte';

    let { isOpen = false, model = null } = $props();
    const dispatch = createEventDispatcher();

    let folderName = $state('');
    let imageFile: File | null = $state(null);
    let modelFile: File | null = $state(null);
    let isUpdating = $state(false);
    let updateError = $state('');
    let updateSuccess = $state(false);
    let currentImageUrl = $state('');

    // Initialiser les valeurs quand le modèle change
    $effect(() => {
        if (model && isOpen) {
            // Extraire le nom du dossier depuis l'ID (format: bucketName/folderName)
            const folderNameFromId = model.id.split('/').slice(1).join('/');
            folderName = folderNameFromId;
            currentImageUrl = model.image || '';
            imageFile = null;
            modelFile = null;
            updateError = '';
            updateSuccess = false;
        }
    });

    function closePopup() {
        if (!isUpdating) {
            resetForm();
            dispatch('close');
        }
    }

    function resetForm() {
        folderName = '';
        imageFile = null;
        modelFile = null;
        isUpdating = false;
        updateError = '';
        updateSuccess = false;
        currentImageUrl = '';
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget && !isUpdating) {
            closePopup();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && !isUpdating) {
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
            updateError = 'Le nom du dossier est requis';
            return;
        }

        // Au moins un fichier doit être modifié
        if (!imageFile && !modelFile && folderName === model?.id.split('/').slice(1).join('/')) {
            updateError = 'Veuillez modifier au moins un élément';
            return;
        }

        // Validation des types de fichiers si fournis
        if (imageFile) {
            const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!imageTypes.includes(imageFile.type)) {
                updateError = 'L\'image doit être au format JPEG, PNG ou WebP';
                return;
            }
        }

        if (modelFile) {
            const modelExtensions = ['.glb', '.gltf', '.ply', '.obj'];
            const modelExtension = '.' + modelFile.name.split('.').pop()?.toLowerCase();
            if (!modelExtensions.includes(modelExtension)) {
                updateError = 'Le fichier 3D doit être au format GLB, GLTF, PLY ou OBJ';
                return;
            }
        }

        isUpdating = true;
        updateError = '';
        updateSuccess = false;

        try {
            const formData = new FormData();
            formData.append('bucketName', model.bucketName);
            formData.append('oldFolderName', model.id.split('/').slice(1).join('/'));
            formData.append('newFolderName', folderName.trim());
            
            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (modelFile) {
                formData.append('model', modelFile);
            }

            const response = await fetch('/api/models/update', {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la modification');
            }

            updateSuccess = true;
            setTimeout(() => {
                resetForm();
                dispatch('close');
                dispatch('updated');
            }, 2000);
        } catch (error: any) {
            console.error('Erreur lors de la modification:', error);
            updateError = error.message || 'Erreur lors de la modification. Veuillez réessayer.';
        } finally {
            isUpdating = false;
        }
    }
</script>

{#if isOpen && model}
    <div 
        class="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
        role="dialog" 
        aria-modal="true" 
        tabindex="-1" 
        onclick={handleBackdropClick} 
        onkeydown={handleKeydown}
    >
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] w-full max-w-2xl p-6 transform transition-all duration-300 scale-100">
            <div class="flex items-start justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Modifier le modèle 3D</h2>
                <button 
                    class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    onclick={closePopup}
                    disabled={isUpdating}
                >
                    <X class="w-6 h-6" />
                </button>
            </div>

            <form onsubmit={handleSubmit} class="space-y-6">
                <!-- Nom du dossier -->
                <div>
                    <label for="folderName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom du dossier <span class="text-red-500">*</span>
                    </label>
                    <input
                        id="folderName"
                        type="text"
                        bind:value={folderName}
                        placeholder="Ex: mon-modele-3d"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdating}
                        required
                    />
                </div>

                <!-- Image -->
                <div>
                    <label for="imageFile" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image {imageFile ? '(nouvelle image sélectionnée)' : '(optionnel)'}
                    </label>
                    {#if currentImageUrl && !imageFile}
                        <div class="mb-2">
                            <img 
                                src={currentImageUrl} 
                                alt="Image actuelle" 
                                class="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                        </div>
                    {/if}
                    <input
                        id="imageFile"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onchange={handleImageChange}
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdating}
                    />
                    {#if imageFile}
                        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Nouveau fichier sélectionné: {imageFile.name}
                        </p>
                    {/if}
                </div>

                <!-- Fichier 3D -->
                <div>
                    <label for="modelFile" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fichier 3D {modelFile ? '(nouveau fichier sélectionné)' : '(optionnel)'}
                    </label>
                    <input
                        id="modelFile"
                        type="file"
                        accept=".glb,.gltf,.ply,.obj"
                        onchange={handleModelChange}
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdating}
                    />
                    {#if modelFile}
                        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Nouveau fichier sélectionné: {modelFile.name}
                        </p>
                    {/if}
                </div>

                <!-- Messages d'erreur et de succès -->
                {#if updateError}
                    <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p class="text-sm text-red-800 dark:text-red-200">{updateError}</p>
                    </div>
                {/if}

                {#if updateSuccess}
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p class="text-sm text-green-800 dark:text-green-200">
                            ✅ Modèle modifié avec succès !
                        </p>
                    </div>
                {/if}

                <!-- Boutons -->
                <div class="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onclick={closePopup}
                        disabled={isUpdating}
                        class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating || !folderName.trim() || (!imageFile && !modelFile && folderName === model.id.split('/').slice(1).join('/'))}
                        class="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if isUpdating}
                            <span class="flex items-center gap-2">
                                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Modification en cours...
                            </span>
                        {:else}
                            Modifier
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

