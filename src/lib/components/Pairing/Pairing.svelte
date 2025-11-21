<script lang="ts">
    // noinspection ES6UnusedImports
    import * as Dialog from "$lib/components/ui/dialog";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import QRCode from 'qrcode';
    import {Spinner} from "$lib/components/ui/spinner";
    import {Badge} from "$lib/components/ui/badge";

    let {open = $bindable()} = $props();

    let qrCodeCanvas        = $state<HTMLCanvasElement>();
    let showQrCode          = $state(false);
    let ssid                = $state("");
    let password            = $state("");
    let isDeviceConnected   = $state(false);

    $effect(() => {
        if (!open) {
            showQrCode = false;
        }
    });

    async function generateQRCode() {
        await QRCode.toCanvas(qrCodeCanvas, JSON.stringify({
            ssid: ssid,
            password: password
        }), {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        showQrCode = true;
        await waitForDeviceConnection();
    }

    async function waitForDeviceConnection() {
        // Wait for device connection
    }
</script>

<Dialog.Root bind:open={open}>
    <Dialog.Content class="sm:max-w-[500px]">
        {#if !showQrCode}
            <Dialog.Header>
                <Dialog.Title>Associer un appareil</Dialog.Title>
                <Dialog.Description>
                    Renseignez les informations de connexion du wifi pour associer l'appareil à votre compte.
                </Dialog.Description>
            </Dialog.Header>
                <div class="flex flex-col gap-4 py-4">
                    <div class="flex items-center gap-4">
                        <Label for="name" class="w-1/3">Nom SSID</Label>
                        <Input id="name" bind:value={ssid} class="w-2/3 col-span-3"/>
                    </div>
                    <div class="flex items-center gap-4">
                        <Label for="password" class="w-1/3">Mot de passe</Label>
                        <Input id="password" bind:value={password} type="password" class="w-2/3 col-span-3"/>
                    </div>
                </div>
            <Dialog.Footer>
                <Button onclick={generateQRCode}>Suivant</Button>
            </Dialog.Footer>
        {:else}
            <Dialog.Header>
                <Dialog.Title>Associer un appareil</Dialog.Title>
                <Dialog.Description>
                    Scannez ce code QR avec l'appareil pour terminer l'association.
                </Dialog.Description>
            </Dialog.Header>
                <canvas bind:this={qrCodeCanvas} class="w-[300px] h-[300px]"></canvas>
            <Dialog.Footer>
                <!--<Button onclick={() => {open = false}}>Terminer</Button>-->
                <Badge>
                    <Spinner />
                    En attente de connexion de l'appareil...
                </Badge>
            </Dialog.Footer>
        {/if}
    </Dialog.Content>
</Dialog.Root>