<script lang="ts">
    import {Input} from '$lib/components/ui/input';
    import {Label} from '$lib/components/ui/label';
    import {goto} from '$app/navigation';
    import {onMount, tick} from 'svelte';
    import {fly} from 'svelte/transition';
    import {Button} from '$lib/components/ui/button';
    import ChangePasswordModal from '$lib/components/ChangePasswordModal/ChangePasswordModal.svelte';
    import ModelFiltersComponent from '$lib/components/ModelFilters/ModelFiltersComponent.svelte';
    import ModelCardComponent from '$lib/components/ModelCard/ModelCardComponent.svelte';
    import Model3DPopupComponent from '$lib/components/Model3DPopup/Model3DPopupComponent.svelte';
    import CardPricing from '$lib/components/ui/card/card-pricing.svelte';
    import SubscriptionCard from '$lib/components/ui/card/card-subscription.svelte';
    import ConfirmDialogComponent from '$lib/components/ConfirmDialog/ConfirmDialogComponent.svelte';
    import {EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Root as EmptyRoot} from "$lib/components/ui/empty";
    import Pairing from "$lib/components/Pairing/Pairing.svelte";
    import * as Dialog from "$lib/components/ui/dialog";
    import {Link, ArrowUpRight, Pencil, Save, XCircle} from "@lucide/svelte";

    let { data }: {
        data: {
            user: {
                id: number;
                username: string;
                email: string;
                createdAt: string;
                hasPassword: boolean;
            };
            currentSubscription?: {
                planId: number;
                planName: string;
                isActive: boolean;
                startDate: string;
                endDate: string | null;
                storageLimit: number;
            } | null;
            plans?: Array<{
                id: 'free' | 'pro' | 'enterprise';
                planId: string;
                name: string;
                price: number;
                storageLimit: number;
            }>;
            userStats?: {
                bucketName?: string;
                totalModels?: number;
                likedModelsCount?: number;
                storageUsed?: number;
                storageLimit?: number;
                storageUsedMB?: number;
                storageLimitMB?: number;
                storageLimitGB?: number;
                storagePercentage?: string;
            };
        };
    } = $props();

    const NAVIGATION_SECTIONS = [
        { id: 'preferences', label: 'Préférences' },
        { id: 'modeles', label: 'Mes modèles' },
        { id: 'devices', label: 'Appareils' },
        { id: 'abonnement', label: 'Abonnement' }
    ] as const;

    let selectedSection = $state<'preferences' | 'modeles' | 'abonnement' | 'devices'>('preferences');
    let showPairingDialog = $state(false);
    let pairedDevices = $state<any[]>([]);
    let isLoadingDevices = $state(false);
    let deviceToUnpair = $state<number | null>(null);
    let editingPassword = $state(false);
    let showPwdModal = $state(false);
    let currentPassword = $state('');
    let newPassword = $state('');
    let confirmPassword = $state('');
    let passwordError = $state('');
    let editingUsername = $state(false);
    let newUsername = $state('');
    let usernameError = $state('');
    let leftCardEl: HTMLDivElement;
    let rightCardEl: HTMLDivElement;

    let userModels = $state<any[]>([]);
    let searchQuery = $state('');
    let selectedCategories = $state<string[]>([]);
    let isLoadingModels = $state(false);
    let loadModelsError = $state('');

    let userModelCategories = $state<string[]>([]);

    let filteredUserModels = $derived(filterAndSortUserModels(userModels, searchQuery, selectedCategories));
    $effect(() => {
        userModelCategories = Array.from(new Set(userModels.map((m) => m.category).filter(Boolean))).sort();
    });
    let userStats = $state<{
        bucketName?: string;
        totalModels?: number;
        likedModelsCount?: number;
        storageUsed?: number;
        storageLimit?: number;
        storageUsedMB?: number;
        storageLimitMB?: number;
        storageLimitGB?: number;
        storagePercentage?: string;
    }>(data.userStats || {});
    
    function formatStorageUsed(usedMB: number): string {
        if (usedMB < 1024) {
            return `${usedMB.toFixed(2)} MB`;
        } else {
            const usedGB = usedMB / 1024;
            return `${usedGB.toFixed(1).replace('.', ',')} Go`;
        }
    }
    function formatStorageLimit(limitGB: number): string {
        return `${limitGB.toFixed(0)} Go`;
    }

    let currentPopup = $state({
        isOpen: false,
        title: '',
        category: '',
        modelPath: ''
    });

    let syncHeightTimeout: ReturnType<typeof setTimeout> | null = null;

    async function syncHeights() {
        if (!leftCardEl || !rightCardEl) return;
        await tick();
        const h = leftCardEl.offsetHeight;
        const target = Math.max(600, h);
        rightCardEl.style.height = target + 'px';
    }

    $effect(() => {
        if (syncHeightTimeout) {
            clearTimeout(syncHeightTimeout);
        }
        syncHeightTimeout = setTimeout(() => {
            syncHeights();
        }, 50);
    });

    async function loadUserModels() {
        isLoadingModels = true;
        loadModelsError = '';

        const response = await fetch('/api/user-models');
        const data = await response.json();

        if (!response.ok) {
            loadModelsError = 'Impossible de charger vos modèles.';
            isLoadingModels = false;
            return;
        }

        userModels = data.models || [];
        isLoadingModels = false;
    }

    const normalizeCache = new Map<string, string>();

    function normalize(s: string): string {
        if (!s) return '';
        if (normalizeCache.has(s)) {
            return normalizeCache.get(s)!;
        }
        const normalized = s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        normalizeCache.set(s, normalized);
        return normalized;
    }

    function filterAndSortUserModels(list: typeof userModels, search: string, categoryFilters: string[]) {
        if (!search.trim() && categoryFilters.length === 0) {
            return list;
        }

        const q = normalize(search.trim());

        return list.filter(model => {
            if (categoryFilters.length > 0) {
                const matchesCategory = categoryFilters.some(filter => {
                    if (filter === 'public') {
                        return model.isPublic === true;
                    } else if (filter === 'privé') {
                        return model.isPublic === false;
                    } else if (filter === 'likés') {
                        return model.isLiked === true;
                    }
                    return normalize(model.category) === normalize(filter);
                });
                if (!matchesCategory) {
                    return false;
                }
            }
            if (q === '') {
                return true;
            }

            const title = normalize(model.title);
            const subtitle = normalize(model.subtitle);
            const content = normalize(model.content);
            const category = normalize(model.category);

            return title.includes(q) || subtitle.includes(q) || content.includes(q) || category.includes(q);
        });
    }

    function handleSearchChange(value: string) {
        searchQuery = value;
    }

    function handleCategoryChange(value: string[]) {
        selectedCategories = value;
    }

    function openModelPopup(model: any) {
        currentPopup = {
            isOpen: true,
            title: model.title,
            category: model.category,
            modelPath: model.modelPath
        };
    }

    function closePopup() {
        currentPopup.isOpen = false;
    }

    async function downloadModel(event: CustomEvent) {
        const {modelPath, title} = event.detail;
        
        try {
            const response = await fetch(modelPath);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title}.glb`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du modèle.');
        }
    }

    onMount(() => {
        syncHeights();


        
        let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
        const onResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                syncHeights();
            }, 150);
        };

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            if (syncHeightTimeout) {
                clearTimeout(syncHeightTimeout);
            }
        };
    });

    function validatePasswords() {
        passwordError = '';
        if (editingPassword) {
            if (newPassword.length < 8) passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
            if (newPassword && confirmPassword && newPassword !== confirmPassword) passwordError = 'Les mots de passe ne correspondent pas.';
        }
    }

    $effect(() => {
        if (editingPassword && (newPassword || confirmPassword)) {
            validatePasswords();
        }
    });

    function resetPasswordForm() {
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
        passwordError = '';
    }

    async function savePassword() {
        if (passwordError || !currentPassword || !newPassword || !confirmPassword) return;

        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({currentPassword, newPassword, confirmPassword}),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                passwordError = data.error || 'Erreur lors du changement de mot de passe.';
                return;
            }

            editingPassword = false;
            resetPasswordForm();
        } catch (err) {
            console.error(err);
            passwordError = 'Erreur réseau.';
        }
    }

    async function handleLogout() {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Erreur lors de la déconnexion', err);
        } finally {
            await goto('/');
        }
    }

    function handleSectionChange(section: 'preferences' | 'modeles' | 'abonnement' | 'devices') {
        selectedSection = section;
        
        const sectionLoaders = {
            modeles: () => userModels.length === 0 && loadUserModels(),
            devices: () => pairedDevices.length === 0 && loadPairedDevices(),
            preferences: () => {},
            abonnement: () => {}
        };
        
        sectionLoaders[section]?.();
    }

    async function loadPairedDevices() {
        isLoadingDevices = true;
        try {
            const response = await fetch('/api/user-devices');
            const data = await response.json();

            if (response.ok) {
                pairedDevices = data.devices || [];
            }
        } catch (err) {
            console.error('Error loading devices:', err);
        } finally {
            isLoadingDevices = false;
        }
    }

    async function confirmUnpair(deviceId: number) {
        deviceToUnpair = deviceId;
    }

    async function unpairDevice() {
        if (!deviceToUnpair) return;

        try {
            const response = await fetch(`/api/user-devices/${deviceToUnpair}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                pairedDevices = pairedDevices.filter(d => d.id !== deviceToUnpair);
                deviceToUnpair = null;
            }
        } catch (err) {
            console.error('Error unpairing device:', err);
        }
    }

    function cancelUnpair() {
        deviceToUnpair = null;
    }


    
    let isLoadingPlan = $state(false);
    let isCancellingSubscription = $state(false);
    let showCancelDialog = $state(false);
    
    let showSuccessNotification = $state(false);
    let notificationMessage = $state('');
    
    function openCancelDialog() {
        showCancelDialog = true;
    }
    
    function closeCancelDialog() {
        showCancelDialog = false;
    }
    
    function closeSuccessNotification() {
        showSuccessNotification = false;
    }
    
    $effect(() => {
        if (showSuccessNotification) {
            const timer = setTimeout(() => {
                showSuccessNotification = false;
            }, 5000);
            return () => clearTimeout(timer);
        }
    });
    
    async function handleCancelSubscription() {
        closeCancelDialog();
        isCancellingSubscription = true;
        try {
            const response = await fetch('/api/stripe/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || 'Erreur lors de l\'annulation');
            }
            
            notificationMessage = responseData.message || 'Abonnement annulé avec succès. Vous conservez l\'accès jusqu\'à la fin de votre période de facturation.';
            showSuccessNotification = true;
            
            // Attendre 2 secondes pour que l'utilisateur puisse voir la notification
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error: any) {
            console.error('Erreur:', error);
            alert(error.message || 'Une erreur est survenue lors de l\'annulation');
            isCancellingSubscription = false;
        }
    }
    
    function getCurrentPlanStatus(plan: any, currentSubscription: any): boolean {
        if (!currentSubscription || !currentSubscription.isActive) {
            return plan.id === 'free';
        }
        return currentSubscription.planName.toLowerCase() === plan.id;
    }
    
    function getPlanConfig(plan: any, isCurrentPlan: boolean, isSubscriptionActive?: boolean) {
        const baseConfig = {
            price: plan.id === 'enterprise' ? 'Sur mesure' : (plan.price === 0 ? '0' : plan.price.toFixed(2)),
            period: isCurrentPlan ? '' : (plan.price > 0 ? '/mois' : ''),
            disabled: isCurrentPlan || isLoadingPlan || (plan.id === 'free' && isSubscriptionActive)
        };
        
        if (isCurrentPlan) {
            return {
                ...baseConfig,
                buttonText: 'Plan actuel',
                buttonVariant: 'outline' as const
            };
        }
        
        if (plan.id === 'enterprise') {
            return {
                ...baseConfig,
                buttonText: 'Contactez-nous',
                buttonVariant: 'outline' as const
            };
        }
        
        return {
            ...baseConfig,
            buttonText: 'Choisir ce plan',
            buttonVariant: 'default' as const
        };
    }
    
    function getPlanStyles(planId: string, isCurrentPlan: boolean = false) {
        const styles: Record<string, { gradient: string; borderColor: string }> = {
            free: { gradient: 'from-gray-600 to-gray-700', borderColor: isCurrentPlan ? 'border-cyan-500' : 'border-gray-500/20' },
            pro: { gradient: 'from-cyan-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-600', borderColor: isCurrentPlan ? 'border-cyan-500' : 'border-cyan-500/20' },
            enterprise: { gradient: 'from-purple-600 to-pink-600', borderColor: isCurrentPlan ? 'border-cyan-500' : 'border-purple-500/20' }
        };
        return styles[planId] || styles.free;
    }
    
    function handlePlanSelect(planId: 'free' | 'pro' | 'enterprise') {
        const planActions = {
            enterprise: () => window.location.href = '/contact',
            free: () => {},
            pro: () => redirectToSubscription(planId)
        };
        
        if (isCurrentPlan(planId)) {
            return;
        }
        
        planActions[planId]();
    }
    
    function isCurrentPlan(planId: string): boolean {
        if (!data.currentSubscription) return planId === 'free';
        
        const currentPlanName = data.currentSubscription.isActive 
            ? data.currentSubscription.planName?.toLowerCase() 
            : 'free';
        
        return currentPlanName === planId;
    }
    
    function redirectToSubscription(planId: string) {
        isLoadingPlan = true;
        window.location.href = `/subscription?plan=${planId}`;
    }

    function handlePasswordFieldChange(field: string, value: string) {
        if (field === 'current') currentPassword = value;
        if (field === 'new') newPassword = value;
        if (field === 'confirm') confirmPassword = value;
    }

    async function startEditingUsername() {
        editingUsername = true;
        newUsername = data.user.username;
        usernameError = '';
    }

    function cancelEditingUsername() {
        editingUsername = false;
        newUsername = '';
        usernameError = '';
    }

    function validateUsername() {
        if (!newUsername || newUsername === data.user.username) {
            return false;
        }

        if (newUsername.length < 3 || newUsername.length > 30) {
            return false;
        }

        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        return usernameRegex.test(newUsername);
    }

    $effect(() => {
        if (newUsername && editingUsername && usernameError) {
            if (usernameError === 'Ce nom d\'utilisateur est déjà utilisé' || usernameError === 'Erreur réseau') {
                usernameError = '';
            }
        }
    });

    async function saveUsername() {
        usernameError = '';

        if (!newUsername) {
            usernameError = 'Le nom d\'utilisateur ne peut pas être vide';
            return;
        }

        if (newUsername.length < 3 || newUsername.length > 30) {
            usernameError = 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères';
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(newUsername)) {
            usernameError = 'Uniquement lettres, chiffres, tirets et underscores autorisés';
            return;
        }

        if (newUsername === data.user.username) {
            usernameError = 'Le nouveau nom d\'utilisateur est identique à l\'actuel';
            return;
        }

        try {
            const res = await fetch('/api/change-username', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({newUsername}),
                credentials: 'include'
            });

            const responseData = await res.json();

            if (!res.ok) {
                usernameError = responseData.error || 'Erreur lors du changement de nom d\'utilisateur';
                return;
            }

            data.user.username = newUsername;
            editingUsername = false;
            usernameError = '';
        } catch (err) {
            console.error(err);
            usernameError = 'Erreur réseau';
        }
    }
