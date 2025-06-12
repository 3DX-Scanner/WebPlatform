<script lang="ts">
    import './models3D.css';
    import { onMount } from 'svelte';
    import CardComponent from '$lib/components/Card/CardComponent.svelte';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import HeaderComponent from '$lib/components/Header/HeaderComponent.svelte';
    import ThreeDViewverComponent from '$lib/components/3DViewver/3DViewverComponent.svelte';

    let isAuthenticated = false;
    let searchQuery = '';
    let showIguana3D = false;
    let models = [
        {
            id: 1,
            title: "Statue de la Liberté",
            subtitle: "Modèle haute précision",
            content: "Modèle 3D détaillé de la Statue de la Liberté, parfait pour l'impression 3D ou la visualisation.",
            image: "/images/models/statue-liberte.jpg",
            category: "Architecture",
            downloads: 1234,
            rating: 4.8
        },
        {
            id: 2,
            title: "Voiture de Course",
            subtitle: "Modèle optimisé",
            content: "Modèle 3D d'une voiture de course, idéal pour les jeux vidéo et les animations.",
            image: "/images/models/voiture-course.jpg",
            category: "Véhicules",
            downloads: 856,
            rating: 4.5
        },
        {
            id: 3,
            title: "Crâne Anatomique",
            subtitle: "Modèle médical",
            content: "Modèle 3D détaillé d'un crâne humain, utilisé dans l'éducation médicale.",
            image: "/images/models/crane.jpg",
            category: "Médical",
            downloads: 2345,
            rating: 4.9
        },
        {
            id: 4,
            title: "Bâtiment Moderne",
            subtitle: "Architecture contemporaine",
            content: "Modèle 3D d'un bâtiment moderne avec tous les détails architecturaux.",
            image: "/images/models/batiment.jpg",
            category: "Architecture",
            downloads: 567,
            rating: 4.6
        },
        {
            id: 5,
            title: "Robot Industriel",
            subtitle: "Modèle technique",
            content: "Modèle 3D d'un robot industriel avec toutes les pièces mobiles.",
            image: "/images/models/robot.jpg",
            category: "Industrie",
            downloads: 789,
            rating: 4.7
        },
        {
            id: 6,
            title: "Vase Antique",
            subtitle: "Art et Culture",
            content: "Modèle 3D d'un vase antique grec avec motifs détaillés.",
            image: "/images/models/vase.jpg",
            category: "Art",
            downloads: 432,
            rating: 4.4
        },
        {
            id: 99,
            title: "Iguana 3D",
            subtitle: "Modèle 3D d'iguane",
            content: "Cliquez pour visualiser le modèle 3D de l'iguane.",
            image: "/assets/model3D/iguana/Iguana.png",
            category: "Animaux",
            downloads: 0,
            rating: 0
        }
    ];

    let filteredModels = models;

    $: {
        filteredModels = models.filter(model => 
            model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    function handleSearch(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;
    }
</script>

<HeaderComponent {isAuthenticated} />

<div class="page-container">
    <section class="search-section">
        <h1 class="page-title">Nos Modèles 3D</h1>
        <div class="search-container">
            <input
                type="text"
                placeholder="Rechercher un modèle..."
                bind:value={searchQuery}
                on:input={handleSearch}
                class="search-input"
            />
            <div class="search-filters">
                <select class="filter-select">
                    <option value="">Toutes les catégories</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Véhicules">Véhicules</option>
                    <option value="Médical">Médical</option>
                    <option value="Industrie">Industrie</option>
                    <option value="Art">Art</option>
                    <option value="Animaux">Animaux</option>
                </select>
                <select class="filter-select">
                    <option value="">Trier par</option>
                    <option value="popular">Popularité</option>
                    <option value="recent">Plus récent</option>
                    <option value="rating">Note</option>
                </select>
            </div>
        </div>
    </section>

    <section class="models-grid">
        {#each filteredModels as model (model.id)}
            <CardComponent
                title={model.title}
                subtitle={model.subtitle}
                content={model.content}
                image={model.image}
                elevation="medium"
                variant="default"
                padding="medium"
                on:click={() => model.id === 99 ? showIguana3D = true : null}
            >
                <div class="model-meta" slot="actions">
                    <span class="model-category">{model.category}</span>
                    <div class="model-stats">
                        <span class="model-downloads">⬇️ {model.downloads}</span>
                        <span class="model-rating">⭐ {model.rating}</span>
                    </div>
                    <ButtonComponent
                        variant="raised"
                        color="primary"
                        on:click={() => model.id === 99 ? showIguana3D = true : window.location.href = `/modeles/${model.id}`}
                    >
                        Voir le modèle
                    </ButtonComponent>
                </div>
            </CardComponent>
        {/each}
    </section>

    {#if showIguana3D}
        <div class="modal-backdrop" on:click={() => showIguana3D = false}></div>
        <div class="modal">
            <ThreeDViewverComponent modelPath="/lib/assets/model3D/iguana/iguana.gltf" />
            <button class="close-btn" on:click={() => showIguana3D = false}>Fermer</button>
        </div>
    {/if}
</div>

<style>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
}
.modal {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: #fff; padding: 2rem; border-radius: 16px; z-index: 1001;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; align-items: center;
}
.close-btn {
  margin-top: 1rem;
  background: #222; color: #fff; border: none; border-radius: 8px; padding: 0.5rem 1.5rem; cursor: pointer;
}
</style>