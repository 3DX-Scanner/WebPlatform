<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import ModelFiltersComponent from '$lib/components/ModelFilters/ModelFiltersComponent.svelte';
    import ModelCardComponent from '$lib/components/ModelCard/ModelCardComponent.svelte';
    import EmptyStateComponent from '$lib/components/EmptyState/EmptyStateComponent.svelte';
    import Model3DPopupComponent from '$lib/components/Model3DPopup/Model3DPopupComponent.svelte';
    import ImportModelPopupComponent from '$lib/components/ImportModelPopup/ImportModelPopupComponent.svelte';
    import EditModelPopupComponent from '$lib/components/EditModelPopup/EditModelPopupComponent.svelte';
    import ConfirmDialogComponent from '$lib/components/ConfirmDialog/ConfirmDialogComponent.svelte';
    import {EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle, Root} from "$lib/components/ui/empty";
    import {Button} from "$lib/components/ui/button";

    let { data } = $props();
    let isAuthenticated = data?.isAuthenticated ?? false;
    let searchQuery = $state('');
    let selectedCategories = $state<string[]>([]);
    let sortBy = $state('');
    let pageKey = $state(0);
    let isLoading = $state(true);
    let loadError = $state('');

    let currentPopup = $state({
        isOpen: false,
        title: '',
        category: '',
        modelPath: ''
    });

    let importPopupOpen = $state(false);
    let editPopupOpen = $state(false);
    let deleteConfirmOpen = $state(false);
    let selectedModelForEdit: any = $state(null);
    let selectedModelForDelete: any = $state(null);
    let selectedModelId: number | null = $state(null);

    let models = $state<any[]>([]);

    async function loadModels() {
        isLoading = true;
        loadError = '';
        
        try {
            const response = await fetch('/api/models', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du chargement des modèles');
            }
            
            models = data.models || [];
            isLoading = false;
        } catch (error) {
            loadError = 'Impossible de charger les modèles. Veuillez réessayer plus tard.';
            isLoading = false;
            return;
        }
    }

    function resetPageState() {
        currentPopup = {
            isOpen: false,
            title: '',
            category: '',
            modelPath: ''
        };

        searchQuery = '';
        selectedCategories = [];
        sortBy = '';
        pageKey++;
    }

    onMount(() => {
        loadModels();
    });

    afterNavigate(() => {
        resetPageState();
    });

    function filterAndSortModels(list: typeof models, search: string, categoryFilters: string[], sort: string) {
        const normalize = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const q = normalize(search.trim());

        let filtered = list.filter(model => {
            const title = normalize(model.title);
            const subtitle = normalize(model.subtitle);
            const content = normalize(model.content);
            const category = normalize(model.category);

            const matchesSearch = q === '' || title.includes(q) || subtitle.includes(q) || content.includes(q) || category.includes(q);
            
            let matchesCategory = true;
            if (categoryFilters.length > 0) {
                matchesCategory = categoryFilters.some(filter => {
                    if (filter === 'public') {
                        return model.isPublic === true;
                    } else if (filter === 'privé') {
                        return model.isPublic === false;
                    } else if (filter === 'likés') {
                        return model.isLiked === true;
                    }
                    return false;
                });
            }
            
            return matchesSearch && matchesCategory;
        });

        if (sort === 'popular') {
            filtered = filtered.sort((a, b) => b.downloads - a.downloads);
        } else if (sort === 'rating') {
            filtered = filtered.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'recent') {
            filtered = filtered.sort((a, b) => b.id - a.id);
        }

        return filtered;
    }

    let filteredModels = $derived(filterAndSortModels(models, searchQuery, selectedCategories, sortBy));

    function handleSearchChange(value: string) {
        searchQuery = value;
    }

    function handleCategoryChange(value: string[]) {
        selectedCategories = value;
    }

    function handleModelLike(modelId: string | number, liked: boolean, likeCount: number) {
        const modelIndex = models.findIndex(m => m.id === modelId);
        if (modelIndex !== -1) {
            const model = models[modelIndex];
            if (model.isLiked !== liked || model.likes !== likeCount) {
                model.isLiked = liked;
                model.likes = likeCount;
                models = models;
            }
        }
    }

    function openModelPopup(model: any) {
        selectedModelId = model.id;
        currentPopup = {
            isOpen: true,
            title: model.title,
            category: model.category,
            modelPath: model.modelPath
        };
    }

    function closePopup() {
        currentPopup.isOpen = false;
        selectedModelId = null;
    }

    async function downloadModel(event: CustomEvent) {
        const { modelPath, title } = event.detail;
        try {
            const response = await fetch(modelPath);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title}.glb`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Erreur lors du téléchargement du modèle. Vérifiez que le fichier existe.');
            return;
        }
    }

    function handleOpenImport() {
        if (!isAuthenticated) {
            alert('Vous devez être connecté pour importer un modèle.');
            return;
        }
        importPopupOpen = true;
    }

    function handleCloseImport() {
        importPopupOpen = false;
    }

    function handleModelUploaded() {
        loadModels();
    }

    function handleEditModel(model: any) {
        if (!isAuthenticated) {
            alert('Vous devez être connecté pour modifier un modèle.');
            return;
        }
        selectedModelForEdit = model;
        editPopupOpen = true;
    }

    function handleCloseEdit() {
        editPopupOpen = false;
        selectedModelForEdit = null;
    }

    function handleModelUpdated() {
        loadModels();
    }

    function handleDeleteModel(model: any) {
        selectedModelForDelete = model;
        deleteConfirmOpen = true;
    }

    function handleDeleteConfirm() {
        if (!selectedModelForDelete) return;
        
        const model = selectedModelForDelete;
        const folderName = model.id.split('/').slice(1).join('/');
        
        deleteConfirmOpen = false;
        
        performDelete(model, folderName);
        
        selectedModelForDelete = null;
    }

    function handleDeleteCancel() {
        selectedModelForDelete = null;
        deleteConfirmOpen = false;
    }

    async function performDelete(model: any, folderName: string) {
        try {
            const response = await fetch(`/api/models/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    bucketName: model.bucketName,
                    folderName: folderName
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la suppression');
            }

            loadModels();
        } catch (error: any) {
            alert(error.message || 'Erreur lors de la suppression du modèle. Veuillez réessayer.');
        }
    }
