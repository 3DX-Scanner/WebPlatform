<script lang="ts">
    import { createEventDispatcher } from 'svelte';

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

    const dispatch = createEventDispatcher();

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        onSearchChange(target.value);
    }

    function handleCategorySelect(event: Event) {
        const target = event.target as HTMLSelectElement;
        onCategoryChange(target.value);
    }

    function handleImportClick() {
        dispatch('openImport');
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-8">
    <input
        type="text"
        class="md:col-span-2 h-11 w-full px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
        placeholder="Rechercher (titre, sous-titre, catégorie)"
        value={searchQuery}
        oninput={handleSearchInput}
    />

    <select
        class="md:col-span-1 h-11 w-full px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
        onchange={handleCategorySelect}
        value={selectedCategory}
    >
        <option value="">Toutes les catégories</option>
        {#each categories as cat}
            <option value={cat}>{cat}</option>
        {/each}
    </select>

    <button
        class="md:col-span-1 h-11 w-full px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
        type="button"
        onclick={handleImportClick}
    >
        Importer
    </button>
</div>
