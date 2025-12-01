<script lang="ts">
    // noinspection ES6UnusedImports
    import * as Dialog from "$lib/components/ui/dialog";
    import {Label} from "$lib/components/ui/label";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import QRCode from 'qrcode';
    import {Spinner} from "$lib/components/ui/spinner";
    import {Badge} from "$lib/components/ui/badge";
    import {onDestroy} from "svelte";

    let {open = $bindable()} = $props();

    let qrCodeCanvas        = $state<HTMLCanvasElement>();
    let showQrCode          = $state(false);
    let ssid                = $state("");
    let password            = $state("");
    let pairingId           = $state<string | null>(null);
    let pairingSuccess      = $state(false);
    let pairedDevice        = $state<any>(null);
    let pollingInterval: number | null = null;
    let error               = $state<string | null>(null);

    $effect(() => {
        if (!open) {
            // Reset state when dialog closes
            showQrCode = false;
            pairingSuccess = false;
            pairedDevice = null;
            pairingId = null;
            error = null;
            stopPolling();
        }
    });

    onDestroy(() => {
        stopPolling();
    });

    async function generateQRCode() {
        try {
            error = null;

            // Create pairing session
            const response = await fetch('/api/pairing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to create pairing session');
            }

            const data = await response.json();
            pairingId = data.pairingId;

            // Generate QR code with WiFi credentials and pairing ID
            await QRCode.toCanvas(qrCodeCanvas, JSON.stringify({
                ssid: ssid,
                password: password,
                pairingId: pairingId,
                apiEndpoint: window.location.origin + '/api/pairing/complete'
            }), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            showQrCode = true;
            startPolling();
        } catch (err) {
            console.error('Error generating QR code:', err);
            error = 'Failed to generate pairing code. Please try again.';
        }
    }

    function startPolling() {
        // Poll every second
        pollingInterval = window.setInterval(checkPairingStatus, 1000);

        // Stop polling after 10 minutes
        setTimeout(() => {
            if (!pairingSuccess) {
                stopPolling();
                error = 'Pairing timeout. Please try again.';
            }
        }, 10 * 60 * 1000);
    }

    function stopPolling() {
        if (pollingInterval !== null) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    async function checkPairingStatus() {
        if (!pairingId) return;

        try {
            const response = await fetch(`/api/pairing/status/${pairingId}`);

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            if (data.status === 'completed') {
                pairingSuccess = true;
                pairedDevice = data.device;
                stopPolling();
            } else if (data.status === 'expired') {
                stopPolling();
                error = 'Pairing session expired. Please try again.';
            }
        } catch (err) {
            console.error('Error checking pairing status:', err);
        }
    }

    function handleClose() {
        open = false;
    }
</script>

<Dialog.Root bind:open={open}>
    <Dialog.Content class="sm:max-w-[500px] [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()}>
        {#if !showQrCode}
            <!-- Step 1: Enter WiFi credentials -->
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
                {#if error}
                    <div class="text-red-500 text-sm">{error}</div>
                {/if}
            </div>
            <Dialog.Footer>
                <Button onclick={generateQRCode}>Suivant</Button>
            </Dialog.Footer>
        {:else if !pairingSuccess}
            <!-- Step 2: Show QR code and wait for pairing -->
            <Dialog.Header>
                <Dialog.Title>Associer un appareil</Dialog.Title>
                <Dialog.Description>
                    Scannez ce code QR avec l'appareil pour terminer l'association.
                </Dialog.Description>
            </Dialog.Header>
            <div class="flex flex-col items-center gap-4 py-4">
                <canvas bind:this={qrCodeCanvas} class="w-[300px] h-[300px]"></canvas>
                {#if pairingId}
                    <div class="text-center">
                        <p class="text-sm text-muted-foreground mb-1">ID d'association:</p>
                        <p class="text-xs font-mono bg-muted px-3 py-2 rounded">{pairingId}</p>
                    </div>
                {/if}
                {#if error}
                    <div class="text-red-500 text-sm">{error}</div>
                {/if}
            </div>
            <Dialog.Footer>
                <Badge variant="secondary">
                    <Spinner />
                    En attente de connexion de l'appareil...
                </Badge>
            </Dialog.Footer>
        {:else}
            <!-- Step 3: Pairing successful -->
            <Dialog.Header>
                <Dialog.Title>Association réussie!</Dialog.Title>
                <Dialog.Description>
                    L'appareil a été associé avec succès à votre compte.
                </Dialog.Description>
            </Dialog.Header>
            {#if pairedDevice}
                <div class="flex flex-col gap-2 py-4">
                    <div class="flex items-center gap-2">
                        <Label class="w-1/3">Modèle:</Label>
                        <span class="font-medium">{pairedDevice.modelName}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Label class="w-1/3">Numéro de série:</Label>
                        <span class="font-mono text-sm">{pairedDevice.serialNumber}</span>
                    </div>
                </div>
            {/if}
            <Dialog.Footer>
                <Button onclick={handleClose}>Terminer</Button>
            </Dialog.Footer>
        {/if}
    </Dialog.Content>
</Dialog.Root>