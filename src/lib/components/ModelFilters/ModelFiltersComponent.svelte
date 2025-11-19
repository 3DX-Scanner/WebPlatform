<script lang="ts">
    import { Input } from '$lib/components/ui/input';

    let {
        searchQuery = '',
        selectedCategory = '',
        categories = [],
        onSearchChange = () => {},
        onCategoryChange = () => {}
    }: {
        searchQuery?: string;
        selectedCategory?: string;
        categories?: string[];
        onSearchChange?: (value: string) => void;
        onCategoryChange?: (value: string) => void;
    } = $props();

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        onSearchChange(target.value);
    }

    function handleCategorySelect(event: Event) {
        const target = event.target as HTMLSelectElement;
        onCategoryChange(target.value);
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-8">
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
        <option value="">Toutes les catégories</option>
        {#each categories as cat}
            <option value={cat}>{cat}</option>
        {/each}
    </select>
</div>
