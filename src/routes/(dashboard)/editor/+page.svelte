<script lang="ts">
    import * as EDITOR from '$lib/editor/editor.js';
    import {onMount, onDestroy} from "svelte";
    import {
        Menubar,
        MenubarMenu,
        MenubarTrigger,
        MenubarContent,
        MenubarItem,
        MenubarSeparator
    } from '$lib/components/ui/menubar';

    let container: HTMLElement;
    let editor : EDITOR.Editor;

    function init() {
        editor = new EDITOR.Editor(container);
        window.addEventListener('resize', editor.resize);
    }

    onMount(() => {
        init();

        const socket = new WebSocket('ws://10.134.35.20:7777');

        socket.addEventListener('open', (event) => {
            console.log('Connected');
            sendMessage(socket);
        });

        socket.addEventListener('message', (event) => {
            console.log(event.data);
        });

        socket.addEventListener('error', (event) => {
        });
    });

    function sendMessage(socket: WebSocket) {
        const message = "hello";
        if (message) {
            socket.send(message);
            console.log('Sent: ' + message);
        }
    }
</script>

<div class="flex flex-col w-screen h-screen">
    <div class="flex h-12 items-center px-2" style="background-color: var(--background);)">
        <Menubar class="outline-none bg-transparent">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>New scan</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Open</MenubarItem>
                    <MenubarItem>Save</MenubarItem>
                    <MenubarItem>Export</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Undo</MenubarItem>
                    <MenubarItem>Redo</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Cut</MenubarItem>
                    <MenubarItem>Copy</MenubarItem>
                    <MenubarItem>Paste</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Zoom In</MenubarItem>
                    <MenubarItem>Zoom Out</MenubarItem>
                    <MenubarItem>Reset View</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Documentation</MenubarItem>
                    <MenubarItem>About</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    </div>
    <div class="flex flex-1">
        <div class="w-1/6" style="background-color: var(--sidebar);"></div>
        <div class="flex-1 overflow-hidden" bind:this={container}></div>
    </div>
</div>