</script>

<div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 bg-muted">
    <div class="w-full max-w-7xl mx-auto grid gap-5 grid-cols-[340px_1fr] items-stretch">
        <aside>
            <div class="bg-card backdrop-blur-md rounded-2xl shadow-lg p-7 grid place-items-center gap-2 min-h-[650px]"
                 bind:this={leftCardEl}>
                <div class="w-24 h-24 rounded-full grid place-items-center bg-primary text-primary-foreground text-4xl font-bold">
                    {data.user.email.charAt(0).toUpperCase()}
                </div>
                <div class="font-extrabold text-card-foreground text-lg">{data.user.username}</div>
                <div class="text-muted-foreground text-base">{data.user.email}</div>
                <div class="mt-1 px-3 py-2 rounded-full text-sm bg-secondary text-secondary-foreground">
                    Membre depuis {new Date(data.user.createdAt).toLocaleDateString('fr-FR')}
                </div>

                <ul class="w-full grid gap-3 mt-4" role="tablist">
                    {#each NAVIGATION_SECTIONS as section}
                        <li>
                            <button
                                type="button"
                                role="tab"
                                class="w-full text-left rounded-xl px-4 py-3 font-semibold transition-all duration-200 tab-button"
                                class:bg-primary={selectedSection === section.id}
                                class:text-primary-foreground={selectedSection === section.id}
                                class:border-primary={selectedSection === section.id}
                                class:shadow-md={selectedSection === section.id}
                                class:bg-secondary={selectedSection !== section.id}
                                class:text-secondary-foreground={selectedSection !== section.id}
                                class:border-transparent={selectedSection !== section.id}
                                aria-selected={selectedSection === section.id}
                                onclick={() => handleSectionChange(section.id as 'preferences' | 'modeles' | 'abonnement' | 'devices')}
                            >
                                {section.label}
                            </button>
                        </li>
                    {/each}
                </ul>

                <div class="mt-5 flex justify-center">
                    <Button variant="default" onclick={handleLogout}>
                        Se déconnecter
                    </Button>
                </div>
            </div>
        </aside>

        <main>
            <div class="bg-card rounded-2xl shadow-lg p-7 overflow-auto h-full" bind:this={rightCardEl}>
                {#if selectedSection === 'devices'}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-card-foreground text-center text-2xl">Appareils</h3>

                        {#if isLoadingDevices}
                            <div class="flex justify-center items-center py-8">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        {:else if pairedDevices.length === 0}
                            <EmptyRoot>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Link/>
                                    </EmptyMedia>
                                    <EmptyTitle>Aucun appareil associé</EmptyTitle>
                                    <EmptyDescription>
                                        Aucun appareil n'est associé à votre compte pour le moment.
                                        <br>Commencez par associer un appareil.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button onclick={() => { showPairingDialog = true; }}>
                                        Associer un appareil
                                    </Button>
                                </EmptyContent>
                                <Button variant="link" class="text-muted-foreground" size="sm">
                                    <a href="#/">
                                        Documentation
                                        <ArrowUpRight class="inline"/>
                                    </a>
                                </Button>
                            </EmptyRoot>
                        {:else}
                            <div class="mb-4 flex justify-end">
                                <Button onclick={() => { showPairingDialog = true; }}>
                                    Associer un nouvel appareil
                                </Button>
                            </div>

                            <div class="grid gap-4">
                                {#each pairedDevices as device (device.id)}
                                    <div class="rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1">
                                                <div class="flex items-center gap-3 mb-3">
                                                    <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Link class="text-primary" size={24}/>
                                                    </div>
                                                    <div>
                                                        <h4 class="text-lg font-bold text-card-foreground mb-1">{device.modelName}</h4>
                                                        <p class="text-sm text-muted-foreground">Numéro de série: <span class="font-mono">{device.serialNumber}</span></p>
                                                    </div>
                                                </div>
                                                <div class="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span class="text-muted-foreground">Associé le:</span>
                                                        <span class="ml-2 font-medium text-card-foreground">{new Date(device.pairedAt).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <div>
                                                        <span class="text-muted-foreground">Créé le:</span>
                                                        <span class="ml-2 font-medium text-card-foreground">{new Date(device.createdAt).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onclick={() => confirmUnpair(device.id)}
                                            >
                                                Dissocier
                                            </Button>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <Pairing bind:open={showPairingDialog} />

                        {#if deviceToUnpair !== null}
                            <Dialog.Root open={deviceToUnpair !== null} onOpenChange={(open) => { if (!open) cancelUnpair(); }}>
                                <Dialog.Content>
                                    <Dialog.Header>
                                        <Dialog.Title>Confirmer la dissociation</Dialog.Title>
                                        <Dialog.Description>
                                            Êtes-vous sûr de vouloir dissocier cet appareil de votre compte ?
                                            Cette action ne peut pas être annulée.
                                        </Dialog.Description>
                                    </Dialog.Header>
                                    <Dialog.Footer>
                                        <Button variant="outline" onclick={cancelUnpair}>Annuler</Button>
                                        <Button variant="destructive" onclick={unpairDevice}>Dissocier</Button>
                                    </Dialog.Footer>
                                </Dialog.Content>
                            </Dialog.Root>
                        {/if}
                    </section>

                {:else if selectedSection === 'preferences'}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-center text-2xl font-bold text-card-foreground">Préférences</h3>
                        <div class="grid gap-4">
                            <!-- Changement de username -->
                            <div class="grid gap-3 mb-4">
                                {#if !editingUsername}
                                    <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                        <span class="font-bold text-card-foreground">Nom d'utilisateur</span>
                                        <div class="flex gap-3 items-center">
                                            <span class="text-card-foreground">{data.user.username}</span>
                                            <Button variant="outline" class="ml-auto" onclick={startEditingUsername}>
                                                <Pencil size={16}/>
                                            </Button>
                                        </div>
                                    </div>
                                {:else}
                                    <div class="grid gap-3">
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                            <Label for="newUsername" class="font-bold text-card-foreground">Nouveau nom
                                                d'utilisateur</Label>
                                            <div class="flex flex-col gap-2 w-full">
                                                <Input
                                                        id="newUsername"
                                                        type="text"
                                                        bind:value={newUsername}
                                                        aria-invalid={!!usernameError}
                                                />
                                                {#if usernameError}
                                                    <span class="text-destructive text-sm">{usernameError}</span>
                                                {/if}
                                            </div>
                                        </div>
                                        <div class="flex gap-3 items-center">
                                            <Button
                                                    variant="default"
                                                    onclick={saveUsername}
                                                    disabled={!!usernameError || !newUsername || newUsername === data.user.username}
                                            >
                                                <Save size={16}/>
                                            </Button>
                                            <Button variant="outline" onclick={cancelEditingUsername}>
                                                <XCircle size={16}/>
                                            </Button>
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            <div class="grid gap-3 mb-4">
                                {#if data.user.hasPassword}
                                    {#if !editingPassword}
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                            <span class="font-bold text-card-foreground">Mot de passe</span>
                                            <div class="flex gap-3 items-center">
                                                <span class="text-muted-foreground flex gap-1 items-center">
                                                    {#each Array(8) as _}
                                                        <span class="w-2 h-2 rounded-full bg-muted-foreground"></span>
                                                    {/each}
                                                </span>
                                                <Button variant="outline" class="ml-auto"
                                                        onclick={() => { showPwdModal = true; }}>
                                                    <Pencil size={16}/>
                                                </Button>
                                            </div>
                                        </div>
                                    {/if}
                                {:else}
                                    <div class="flex gap-4 bg-accent rounded-xl p-5 text-accent-foreground items-start">
                                        <div class="flex flex-col gap-2">
                                            <h4 class="m-0 text-accent-foreground text-lg font-bold">Authentification Google</h4>
                                            <p class="m-0 leading-relaxed">Votre compte est connecté via Google. La gestion du mot de passe se fait directement depuis votre compte Google.</p>
                                            <p class="m-0 text-accent-foreground/80 italic text-sm">Vous n'avez pas besoin de définir un mot de passe pour ce compte.</p>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </section>
                {:else if false}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-center text-2xl font-bold text-card-foreground">Stockage</h3>

                        <!-- Statistiques -->
                        {#if userStats.bucketName}
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <!-- Nom du bucket -->
                                <div class="rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-md">
                                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bucket</p>
                                            <p class="text-lg font-bold text-card-foreground">{userStats.bucketName}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Modèles likés -->
                                <div class="rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shadow-md">
                                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Modèles likés</p>
                                            <p class="text-lg font-bold text-card-foreground">{userStats.likedModelsCount || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Total modèles -->
                                <div class="rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md">
                                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mes modèles</p>
                                            <p class="text-lg font-bold text-card-foreground">{userStats.totalModels || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        {/if}
                    </section>
                {:else if selectedSection === 'modeles'}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-center text-2xl font-bold text-card-foreground">Mes modèles</h3>

                        {#if loadModelsError}
                            <EmptyRoot>
                                <EmptyHeader>
                                    <EmptyTitle>Erreur de chargement</EmptyTitle>
                                    <EmptyDescription>{loadModelsError}</EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button onclick={() => window.location.reload()}>Réessayer</Button>
                                </EmptyContent>
                            </EmptyRoot>
                        {:else if userModels.length === 0}
                            <EmptyRoot>
                                <EmptyHeader>
                                    <EmptyTitle>Aucun modèle pour le moment</EmptyTitle>
                                    <EmptyDescription>Ouvrez la galerie des modèles 3D pour commencer.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button href="/models3D">Voir les modèles</Button>
                                </EmptyContent>
                            </EmptyRoot>
                        {:else}
                            <ModelFiltersComponent
                                    {searchQuery}
                                    selectedCategories={selectedCategories}
                                    categories={userModelCategories}
                                    isAuthenticated={true}
                                    onSearchChange={handleSearchChange}
                                    onCategoryChange={handleCategoryChange}
                            />

                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {#each filteredUserModels as model (model.id)}
                                    <ModelCardComponent
                                            {model}
                                            onClick={() => openModelPopup(model)}
                                    />
                                {/each}
                            </div>

                            {#if filteredUserModels.length === 0}
                                <EmptyRoot>
                                    <EmptyHeader>
                                        <EmptyTitle>Aucun modèle trouvé</EmptyTitle>
                                        <EmptyDescription>Essayez de modifier vos critères de recherche
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </EmptyRoot>
                            {/if}
                        {/if}
                    </section>
                {:else if selectedSection === 'abonnement'}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-center text-2xl font-bold text-card-foreground">Abonnement</h3>
                        
                        <!-- Current subscription display -->
                        {#if data.currentSubscription}
                            <div class="mb-6">
                                <SubscriptionCard 
                                    subscription={data.currentSubscription}
                                    userStats={userStats}
                                    {isCancellingSubscription}
                                    {formatStorageUsed}
                                    onCancelSubscription={openCancelDialog}
                                />
                            </div>
                        {/if}
                        
                        <!-- Plans disponibles -->
                        {#if data.plans && data.plans.length > 0}
                            <div>
                                <h4 class="text-lg font-semibold text-card-foreground mb-4">Plans disponibles</h4>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {#each data.plans as dbPlan}
                                        {@const isCurrentPlan = getCurrentPlanStatus(dbPlan, data.currentSubscription)}
                                        {@const styles = getPlanStyles(dbPlan.id, isCurrentPlan)}
                                        {@const planConfig = getPlanConfig(dbPlan, isCurrentPlan, data.currentSubscription?.isActive)}
                                        <CardPricing
                                            id={dbPlan.id}
                                            name={dbPlan.name}
                                            price={planConfig.price}
                                            period={planConfig.period}
                                            description=""
                                            gradient={styles.gradient}
                                            borderColor={styles.borderColor}
                                            buttonText={planConfig.buttonText}
                                            buttonVariant={planConfig.buttonVariant}
                                            disabled={planConfig.disabled}
                                            isCurrentPlan={isCurrentPlan}
                                            onSelect={handlePlanSelect}
                                        />
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </section>
                {/if}
            </div>
        </main>
    </div>
</div>

<ChangePasswordModal isOpen={showPwdModal} onclose={() => showPwdModal = false}
                     onsaved={() => { showPwdModal = false; }}/>

<Model3DPopupComponent
        isOpen={currentPopup.isOpen}
        title={currentPopup.title}
        category={currentPopup.category}
        modelPath={currentPopup.modelPath}
        onclose={closePopup}
        ondownload={downloadModel}
/>

<ConfirmDialogComponent
    isOpen={showCancelDialog}
    title="Annulation de l'abonnement"
    message="Cette action est irréversible. Vous conserverez l'accès à toutes les fonctionnalités Pro jusqu'à la fin de votre période de facturation actuelle.{'\n\n'}Après cette date, votre compte basculera automatiquement vers le plan gratuit avec les limitations associées."
    confirmText="Confirmer l'annulation"
    cancelText="Annuler"
    variant="danger"
    on:confirm={handleCancelSubscription}
    on:cancel={closeCancelDialog}
/>

<!-- Notification de succès moderne -->
{#if showSuccessNotification}
    <div class="fixed top-4 right-4 z-[1001] pointer-events-auto" 
         transition:fly={{ y: -50, duration: 300, opacity: 0 }}>
        <div class="bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-400 rounded-lg shadow-lg p-4 max-w-md">
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-0.5">
                    <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-emerald-800 dark:text-emerald-200 leading-5">
                        {notificationMessage}
                    </p>
                </div>
                <button 
                    onclick={closeSuccessNotification}
                    class="flex-shrink-0 ml-2 text-emerald-400 hover:text-emerald-600 transition-colors duration-200"
                    aria-label="Fermer la notification"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
{/if}