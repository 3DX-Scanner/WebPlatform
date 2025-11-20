<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import ModelFiltersComponent from '$lib/components/ModelFilters/ModelFiltersComponent.svelte';
    import ModelCardComponent from '$lib/components/ModelCard/ModelCardComponent.svelte';
    import EmptyStateComponent from '$lib/components/EmptyState/EmptyStateComponent.svelte';
    import Model3DPopupComponent from '$lib/components/Model3DPopup/Model3DPopupComponent.svelte';
    import {EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle, Root} from "$lib/components/ui/empty";
    import {Button} from "$lib/components/ui/button";

    let searchQuery = $state('');
    let selectedCategory = $state('');
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

    let models: any[] = [];

    async function loadModels() {
        isLoading = true;
        loadError = '';

        const response = await fetch('/api/models');
        const data = await response.json();

        if (!response.ok) {
            loadError = 'Impossible de charger les modèles. Veuillez réessayer plus tard.';
            isLoading = false;
            return;
        }

        models = data.models || [];
        filteredModels = [...models];
        isLoading = false;
    }

    function resetPageState() {
        currentPopup = {
            isOpen: false,
            title: '',
            category: '',
            modelPath: ''
        };

        searchQuery = '';
        selectedCategory = '';
        sortBy = '';

        if (models.length > 0) {
            filteredModels = [...models];
        }

        pageKey++;
    }

    onMount(() => {
        loadModels();
    });

    afterNavigate(() => {
        resetPageState();
    });

    function filterAndSortModels(list: typeof models, search: string, categoryFilter: string, sort: string) {
        const normalize = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const q = normalize(search.trim());

        let filtered = list.filter(model => {
            const title = normalize(model.title);
            const subtitle = normalize(model.subtitle);
            const content = normalize(model.content);
            const category = normalize(model.category);

            const matchesSearch = q === '' || title.includes(q) || subtitle.includes(q) || content.includes(q) || category.includes(q);
            const matchesCategory = !categoryFilter || model.category === categoryFilter;
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

    let filteredModels = $derived(filterAndSortModels(models, searchQuery, selectedCategory, sortBy));
    let categories = $derived(Array.from(new Set(models.map((m) => m.category))).sort());

    function handleSearchChange(value: string) {
        searchQuery = value;
    }

    function handleCategoryChange(value: string) {
        selectedCategory = value;
    }

    function openModelPopup(model: any) {
        currentPopup = {
            isOpen: true,
            title: model.title,
            category: model.category,
            modelPath: model.modelPath
        };
    }

    function closePopup() {
        currentPopup.isOpen = false;
    }

    async function downloadModel(event: CustomEvent) {
        const { modelPath, title } = event.detail;

        const response = await fetch(modelPath);

        if (!response.ok) {
            alert('Erreur lors du téléchargement du modèle. Vérifiez que le fichier existe.');
            return;
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
    }
</script>

<div class="min-h-screen bg-muted">

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {#if isLoading}
            <div class="flex items-center justify-center min-h-[400px]">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p class="mt-4 text-muted-foreground">Chargement des modèles...</p>
                </div>
            </div>
        {:else if loadError}
            <Root>
                <EmptyHeader>
                    <EmptyTitle>Erreur de chargement</EmptyTitle>
                    <EmptyDescription>
                        Le page n'a pas pu être chargée. Veuillez réessayer.
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
                {selectedCategory}
                {categories}
                onSearchChange={handleSearchChange}
                onCategoryChange={handleCategoryChange}
            />
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each filteredModels as model (model.id)}
                    <ModelCardComponent 
                        {model}
                        onClick={() => openModelPopup(model)}
                    />
                {/each}
            </div>
            
            {#if filteredModels.length === 0}
                <EmptyStateComponent 
                    icon="🔍"
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
        on:close={closePopup}
        on:download={downloadModel}
    />
</div>