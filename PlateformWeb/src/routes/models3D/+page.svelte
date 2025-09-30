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
    let showCrane3D = false;
    let showVoiture3D = false;
    let showSkull3D = false;
    let showHouse3D = false;
    let showCars3D = false;
    let showPointCloud = false;
    let models = [
        {
            id: 2,
            title: "Voiture de Course",
            subtitle: "Modèle optimisé",
            content: "Modèle 3D d'une voiture de course, idéal pour les jeux vidéo et les animations.",
            image: "/assets/model3D/voiture-course/voiture-course.jpg",
            category: "Véhicules",
            downloads: 856,
            rating: 4.5
        },
        {
            id: 3,
            title: "Crâne Anatomique",
            subtitle: "Modèle médical",
            content: "Modèle 3D détaillé d'un crâne humain, utilisé dans l'éducation médicale.",
            image: "/assets/model3D/crane/crane.jpg",
            category: "Médical",
            downloads: 2345,
            rating: 4.9
        },
        {
            id: 7,
            title: "Crâne Humain",
            subtitle: "Modèle anatomique détaillé",
            content: "Modèle 3D d'un crâne humain haute résolution, parfait pour l'étude anatomique.",
            image: "/assets/model3D/human-skull/human-skull.jpg",
            category: "Médical",
            downloads: 1890,
            rating: 4.8
        },
        {
            id: 8,
            title: "Maison Ancienne",
            subtitle: "Architecture historique",
            content: "Modèle 3D d'une maison ancienne avec tous les détails architecturaux d'époque.",
            image: "/assets/model3D/house/old-house.jpg",
            category: "Architecture",
            downloads: 623,
            rating: 4.6
        },
        {
            id: 9,
            title: "Cars",
            subtitle: "Modèle de voiture",
            content: "Modèle 3D de voiture avec tous les détails.",
            image: "/assets/model3D/cars/cars.jpg",
            category: "Véhicules",
            downloads: 1200,
            rating: 4.7
        },
        {
            id: 99,
            title: "Iguana 3D",
            subtitle: "Modèle 3D d'iguane",
            content: "Cliquez pour visualiser le modèle 3D de l'iguane.",
            image: "/assets/model3D/iguana/Iguana.jpg",
            category: "Animaux",
            downloads: 354,
            rating: 4.9
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

    async function downloadModel(modelPath: string, modelName: string) {
        try {
            // Télécharger le fichier via fetch
            const response = await fetch(modelPath);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const blob = await response.blob();
            
            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${modelName}.glb`;
            document.body.appendChild(link);
            link.click();
            
            // Nettoyer
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log(`Téléchargement de ${modelName} réussi`);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du modèle. Vérifiez que le fichier existe.');
        }
    }

    let viewerRef;

    function convertToPointCloud() {
        showPointCloud = true;
        // Forcer le rechargement du composant
        setTimeout(() => {
            if (viewerRef && viewerRef.reload) {
                viewerRef.reload();
            }
        }, 100);
    }

    function showGLBModel() {
        showPointCloud = false;
        // Forcer le rechargement du composant
        setTimeout(() => {
            if (viewerRef && viewerRef.reload) {
                viewerRef.reload();
            }
        }, 100);
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
                on:click={() => {
                    if (model.id === 99) showIguana3D = true;
                    else if (model.id === 3) showCrane3D = true;
                    else if (model.id === 2) showVoiture3D = true;
                    else if (model.id === 7) showSkull3D = true;
                    else if (model.id === 8) showHouse3D = true;
                    else if (model.id === 9) showCars3D = true;
                }}
            >
                <div class="model-meta" slot="actions">
                    <span class="model-category">{model.category}</span>
                    <ButtonComponent
                        variant="raised"
                        color="primary"
                        onClick={() => {
                            if (model.id === 99) showIguana3D = true;
                            else if (model.id === 3) showCrane3D = true;
                            else if (model.id === 2) showVoiture3D = true;
                            else if (model.id === 7) showSkull3D = true;
                            else if (model.id === 8) showHouse3D = true;
                            else if (model.id === 9) showCars3D = true;
                            else window.location.href = `/modeles/${model.id}`;
                        }}
                    >
                        Voir le modèle
                    </ButtonComponent>
                </div>
            </CardComponent>
        {/each}
    </section>

    {#if showIguana3D}
        <div 
            class="modal-backdrop" 
            role="button"
            tabindex="0"
            on:click={() => showIguana3D = false}
            on:keydown={(e) => e.key === 'Escape' && (showIguana3D = false)}
            aria-label="Fermer la modal"
        ></div>
        <div class="modal">
            <div class="modal-header">
                <h2>Iguana 3D - Visualisation Interactive</h2>
                <button class="close-btn" on:click={() => showIguana3D = false}>✕</button>
            </div>
            <div class="modal-content">
                <ThreeDViewverComponent 
                    bind:this={viewerRef}
                    modelPath="/assets/model3D/iguana/iguana.glb" 
                    plyPath="/assets/model3D/iguana/iguana.ply"
                    width={1000} 
                    height={600} 
                    showPointCloud={showPointCloud}
                />
            </div>
            <div class="modal-footer">
                <div class="model-info">
                    <span class="model-title">Iguana 3D</span>
                    <span class="model-category">Animaux</span>
                </div>
                <div class="mini-cards-container">
                    <div class="mini-card" on:click={showGLBModel}>
                        <div class="mini-card-icon">🎯</div>
                        <span class="mini-card-text">3D</span>
                    </div>
                    <div class="mini-card" on:click={convertToPointCloud}>
                        <div class="mini-card-icon">☁️</div>
                        <span class="mini-card-text">Nuage de point</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <ButtonComponent variant="outlined" onClick={() => showIguana3D = false}>
                        Fermer
                    </ButtonComponent>
                    <ButtonComponent variant="raised" color="primary" onClick={() => downloadModel("/assets/model3D/iguana/iguana.glb", "Iguana 3D")}>
                        Télécharger
                    </ButtonComponent>
                </div>
            </div>
        </div>
    {/if}

    {#if showCrane3D}
        <div 
            class="modal-backdrop" 
            role="button"
            tabindex="0"
            on:click={() => showCrane3D = false}
            on:keydown={(e) => e.key === 'Escape' && (showCrane3D = false)}
            aria-label="Fermer la modal"
        ></div>
        <div class="modal">
            <div class="modal-header">
                <h2>Crâne Anatomique - Visualisation Interactive</h2>
                <button class="close-btn" on:click={() => showCrane3D = false}>✕</button>
            </div>
            <div class="modal-content">
                <ThreeDViewverComponent 
                    bind:this={viewerRef}
                    modelPath="/assets/model3D/crane/crane.glb" 
                    plyPath="/assets/model3D/crane/crane.ply"
                    width={1000} 
                    height={600} 
                    showPointCloud={showPointCloud}
                />
            </div>
            <div class="modal-footer">
                <div class="model-info">
                    <span class="model-title">Crâne Anatomique</span>
                    <span class="model-category">Médical</span>
                </div>
                <div class="mini-cards-container">
                    <div class="mini-card" on:click={showGLBModel}>
                        <div class="mini-card-icon">🎯</div>
                        <span class="mini-card-text">3D</span>
                    </div>
                    <div class="mini-card" on:click={convertToPointCloud}>
                        <div class="mini-card-icon">☁️</div>
                        <span class="mini-card-text">Nuage de point</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <ButtonComponent variant="outlined" onClick={() => showCrane3D = false}>
                        Fermer
                    </ButtonComponent>
                    <ButtonComponent variant="raised" color="primary" onClick={() => downloadModel("/assets/model3D/crane/crane.glb", "Crâne Anatomique")}>
                        Télécharger
                    </ButtonComponent>
                </div>
            </div>
        </div>
    {/if}

    {#if showVoiture3D}
        <div 
            class="modal-backdrop" 
            role="button"
            tabindex="0"
            on:click={() => showVoiture3D = false}
            on:keydown={(e) => e.key === 'Escape' && (showVoiture3D = false)}
            aria-label="Fermer la modal"
        ></div>
        <div class="modal">
            <div class="modal-header">
                <h2>Voiture de Course - Visualisation Interactive</h2>
                <button class="close-btn" on:click={() => showVoiture3D = false}>✕</button>
            </div>
            <div class="modal-content">
                <ThreeDViewverComponent 
                    bind:this={viewerRef}
                    modelPath="/assets/model3D/voiture-course/voiture-course.glb" 
                    plyPath="/assets/model3D/voiture-course/voiture-course.ply"
                    width={1000} 
                    height={600} 
                    showPointCloud={showPointCloud}
                />
            </div>
            <div class="modal-footer">
                <div class="model-info">
                    <span class="model-title">Voiture de Course</span>
                    <span class="model-category">Véhicules</span>
                </div>
                <div class="mini-cards-container">
                    <div class="mini-card" on:click={showGLBModel}>
                        <div class="mini-card-icon">🎯</div>
                        <span class="mini-card-text">3D</span>
                    </div>
                    <div class="mini-card" on:click={convertToPointCloud}>
                        <div class="mini-card-icon">☁️</div>
                        <span class="mini-card-text">Nuage de point</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <ButtonComponent variant="outlined" onClick={() => showVoiture3D = false}>
                        Fermer
                    </ButtonComponent>
                    <ButtonComponent variant="raised" color="primary" onClick={() => downloadModel("/assets/model3D/voiture-course/voiture-course.glb", "Voiture de Course")}>
                        Télécharger
                    </ButtonComponent>
                </div>
            </div>
        </div>
    {/if}

    {#if showSkull3D}
        <div 
            class="modal-backdrop" 
            role="button"
            tabindex="0"
            on:click={() => showSkull3D = false}
            on:keydown={(e) => e.key === 'Escape' && (showSkull3D = false)}
            aria-label="Fermer la modal"
        ></div>
        <div class="modal">
            <div class="modal-header">
                <h2>Crâne Humain - Visualisation Interactive</h2>
                <button class="close-btn" on:click={() => showSkull3D = false}>✕</button>
            </div>
            <div class="modal-content">
                <ThreeDViewverComponent 
                    bind:this={viewerRef}
                    modelPath="/assets/model3D/human-skull/human_skull.glb" 
                    plyPath="/assets/model3D/human-skull/human_skull.ply"
                    width={1000} 
                    height={600} 
                    showPointCloud={showPointCloud}
                />
            </div>
            <div class="modal-footer">
                <div class="model-info">
                    <span class="model-title">Crâne Humain</span>
                    <span class="model-category">Médical</span>
                </div>
                <div class="mini-cards-container">
                    <div class="mini-card" on:click={showGLBModel}>
                        <div class="mini-card-icon">🎯</div>
                        <span class="mini-card-text">3D</span>
                    </div>
                    <div class="mini-card" on:click={convertToPointCloud}>
                        <div class="mini-card-icon">☁️</div>
                        <span class="mini-card-text">Nuage de point</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <ButtonComponent variant="outlined" onClick={() => showSkull3D = false}>
                        Fermer
                    </ButtonComponent>
                    <ButtonComponent variant="raised" color="primary" onClick={() => downloadModel("/assets/model3D/human-skull/human_skull.glb", "Crâne Humain")}>
                        Télécharger
                    </ButtonComponent>
                </div>
            </div>
        </div>
    {/if}

    {#if showHouse3D}
        <div 
            class="modal-backdrop" 
            role="button"
            tabindex="0"
            on:click={() => showHouse3D = false}
            on:keydown={(e) => e.key === 'Escape' && (showHouse3D = false)}
            aria-label="Fermer la modal"
        ></div>
        <div class="modal">
            <div class="modal-header">
                <h2>Maison Ancienne - Visualisation Interactive</h2>
                <button class="close-btn" on:click={() => showHouse3D = false}>✕</button>
            </div>
            <div class="modal-content">
                <ThreeDViewverComponent 
                    bind:this={viewerRef}
                    modelPath="/assets/model3D/house/old_house.glb" 
                    plyPath="/assets/model3D/house/old_house.ply"
                    width={1000} 
                    height={600} 
                    showPointCloud={showPointCloud}
                />
            </div>
            <div class="modal-footer">
                <div class="model-info">
                    <span class="model-title">Maison Ancienne</span>
                    <span class="model-category">Architecture</span>
                </div>
                <div class="mini-cards-container">
                    <div class="mini-card" on:click={showGLBModel}>
                        <div class="mini-card-icon">🎯</div>
                        <span class="mini-card-text">3D</span>
                    </div>
                    <div class="mini-card" on:click={convertToPointCloud}>
                        <div class="mini-card-icon">☁️</div>
                        <span class="mini-card-text">Nuage de point</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <ButtonComponent variant="outlined" onClick={() => showHouse3D = false}>
                        Fermer
                    </ButtonComponent>
                    <ButtonComponent variant="raised" color="primary" onClick={() => downloadModel("/assets/model3D/house/old_house.glb", "Maison Ancienne")}>
                        Télécharger
                    </ButtonComponent>
                </div>
            </div>
        </div>
    {/if}

    {#if showCars3D}
        <div 
            class="modal-backdrop" 
            role="button"
            tabindex="0"
            on:click={() => showCars3D = false}
            on:keydown={(e) => e.key === 'Escape' && (showCars3D = false)}
            aria-label="Fermer la modal"
        ></div>
        <div class="modal">
            <div class="modal-header">
                <h2>Cars - Visualisation Interactive</h2>
                <button class="close-btn" on:click={() => showCars3D = false}>✕</button>
            </div>
            <div class="modal-content">
                <ThreeDViewverComponent 
                    bind:this={viewerRef}
                    modelPath="/assets/model3D/cars/cars.glb" 
                    plyPath="/assets/model3D/cars/cars.ply"
                    width={1000} 
                    height={600} 
                    showPointCloud={showPointCloud}
                />
            </div>
            <div class="modal-footer">
                <div class="model-info">
                    <span class="model-title">Cars</span>
                    <span class="model-category">Véhicules</span>
                </div>
                <div class="mini-cards-container">
                    <div class="mini-card" on:click={showGLBModel}>
                        <div class="mini-card-icon">🎯</div>
                        <span class="mini-card-text">3D</span>
                    </div>
                    <div class="mini-card" on:click={convertToPointCloud}>
                        <div class="mini-card-icon">☁️</div>
                        <span class="mini-card-text">Nuage de point</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <ButtonComponent variant="outlined" onClick={() => showCars3D = false}>
                        Fermer
                    </ButtonComponent>
                    <ButtonComponent variant="raised" color="primary" onClick={() => downloadModel("/assets/model3D/cars/cars.glb", "Cars")}>
                        Télécharger
                    </ButtonComponent>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 20px;
  z-index: 1001;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-width: 98vw;
  max-height: 98vh;
  width: 1200px;
  height: 800px;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  z-index: 10;
  position: relative;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

.modal-header .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header .close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-content {
  padding: 0;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background: #fff;
  z-index: 10;
  position: relative;
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.model-title {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.model-category {
  font-size: 0.9rem;
  color: #666;
  background: #e3f2fd;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.model-stats-modal {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

.model-stats-modal .model-downloads,
.model-stats-modal .model-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  z-index: 11;
  position: relative;
}

.modal-actions button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.modal-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Effet spécifique pour le bouton télécharger (primary) */
.modal-actions button.mui-btn.primary.raised:hover {
  background: #6c757d !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px) !important;
}

.modal-actions button:active {
  transform: translateY(0);
}

/* Effet de vague sur le bouton télécharger */
.modal-actions button[color="primary"]:hover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (max-width: 768px) {
  .modal {
    max-width: 95vw;
    max-height: 95vh;
    margin: 1rem;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .modal-actions {
    justify-content: center;
  }
}

/* FORCER 2 LIGNES POUR ALIGNER LES BOUTONS */
.models-grid :global(.card-body) {
    min-height: 60px !important;
    height: 60px !important;
    overflow: hidden !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
    line-height: 1.5 !important;
}

/* Mini cartes dans la popup */
.mini-cards-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    justify-content: center;
}

.mini-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.mini-card:hover {
    background: #e3f2fd;
    border-color: #1976d2;
    transform: translateY(-2px);
}

.mini-card-icon {
    font-size: 1.2rem;
}

.mini-card-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
}
</style>