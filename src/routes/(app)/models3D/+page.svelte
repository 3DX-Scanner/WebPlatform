<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import CardComponent from '$lib/components/Card/CardComponent.svelte';
    import Model3DPopupComponent from '$lib/components/Model3DPopup/Model3DPopupComponent.svelte';
    import './models3D.css';

    let isAuthenticated = false;
    let searchQuery = '';
    let selectedCategory = '';
    let sortBy = '';
    let pageKey = 0;

    let currentPopup = {
        isOpen: false,
        title: '',
        category: '',
        modelPath: ''
    };

    let models = [
        {
            id: 2,
            title: "Voiture de Course",
            subtitle: "Modèle optimisé",
            content: "Modèle 3D d'une voiture de course, idéal pour les jeux vidéo et les animations.",
            image: "/assets/model3D/voiture-course/voiture-course.jpg",
            category: "Véhicules",
            downloads: 856,
            rating: 4.5,
            modelPath: "/assets/model3D/voiture-course/voiture-course.glb",
            plyPath: "/assets/model3D/voiture-course/voiture-course.ply"
        },
        {
            id: 3,
            title: "Crâne Anatomique",
            subtitle: "Modèle médical",
            content: "Modèle 3D détaillé d'un crâne humain, utilisé dans l'éducation médicale.",
            image: "/assets/model3D/crane/crane.jpg",
            category: "Médical",
            downloads: 2345,
            rating: 4.9,
            modelPath: "/assets/model3D/crane/crane.glb"
        },
        {
            id: 7,
            title: "Crâne Humain",
            subtitle: "Modèle anatomique détaillé",
            content: "Modèle 3D d'un crâne humain haute résolution, parfait pour l'étude anatomique.",
            image: "/assets/model3D/human-skull/human-skull.jpg",
            category: "Médical",
            downloads: 1890,
            rating: 4.8,
            modelPath: "/assets/model3D/human-skull/human_skull.glb"
        },
        
        {
            id: 9,
            title: "Cars",
            subtitle: "Modèle de voiture",
            content: "Modèle 3D de voiture avec tous les détails.",
            image: "/assets/model3D/cars/cars.jpg",
            category: "Véhicules",
            downloads: 1200,
            rating: 4.7,
            modelPath: "/assets/model3D/cars/cars.glb"
        },
        {
            id: 99,
            title: "Iguana 3D",
            subtitle: "Modèle 3D d'iguane",
            content: "Cliquez pour visualiser le modèle 3D de l'iguane.",
            image: "/assets/model3D/iguana/Iguana.jpg",
            category: "Animaux",
            downloads: 354,
            rating: 4.9,
            modelPath: "/assets/model3D/iguana/iguana.glb"
        }
    ];

    let filteredModels = models;
    let categories: string[] = [];

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
        filteredModels = [...models];
        pageKey++;
    }

    onMount(() => {
        resetPageState();
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

    function handleSearch(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;
    }

    function handleCategoryChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        selectedCategory = target.value;
    }

    function handleSortChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        sortBy = target.value;
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-8">
            <input
                type="text"
                class="md:col-span-2 h-11 w-full px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rechercher (titre, sous-titre, catégorie)"
                value={searchQuery}
                on:input={handleSearch}
            />

            <select
                class="md:col-span-1 h-11 w-full px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                on:change={handleCategoryChange}
                bind:value={selectedCategory}
            >
                <option value="">Toutes les catégories</option>
                {#each categories as cat}
                    <option value={cat}>{cat}</option>
                {/each}
            </select>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each filteredModels as model (model.id)}
                <div 
                    class="card-wrapper" 
                    role="button"
                    tabindex="0"
                    on:click={() => openModelPopup(model)}
                    on:keydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openModelPopup(model);
                        }
                    }}
                    aria-label={`Voir le modèle ${model.title}`}
                >
                    <CardComponent
                        title={model.title}
                        subtitle={model.subtitle}
                        content=""
                        image={model.image}
                        elevation="medium"
                        variant="default"
                        padding="medium"
                    >
                        {#snippet title$extra()}
                            <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {model.category}
                            </span>
                        {/snippet}
                    </CardComponent>
                </div>
            {/each}
        </div>
        
        {#if filteredModels.length === 0}
            <div class="text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun modèle trouvé</h3>
                <p class="text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
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