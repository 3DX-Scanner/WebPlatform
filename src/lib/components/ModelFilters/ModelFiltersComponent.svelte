<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';

    let {
        searchQuery = '',
        selectedCategories = [],
        categories = [],
        isAuthenticated = false,
        onSearchChange = () => {},
        onCategoryChange = () => {},
        onOpenImport = () => {}
    }: {
        searchQuery?: string;
        selectedCategories?: string[];
        categories?: string[];
        isAuthenticated?: boolean;
        onSearchChange?: (value: string) => void;
        onCategoryChange?: (value: string[]) => void;
        onOpenImport?: () => void;
    } = $props();

    let isTagsDropdownOpen = $state(false);
    let tagsContainer: HTMLDivElement;

    const availableTags = [
        { id: 'public', label: 'Public' },
        { id: 'privé', label: 'Privé' },
        ...(isAuthenticated ? [{ id: 'likés', label: 'Likés' }] : [])
    ];

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        onSearchChange(target.value);
    }

    function toggleCategory(categoryId: string) {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(c => c !== categoryId)
            : [...selectedCategories, categoryId];
        onCategoryChange(newCategories);
    }

    function handleImportClick() {
        onOpenImport();
    }

    function handleTagsContainerClick() {
        isTagsDropdownOpen = !isTagsDropdownOpen;
    }

    function handleTagSelect(tagId: string) {
        toggleCategory(tagId);
        // Ne pas fermer le dropdown pour permettre la sélection multiple
    }

    // Fermer le dropdown si on clique en dehors
    function handleClickOutside(event: MouseEvent) {
        if (tagsContainer && !tagsContainer.contains(event.target as Node)) {
            isTagsDropdownOpen = false;
        }
    }

    $effect(() => {
        if (isTagsDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    });
</script>

<div class="flex flex-col gap-4 mb-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <Input
            type="text"
            class="md:col-span-2"
            placeholder="Rechercher (titre, sous-titre, catégorie)"
            value={searchQuery}
            oninput={handleSearchInput}
        />

        <!-- Champ pour les tags -->
        <div class="relative" bind:this={tagsContainer}>
            <div 
                class="flex flex-wrap gap-1.5 min-h-[2.25rem] px-3 py-1.5 border border-input bg-background rounded-md text-sm shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-all outline-none items-center cursor-pointer"
                role="button"
                tabindex="0"
                onclick={handleTagsContainerClick}
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTagsContainerClick();
                    }
                }}
            >
                {#if selectedCategories.length === 0}
                    <span class="text-muted-foreground text-sm">Tags (Public, Privé, Likés)</span>
                {:else}
                    {#each selectedCategories as categoryId}
                        {@const tag = availableTags.find(t => t.id === categoryId)}
                        {#if tag}
                            <Badge
                                variant="default"
                                class="cursor-pointer"
                                onclick={(e) => {
                                    e.stopPropagation();
                                    toggleCategory(categoryId);
                                }}
                            >
                                {tag.label}
                                <span class="ml-1">×</span>
                            </Badge>
                        {/if}
                    {/each}
                {/if}
            </div>
            <!-- Dropdown pour sélectionner les tags -->
            {#if isTagsDropdownOpen}
                <div class="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {#each availableTags as tag}
                        {#if !selectedCategories.includes(tag.id)}
                            <button
                                type="button"
                                class="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                onclick={(e) => {
                                    e.stopPropagation();
                                    handleTagSelect(tag.id);
                                }}
                            >
                                {tag.label}
                            </button>
                        {/if}
                    {/each}
                    {#if availableTags.every(tag => selectedCategories.includes(tag.id))}
                        <div class="px-3 py-2 text-sm text-muted-foreground text-center">
                            Tous les tags sont sélectionnés
                        </div>
                    {/if}
                </div>
            {/if}
        </div>

        {#if isAuthenticated}
            <Button
                class="md:col-span-1 w-auto px-6"
                type="button"
                onclick={handleImportClick}
            >
                Importer
            </Button>
        {/if}
    </div>
</div>
