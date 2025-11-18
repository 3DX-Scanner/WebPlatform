<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import ModelFiltersComponent from '$lib/components/ModelFilters/ModelFiltersComponent.svelte';
    import ModelCardComponent from '$lib/components/ModelCard/ModelCardComponent.svelte';
    import EmptyStateComponent from '$lib/components/EmptyState/EmptyStateComponent.svelte';
    import Model3DPopupComponent from '$lib/components/Model3DPopup/Model3DPopupComponent.svelte';

    let isAuthenticated = false;
    let searchQuery = '';
    let selectedCategory = '';
    let sortBy = '';
    let pageKey = 0;
    let isLoading = true;
    let loadError = '';

    let currentPopup = {
        isOpen: false,
        title: '',
        category: '',
        modelPath: ''
    };

    let selectedModelId: number | null = null;

    let models: any[] = [];
    let filteredModels: any[] = [];
    let categories: string[] = [];

    async function loadModels() {
        isLoading = true;
        loadError = '';
        
        try {
            const response = await fetch('/api/models');
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du chargement des modèles');
            }
            
            models = data.models || [];
            filteredModels = [...models];
            isLoading = false;
        } catch (error) {
            console.error('Erreur lors du chargement des modèles:', error);
            loadError = 'Impossible de charger les modèles. Veuillez réessayer plus tard.';
            isLoading = false;
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

    $: filteredModels = filterAndSortModels(models, searchQuery, selectedCategory, sortBy);
    $: categories = Array.from(new Set(models.map((m) => m.category))).sort();

    function handleSearchChange(value: string) {
        searchQuery = value;
    }

    function handleCategoryChange(value: string) {
        selectedCategory = value;
    }

    function handleSortChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        sortBy = target.value;
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
            
            console.log(`Téléchargement de ${title} réussi`);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du modèle. Vérifiez que le fichier existe.');
        }
    }
</script>

<div class="min-h-screen bg-gray-50">

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {#if isLoading}
            <div class="flex items-center justify-center min-h-[400px]">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p class="mt-4 text-gray-600">Chargement des modèles...</p>
                </div>
            </div>
        {:else if loadError}
            <EmptyStateComponent 
                icon="❌"
                title="Erreur de chargement"
                description={loadError}
            />
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
                        isSelected={selectedModelId === model.id && currentPopup.isOpen}
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