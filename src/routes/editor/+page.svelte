<script lang="ts">
    import * as EDITOR from '$lib/editor/editor.js';
    import {onMount} from "svelte";

    let container: HTMLElement;
    let editor : EDITOR.Editor;

    function init() {
        editor = new EDITOR.Editor(container);
        window.addEventListener('resize', editor.resize);
    }

    onMount(() => {
        init();
    });
</script>

<div class="flex flex-col w-screen h-screen">
    <div class="flex h-12 bg-neutral-950">
        <div class="flex items-center gap-1 px-2 text-sm text-neutral-300">
            <div class="relative group">
                <button class="px-3 py-2 hover:bg-neutral-800 rounded">File</button>
                <div class="absolute hidden group-hover:block top-full left-0 bg-neutral-900 border border-neutral-700 rounded shadow-lg min-w-[150px] z-10">
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">New scan</button>
                    <div class="border-t border-neutral-700 my-1"></div>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Open</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Save</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Export</button>
                </div>
            </div>
            <div class="relative group">
                <button class="px-3 py-2 hover:bg-neutral-800 rounded">Edit</button>
                <div class="absolute hidden group-hover:block top-full left-0 bg-neutral-900 border border-neutral-700 rounded shadow-lg min-w-[150px] z-10">
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Undo</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Redo</button>
                    <div class="border-t border-neutral-700 my-1"></div>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Cut</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Copy</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Paste</button>
                </div>
            </div>
            <div class="relative group">
                <button class="px-3 py-2 hover:bg-neutral-800 rounded">View</button>
                <div class="absolute hidden group-hover:block top-full left-0 bg-neutral-900 border border-neutral-700 rounded shadow-lg min-w-[150px] z-10">
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Zoom In</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Zoom Out</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Reset View</button>
                </div>
            </div>
            <div class="relative group">
                <button class="px-3 py-2 hover:bg-neutral-800 rounded">Help</button>
                <div class="absolute hidden group-hover:block top-full left-0 bg-neutral-900 border border-neutral-700 rounded shadow-lg min-w-[150px] z-10">
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">Documentation</button>
                    <button class="w-full px-4 py-2 text-left hover:bg-neutral-800">About</button>
                </div>
            </div>
        </div>
    </div>
    <div class="flex flex-1">
        <div class="w-1/6 bg-neutral-900"></div>
        <div class="flex-1 overflow-hidden" bind:this={container}></div>
    </div>
</div>
