<script lang="ts">
    let { 
        icon = "🔍",
        title = "Aucun résultat trouvé",
        description = "Essayez de modifier vos critères de recherche"
    }: {
        icon?: string;
        title?: string;
        description?: string;
    } = $props();
</script>

<div class="text-center py-12">
    <div class="text-gray-400 dark:text-gray-500 text-6xl mb-4">{icon}</div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
    <p class="text-gray-500 dark:text-gray-400">{description}</p>
</div>
