<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Badge } from '$lib/components/ui/badge';

    let { 
        model,
        onClick = () => {},
        onEdit = () => {},
        onDelete = () => {},
        onLike = () => {},
        isSelected = false,
        showMenu = false,
        isAuthenticated = false
    }: {
        model: {
            id: number | string;
            title: string;
            subtitle: string;
            content: string;
            image: string;
            category: string;
            downloads: number;
            rating: number;
            modelPath: string;
            plyPath?: string;
            isPublic?: boolean;
            likes?: number;
            isLiked?: boolean;
        };
        onClick?: () => void;
        onEdit?: () => void;
        onDelete?: () => void;
        onLike?: (modelId: string | number, liked: boolean, likeCount: number) => void;
        isSelected?: boolean;
        showMenu?: boolean;
        isAuthenticated?: boolean;
    } = $props();

    let menuOpen = $state(false);
    let menuButton = $state<HTMLButtonElement | null>(null);
    let menuContainer = $state<HTMLDivElement | null>(null);
    let isLiked = $state(model.isLiked || false);
    let likesCount = $state(model.likes || 0);
    let isLiking = $state(false);

    function handleClick(event: MouseEvent) {
        // Ne pas ouvrir le popup si on clique sur le menu
        if ((event.target as HTMLElement).closest('.menu-container')) {
            return;
        }
        onClick();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    }

    function toggleMenu(event: MouseEvent) {
        event.stopPropagation();
        menuOpen = !menuOpen;
    }

    function handleEdit(event: MouseEvent) {
        event.stopPropagation();
        menuOpen = false;
        onEdit();
    }

    function handleDelete(event: MouseEvent) {
        event.stopPropagation();
        menuOpen = false;
        onDelete();
    }

    async function handleLike(event: MouseEvent) {
        event.stopPropagation();
        
        if (!isAuthenticated) {
            return;
        }

        if (isLiking) {
            return;
        }

        isLiking = true;
        const previousLiked = isLiked;
        const previousCount = likesCount;

        // Optimistic update
        isLiked = !isLiked;
        likesCount = isLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

        try {
            const response = await fetch('/api/models/like', {
                method: isLiked ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    modelId: model.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du like');
            }

            // Mettre à jour avec les vraies valeurs
            isLiked = data.liked;
            likesCount = data.likeCount;
            // Notifier le parent avec les nouvelles valeurs
            onLike(model.id, data.liked, data.likeCount);
        } catch (error: any) {
            console.error('Erreur lors du like:', error);
            // Revert optimistic update
            isLiked = previousLiked;
            likesCount = previousCount;
        } finally {
            isLiking = false;
        }
    }

    // Mettre à jour les états quand le modèle change
    $effect(() => {
        isLiked = model.isLiked || false;
        likesCount = model.likes || 0;
    });

    // Fermer le menu si on clique ailleurs
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as Node;
        if (
            menuContainer &&
            menuButton &&
            !menuContainer.contains(target) &&
            !menuButton.contains(target)
        ) {
            menuOpen = false;
        }
    }

    $effect(() => {
        if (menuOpen) {
            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside, true);
            }, 0);
            
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('click', handleClickOutside, true);
            };
        }
    });
</script>

<Card
    class="relative cursor-pointer transition-all duration-300 overflow-hidden hover:shadow-xl hover:-translate-y-1 focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-2 active:translate-y-0 p-0 {isSelected ? 'ring-4 ring-blue-500/30 dark:ring-blue-400/30 scale-[1.02] -translate-y-2' : ''}"
    role="button"
    tabindex={0}
    onclick={handleClick}
    onkeydown={handleKeydown}
    aria-label={`Voir le modèle ${model.title}`}
>
    {#if showMenu}
        <div class="menu-container absolute bottom-2 right-2 z-10" bind:this={menuContainer}>
            <button
                bind:this={menuButton}
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all duration-200"
                onclick={toggleMenu}
                aria-label="Menu"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                type="button"
            >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
            </button>
            
            {#if menuOpen}
                <div 
                    class="absolute right-0 bottom-full mb-2 w-40 bg-card rounded-lg shadow-lg border border-border py-1 z-20"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <button
                        class="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-accent transition-colors flex items-center gap-2"
                        onclick={handleEdit}
                        type="button"
                        role="menuitem"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Modifier
                    </button>
                    <button
                        class="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors flex items-center gap-2"
                        onclick={handleDelete}
                        type="button"
                        role="menuitem"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Supprimer
                    </button>
                </div>
            {/if}
        </div>
    {/if}
    
    {#if model.image}
        <div class="card-image h-48 w-full overflow-hidden">
            <img
                src={model.image}
                alt={model.title}
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
        </div>
    {/if}

    <CardHeader class="p-4">
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-1">
                <CardTitle class="text-lg line-clamp-2">{model.title}</CardTitle>
                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full {model.isPublic ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'}">
                    {model.isPublic ? 'Public' : 'Privé'}
                </span>
                {#if !model.isPublic && isAuthenticated}
                    <button
                        class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 {isLiked ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                        onclick={handleLike}
                        disabled={isLiking}
                        title={isLiked ? 'Retirer le like' : 'Ajouter un like'}
                    >
                        <svg 
                            class="w-3.5 h-3.5 {isLiked ? 'fill-current text-red-600 dark:text-red-500' : 'text-gray-600 dark:text-gray-300'}" 
                            fill={isLiked ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span class="{isLiked ? 'text-red-600 dark:text-red-500' : ''}">{likesCount}</span>
                    </button>
                {/if}
            </div>
        </div>
        {#if model.subtitle}
            <p class="text-sm text-muted-foreground line-clamp-1">{model.subtitle}</p>
        {/if}
    </CardHeader>
</Card>
