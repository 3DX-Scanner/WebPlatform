<script lang="ts">
    let { 
        title = '', 
        subtitle = '', 
        content = '', 
        image = '', 
        elevation = 'medium', 
        variant = 'default', 
        padding = 'medium', 
        width = '100%', 
        height = 'auto', 
        className = '', 
        children, 
        title$extra, 
        actions 
    }: {
        title?: string;
        subtitle?: string;
        content?: string;
        image?: string;
        elevation?: 'low' | 'medium' | 'high' | 'none';
        variant?: 'default' | 'outlined' | 'filled';
        padding?: 'none' | 'small' | 'medium' | 'large';
        width?: string;
        height?: string;
        className?: string;
        children?: any;
        title$extra?: any;
        actions?: any;
    } = $props();

    function elevationCls() { return elevation === 'high' ? 'shadow-2xl' : elevation === 'medium' ? 'shadow-lg' : elevation === 'low' ? 'shadow' : ''; }
    function variantCls() { return variant === 'outlined' ? 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : variant === 'filled' ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'; }
    function paddingCls() { return padding === 'large' ? 'p-6' : padding === 'small' ? 'p-2' : padding === 'none' ? 'p-0' : 'p-4'; }
</script>

<div class={`rounded-2xl overflow-hidden ${variantCls()} ${elevationCls()} ${paddingCls()} ${className} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`} style={`width:${width}; height:${height};`}>
    {#if image}
        <div class="card-image h-48 w-full overflow-hidden">
            <img 
                src={image} 
                alt={title} 
                loading="lazy" 
                decoding="async" 
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
        </div>
    {/if}
    
    <div class="p-4 grid gap-3">
        {#if title}
            <div class="flex items-center justify-between gap-2">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
                {@render title$extra?.()}
            </div>
        {/if}
        
        {#if subtitle}
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{subtitle}</p>
        {/if}
        
        {#if content}
            <div class="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">{content}</div>
        {/if}
        
        <div class="mt-2">
            {@render actions?.()}
        </div>
    </div>
</div>