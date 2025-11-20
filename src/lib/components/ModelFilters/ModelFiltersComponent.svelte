<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';

    let {
        searchQuery = '',
        selectedCategory = '',
        categories = [],
        onSearchChange = () => {},
        onCategoryChange = () => {},
        onOpenImport = () => {}
    }: {
        searchQuery?: string;
        selectedCategory?: string;
        categories?: string[];
        onSearchChange?: (value: string) => void;
        onCategoryChange?: (value: string) => void;
        onOpenImport?: () => void;
    } = $props();

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        onSearchChange(target.value);
    }

    function handleCategorySelect(event: Event) {
        const target = event.target as HTMLSelectElement;
        onCategoryChange(target.value);
    }

    function handleImportClick() {
        onOpenImport();
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-8">
    <Input
        type="text"
        class="md:col-span-2"
        placeholder="Rechercher (titre, sous-titre, catégorie)"
        value={searchQuery}
        oninput={handleSearchInput}
    />

    <select
        class="h-9 w-full px-3 border border-input bg-background rounded-md text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all outline-none"
        onchange={handleCategorySelect}
        value={selectedCategory}
    >
        <option value="">Tous</option>
        {#if categories.length > 0}
            {#each categories as category}
                <option value={category}>{category}</option>
            {/each}
        {:else}
            <option value="public">Public</option>
            <option value="privé">Privé</option>
        {/if}
    </select>

    <Button
        class="md:col-span-1 w-auto px-6"
        type="button"
        onclick={handleImportClick}
    >
        Importer
    </Button>
</div>