</script>

<div class="min-h-screen bg-background">

    <section class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {#if isLoading}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {#each Array(10) as _}
                    <div class="bg-card rounded-2xl shadow-lg overflow-hidden animate-pulse">
                        <div class="w-full h-48 bg-muted"></div>
                        
                        <div class="p-4 space-y-3">
                            <div class="flex items-center gap-2">
                                <div class="h-5 w-16 bg-muted rounded-full"></div>
                            </div>
                            
                            <div class="h-6 bg-muted rounded w-3/4"></div>
                            
                            <div class="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else if loadError}
            <Root>
                <EmptyHeader>
                    <EmptyTitle>Erreur de chargement</EmptyTitle>
                    <EmptyDescription>
                        {loadError}
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button onclick={() => { window.location.reload(); } }>
                        Réessayer
                    </Button>
                </EmptyContent>
            </Root>
        {:else}
            <ModelFiltersComponent 
                {searchQuery}
                selectedCategories={selectedCategories}
                {isAuthenticated}
                onSearchChange={handleSearchChange}
                onCategoryChange={handleCategoryChange}
                onOpenImport={handleOpenImport}
            />
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {#each filteredModels as model (model.id)}
                    <ModelCardComponent 
                        {model}
                        isSelected={selectedModelId === model.id && currentPopup.isOpen}
                        onClick={() => openModelPopup(model)}
                        showMenu={isAuthenticated && !model.isPublic}
                        {isAuthenticated}
                        onEdit={() => handleEditModel(model)}
                        onDelete={() => handleDeleteModel(model)}
                        onLike={handleModelLike}
                    />
                {/each}
            </div>
            
            {#if filteredModels.length === 0}
                <EmptyStateComponent 
                    icon=""
                    title="Aucun modèle trouvé"
                    description="Essayez de modifier vos critères de recherche"
                />
            {/if}
        {/if}
    </section>

    <Model3DPopupComponent
        isOpen={currentPopup.isOpen}
        title={currentPopup.title}
        category={currentPopup.category}
        modelPath={currentPopup.modelPath}
        onclose={closePopup}
        ondownload={downloadModel}
    />

    <ImportModelPopupComponent
        isOpen={importPopupOpen}
        onclose={handleCloseImport}
        onuploaded={handleModelUploaded}
    />

    <EditModelPopupComponent
        isOpen={editPopupOpen}
        model={selectedModelForEdit}
        on:close={handleCloseEdit}
        on:updated={handleModelUpdated}
    />

    <ConfirmDialogComponent
        isOpen={deleteConfirmOpen}
        title="Supprimer le modèle"
        message={selectedModelForDelete 
            ? `Êtes-vous sûr de vouloir supprimer le modèle "${selectedModelForDelete.id.split('/').slice(1).join('/')}" ?\n\nCette action est irréversible et supprimera tous les fichiers associés.`
            : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        on:confirm={handleDeleteConfirm}
        on:cancel={handleDeleteCancel}
    />
</div>