<script lang="ts">
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { goto } from '$app/navigation';
    import { onMount, tick } from 'svelte';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import ChangePasswordModal from '$lib/components/ChangePasswordModal/ChangePasswordModal.svelte';
    import ModelFiltersComponent from '$lib/components/ModelFilters/ModelFiltersComponent.svelte';
    import ModelCardComponent from '$lib/components/ModelCard/ModelCardComponent.svelte';
    import EmptyStateComponent from '$lib/components/EmptyState/EmptyStateComponent.svelte';
    import Model3DPopupComponent from '$lib/components/Model3DPopup/Model3DPopupComponent.svelte';
    import { theme, toggleTheme } from '$lib/stores/theme';
    import { Pencil, Save, XCircle } from 'lucide-svelte';
    import QRCode from 'qrcode';

    let { data }: {
        data: {
            user: {
                id: number;
                username: string;
                email: string;
                createdAt: string;
                hasPassword: boolean;
            };
        };
    } = $props();

    let selectedSection = $state<'securite' | 'preferences' | 'modeles' | 'abonnement'>('securite');
    let language = $state<'fr' | 'en'>('fr');
    let editingPassword = $state(false);
    
    let currentTheme = $state($theme);
    $effect(() => {
        currentTheme = $theme;
    });
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
    let selectedCategory = $state('');
    let isLoadingModels = $state(false);
    let loadModelsError = $state('');
    
    let filteredUserModels = $derived(filterAndSortUserModels(userModels, searchQuery, selectedCategory));
    let userModelCategories = $derived(Array.from(new Set(userModels.map((m) => m.category))).sort());
    let userStats = $state<{
        bucketName?: string;
        totalModels?: number;
        likedModelsCount?: number;
        storageUsed?: number;
        storageLimit?: number;
        storageUsedMB?: string;
        storageLimitMB?: number;
        storagePercentage?: string;
    }>({});

    let currentPopup = $state({
        isOpen: false,
        title: '',
        category: '',
        modelPath: ''
    });

    // QR Code pour synchronisation scanner
    let qrCodeDataUrl = $state('');
    let qrCodeCanvas = $state<HTMLCanvasElement>();

    async function syncHeights() {
        if (!leftCardEl || !rightCardEl) return;
        await tick();
        const h = leftCardEl.offsetHeight;
        const target = Math.max(600, h);
        rightCardEl.style.height = target + 'px';
    }

    $effect(() => {
        syncHeights();
    });

    async function loadUserModels() {
        isLoadingModels = true;
        loadModelsError = '';
        
        try {
            const response = await fetch('/api/user-models');
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du chargement des modèles');
            }
            
            userModels = data.models || [];
            userStats = data.stats || {};
            filteredUserModels = [...userModels];
            isLoadingModels = false;
        } catch (error) {
            console.error('Erreur lors du chargement des modèles:', error);
            loadModelsError = 'Impossible de charger vos modèles.';
            isLoadingModels = false;
        }
    }

    function filterAndSortUserModels(list: typeof userModels, search: string, categoryFilter: string) {
        const normalize = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const q = normalize(search.trim());

        let filtered = list.filter(model => {
            const title = normalize(model.title);
            const subtitle = normalize(model.subtitle);
            const content = normalize(model.content);
            const category = normalize(model.category);

            const matchesSearch = q === '' || title.includes(q) || subtitle.includes(q) || content.includes(q) || category.includes(q);
            const matchesCategory = !categoryFilter || model.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        return filtered;
    }

    function handleSearchChange(value: string) {
        searchQuery = value;
    }

    function handleCategoryChange(value: string) {
        selectedCategory = value;
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
        const { modelPath, title } = event.detail;
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

    async function generateQRCode() {
        try {
            const syncToken = `scanner-sync-${data.user.id}-${Date.now()}`;
            const syncUrl = `${window.location.origin}/api/scanner-sync?token=${syncToken}`;
            
            if (qrCodeCanvas) {
                await QRCode.toCanvas(qrCodeCanvas, syncUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors de la génération du QR code:', error);
        }
    }

    onMount(() => {
        syncHeights();
        loadUserModels();
        const onResize = () => syncHeights();
        window.addEventListener('resize', onResize);
        
        tick().then(() => {
            if (selectedSection === 'securite' && qrCodeCanvas) {
                generateQRCode();
            }
        });
        
        return () => window.removeEventListener('resize', onResize);
    });

    function validatePasswords() {
        passwordError = '';
        if (editingPassword) {
            if (newPassword.length < 8) passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
            if (newPassword && confirmPassword && newPassword !== confirmPassword) passwordError = 'Les mots de passe ne correspondent pas.';
        }
    }
    
    $effect(() => {
        validatePasswords();
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
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
            goto('/');
        }
    }

    function handleSectionChange(section: 'securite' | 'preferences' | 'modeles' | 'abonnement') {
        selectedSection = section;
        if (section === 'securite') {
            tick().then(() => {
                if (qrCodeCanvas) {
                    generateQRCode();
                }
            });
        }
    }

    function handleLanguageChange(lang: 'fr' | 'en') {
        language = lang;
    }

    function handleThemeChange(newTheme: 'light' | 'dark') {
        theme.setTheme(newTheme);
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
        if (!usernameRegex.test(newUsername)) {
            return false;
        }
        
        return true;
    }

    $effect(() => {
        if (newUsername && editingUsername) {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newUsername }),
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

<div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-950">
    <div class="w-full max-w-7xl mx-auto grid gap-5 grid-cols-[340px_1fr] items-stretch">
        <aside>
            <div class="backdrop-blur-md rounded-2xl shadow-xl p-7 grid place-items-center gap-2 min-h-[650px]" style="background-color: {$theme === 'dark' ? '#1f2937' : '#ffffff'}" bind:this={leftCardEl}>
                <div class="w-24 h-24 rounded-full grid place-items-center bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white text-2xl font-bold shadow-lg">
                    {data.user.email.charAt(0).toUpperCase()}
                </div>
                <div class="font-extrabold text-lg" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">{data.user.username}</div>
                <div class="text-base" style="color: {$theme === 'dark' ? '#d1d5db' : '#4b5563'}">{data.user.email || 'Connecté via Google'}</div>
                <div class="mt-1 px-3 py-2 rounded-full text-sm border" style="background-color: {$theme === 'dark' ? 'rgba(6, 78, 59, 0.4)' : '#d1fae5'}; color: {$theme === 'dark' ? '#6ee7b7' : '#065f46'}; border-color: {$theme === 'dark' ? 'rgba(5, 150, 105, 0.5)' : '#a7f3d0'}">
                    Membre depuis {new Date(data.user.createdAt).toLocaleDateString('fr-FR')}
                </div>

                <ul class="w-full grid gap-3 mt-4" role="tablist">
                    {#each [
                        { id: 'securite', label: 'Synchronisation Scanner' },
                        { id: 'preferences', label: 'Préférences' },
                        { id: 'modeles', label: 'Mes modèles' },
                        { id: 'abonnement', label: 'Abonnement' }
                    ] as section}
                        <li>
                            <button 
                                type="button" 
                                role="tab" 
                                class="w-full text-left rounded-xl px-4 py-3 font-semibold transition-all duration-200 border"
                                style="
                                    background-color: {selectedSection === section.id ? ($theme === 'dark' ? 'rgba(79, 70, 229, 0.3)' : '#e0e7ff') : ($theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb')};
                                    color: {selectedSection === section.id ? ($theme === 'dark' ? '#c7d2fe' : '#3730a3') : ($theme === 'dark' ? '#e5e7eb' : '#374151')};
                                    border-color: {selectedSection === section.id ? ($theme === 'dark' ? 'rgba(99, 102, 241, 0.5)' : '#c7d2fe') : 'transparent'};
                                "
                                aria-selected={selectedSection === section.id} 
                                onclick={() => handleSectionChange(section.id as 'securite' | 'preferences' | 'modeles' | 'abonnement')}
                            >
                                {section.label}
                            </button>
                        </li>
                    {/each}
                </ul>
                
                <div class="mt-5 flex justify-center">
                    <ButtonComponent color="primary" variant="raised" href="" onClick={handleLogout}>
                        Se déconnecter
                    </ButtonComponent>
                </div>
            </div>
        </aside>

        <main>
            <div class="rounded-2xl shadow-xl p-7 overflow-auto h-full" style="background-color: {$theme === 'dark' ? '#1f2937' : '#ffffff'}" bind:this={rightCardEl}>
            {#if selectedSection==='securite'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-center text-2xl font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">Synchronisation Scanner</h3>
                    <div class="flex flex-col items-center justify-center gap-5 min-h-[400px]">
                        <div class="flex flex-col items-center gap-4">
                            <p class="text-gray-700 dark:text-gray-300 text-center mb-4 text-base">
                                Scannez ce QR code avec votre application Scanner 3D pour synchroniser votre appareil
                            </p>
                            <div class="bg-white dark:bg-white p-4 rounded-xl shadow-lg">
                                <canvas bind:this={qrCodeCanvas} class="w-[300px] h-[300px]"></canvas>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                                Le QR code expire après utilisation
                            </p>
                        </div>
                    </div>
                </section>
            {:else if selectedSection==='preferences'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-center text-2xl font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">Préférences</h3>
                    <div class="grid gap-4">
                        <!-- Changement de username -->
                        <div class="grid gap-3 mb-4">
                            {#if !editingUsername}
                                <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                    <span class="font-bold text-gray-800 dark:text-gray-200">Nom d'utilisateur</span>
                                    <div class="flex gap-3 items-center">
                                        <span class="text-gray-700 dark:text-gray-300">{data.user.username}</span>
                                        <ButtonComponent color="primary" variant="outlined" classe="ml-auto" onClick={startEditingUsername}>
                                            <Pencil size={16} />
                                        </ButtonComponent>
                                    </div>
                                </div>
                            {:else}
                                <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                    <span class="font-bold text-gray-800 dark:text-gray-200">Nouveau nom d'utilisateur</span>
                                    <div class="flex gap-6 items-center">
                                        <div class="flex-1 pt-4">
                                            <TextFieldComponent 
                                                label="" 
                                                classe="nolabel mb-0" 
                                                type="text" 
                                                bind:value={newUsername}
                                                error={usernameError}
                                            />
                                        </div>
                                        <div class="flex gap-2 items-center">
                                            <ButtonComponent color="primary" variant="outlined" classe="!border-red-500 !text-red-600 hover:!bg-red-500 hover:!text-white dark:!border-red-400 dark:!text-red-400 dark:hover:!bg-red-400 dark:hover:!text-white" href="" onClick={cancelEditingUsername}>
                                                <XCircle size={16} />
                                            </ButtonComponent>
                                            <ButtonComponent 
                                                color="primary" 
                                                variant="outlined" 
                                                classe="!border-green-500 !text-green-600 hover:!bg-green-500 hover:!text-white dark:!border-green-400 dark:!text-green-400 dark:hover:!bg-green-400 dark:hover:!text-white" 
                                                href="" 
                                                onClick={saveUsername}
                                                disabled={!!usernameError || !newUsername || newUsername === data.user.username}
                                            >
                                                <Save size={16} />
                                            </ButtonComponent>
                                        </div>
                                    </div>
                                </div>
                                {#if usernameError}
                                    <div class="col-start-2 text-red-600 dark:text-red-400 font-semibold text-sm">{usernameError}</div>
                                {/if}
                            {/if}
                        </div>
                        
                        <!-- Mot de passe -->
                        <div class="grid gap-3 mb-4">
                            {#if data.user.hasPassword}
                                {#if !editingPassword}
                                    <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                        <span class="font-bold text-gray-800 dark:text-gray-200">Mot de passe</span>
                                        <div class="flex gap-3 items-center">
                                            <span class="text-gray-700 dark:text-gray-300 flex gap-1 items-center">
                                                <span class="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-300"></span>
                                                <span class="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-300"></span>
                                                <span class="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-300"></span>
                                                <span class="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-300"></span>
                                                <span class="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-300"></span>
                                                <span class="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-300"></span>
                                            </span>
                                            <ButtonComponent color="primary" variant="outlined" classe="ml-auto" href="" onClick={() => { showPwdModal = true; }}>
                                                <Pencil size={16} />
                                            </ButtonComponent>
                                        </div>
                                    </div>
                                {:else}
                                    <div class="grid gap-3">
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                            <span class="font-bold text-gray-800 dark:text-gray-200">Mot de passe actuel</span>
                                            <TextFieldComponent label="" classe="nolabel" type="password" bind:value={currentPassword} />
                                        </div>
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                            <span class="font-bold text-gray-800 dark:text-gray-200">Nouveau mot de passe</span>
                                            <TextFieldComponent label="" classe="nolabel" type="password" bind:value={newPassword} />
                                        </div>
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                            <span class="font-bold text-gray-800 dark:text-gray-200">Confirmer le mot de passe</span>
                                            <TextFieldComponent label="" classe="nolabel" type="password" bind:value={confirmPassword} />
                                        </div>
                                        {#if passwordError}
                                            <div class="text-red-600 dark:text-red-400 font-semibold">{passwordError}</div>
                                        {/if}
                                        <div class="flex gap-3 items-center">
                                            <ButtonComponent color="primary" variant="raised" href="" onClick={savePassword} disabled={!!passwordError || !currentPassword || !newPassword || !confirmPassword}>
                                                Enregistrer
                                            </ButtonComponent>
                                            <ButtonComponent color="secondary" variant="outlined" href="" onClick={() => { editingPassword = false; resetPasswordForm(); }}>
                                                Annuler
                                            </ButtonComponent>
                                        </div>
                                    </div>
                                {/if}
                            {:else}
                                <div class="flex gap-4 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl p-5 text-white items-start shadow-md">
                                    <div class="flex flex-col gap-2">
                                        <h4 class="m-0 text-white text-lg font-bold">Authentification Google</h4>
                                        <p class="m-0 leading-relaxed text-white/95">Votre compte est connecté via Google. La gestion du mot de passe se fait directement depuis votre compte Google.</p>
                                        <p class="m-0 text-white/80 italic text-sm">Vous n'avez pas besoin de définir un mot de passe pour ce compte.</p>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        
                        <!-- Double authentification -->
                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-4">
                            <span class="font-bold text-gray-800 dark:text-gray-200">Double authentification</span>
                            <input type="text" value="Désactivée" disabled class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 cursor-not-allowed" />
                        </div>
                        
                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                            <span class="font-bold text-gray-800 dark:text-gray-200">Thème</span>
                            <div class="inline-flex gap-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg shadow-inner" role="tablist" aria-label="Theme">
                                <button 
                                    type="button" 
                                    role="tab" 
                                    class="px-4 py-2 rounded-md font-semibold transition-all duration-200 {$theme === 'light' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}"
                                    onclick={() => handleThemeChange('light')} 
                                    aria-selected={$theme === 'light'}
                                >
                                    Clair
                                </button>
                                <button 
                                    type="button" 
                                    role="tab" 
                                    class="px-4 py-2 rounded-md font-semibold transition-all duration-200 {$theme === 'dark' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}"
                                    onclick={() => handleThemeChange('dark')} 
                                    aria-selected={$theme === 'dark'}
                                >
                                    Sombre
                                </button>
                            </div>
                        </div>
            </div>
                </section>
            {:else if selectedSection==='modeles'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-center text-2xl font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">Mes modèles</h3>
                    
                    <!-- Statistiques -->
                    {#if userStats.bucketName}
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <!-- Nom du bucket -->
                            <div class="rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow duration-200" style="background: {$theme === 'dark' ? '#374151' : 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)'}; border-color: {$theme === 'dark' ? '#4b5563' : '#bfdbfe'}">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-md">
                                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-medium uppercase tracking-wide" style="color: {$theme === 'dark' ? '#93c5fd' : '#4b5563'}">Bucket</p>
                                        <p class="text-lg font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">{userStats.bucketName}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Modèles likés -->
                            <div class="rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow duration-200" style="background: {$theme === 'dark' ? '#374151' : 'linear-gradient(to bottom right, #fef2f2, #fce7f3)'}; border-color: {$theme === 'dark' ? '#4b5563' : '#fecaca'}">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-red-500 dark:bg-red-600 flex items-center justify-center shadow-md">
                                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-medium uppercase tracking-wide" style="color: {$theme === 'dark' ? '#fca5a5' : '#4b5563'}">Modèles likés</p>
                                        <p class="text-lg font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">{userStats.likedModelsCount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Total modèles -->
                            <div class="rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow duration-200" style="background: {$theme === 'dark' ? '#374151' : 'linear-gradient(to bottom right, #f0fdf4, #d1fae5)'}; border-color: {$theme === 'dark' ? '#4b5563' : '#bbf7d0'}">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center shadow-md">
                                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-medium uppercase tracking-wide" style="color: {$theme === 'dark' ? '#86efac' : '#4b5563'}">Mes modèles</p>
                                        <p class="text-lg font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">{userStats.totalModels || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Stockage utilisé -->
                        <div class="rounded-xl p-5 mb-6 border shadow-sm hover:shadow-md transition-shadow duration-200" style="background: {$theme === 'dark' ? '#374151' : 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)'}; border-color: {$theme === 'dark' ? '#4b5563' : '#e5e7eb'}">
                            <div class="flex items-center justify-between mb-3">
                                <div>
                                    <p class="text-sm font-semibold mb-1 uppercase tracking-wide" style="color: {$theme === 'dark' ? '#e5e7eb' : '#374151'}">Stockage utilisé</p>
                                    <p class="text-2xl font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">
                                        {userStats.storageUsedMB || '0'} MB
                                        <span class="text-sm font-normal" style="color: {$theme === 'dark' ? '#d1d5db' : '#4b5563'}">
                                            / {userStats.storageLimitMB || 1024} MB
                                        </span>
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">{userStats.storagePercentage || '0'}%</p>
                                    <p class="text-xs uppercase tracking-wide" style="color: {$theme === 'dark' ? '#d1d5db' : '#4b5563'}">utilisé</p>
                                </div>
                            </div>
                            
                            <!-- Barre de progression -->
                            <div class="w-full rounded-full h-3 overflow-hidden shadow-inner" style="background-color: {$theme === 'dark' ? '#111827' : '#e5e7eb'}">
                                <div 
                                    class="h-full transition-all duration-500 ease-out rounded-full shadow-sm"
                                    style="width: {Math.min(100, parseFloat(userStats.storagePercentage || '0'))}%; background: linear-gradient(to right, #3b82f6, #6366f1)"
                                ></div>
                            </div>
                            
                            {#if parseFloat(userStats.storagePercentage || '0') > 80}
                                <p class="text-xs mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg border" style="color: {$theme === 'dark' ? '#fcd34d' : '#92400e'}; background-color: {$theme === 'dark' ? 'rgba(120, 53, 15, 0.4)' : '#fef3c7'}; border-color: {$theme === 'dark' ? 'rgba(180, 83, 9, 0.5)' : '#fcd34d'}">
                                    <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    <span class="font-medium">Attention : Vous approchez de la limite de stockage</span>
                                </p>
                            {/if}
                        </div>
                    {/if}
                    
                    {#if isLoadingModels}
                        <!-- Skeleton Loader -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {#each Array(6) as _}
                                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                                    <!-- Image skeleton -->
                                    <div class="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
                                    
                                    <!-- Content skeleton -->
                                    <div class="p-4 space-y-3">
                                        <!-- Badge skeleton -->
                                        <div class="flex items-center gap-2">
                                            <div class="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        </div>
                                        
                                        <!-- Title skeleton -->
                                        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        
                                        <!-- Subtitle skeleton -->
                                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else if loadModelsError}
                        <EmptyStateComponent 
                            icon=""
                            title="Erreur de chargement"
                            description={loadModelsError}
                        />
                    {:else if userModels.length === 0}
                        <div class="flex flex-col items-center justify-center text-center gap-4 min-h-[200px] py-12">
                            <p class="text-gray-600 dark:text-gray-400 text-lg font-medium">Aucun modèle pour le moment</p>
                            <p class="text-gray-500 dark:text-gray-500 text-sm">Ouvrez la galerie des modèles 3D pour commencer.</p>
                            <a 
                                class="border-2 rounded-lg px-5 py-2.5 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-200 font-semibold mt-2" 
                                href="/models3D"
                            >
                                Voir les modèles
                            </a>
                        </div>
                    {:else}
                        <ModelFiltersComponent 
                            {searchQuery}
                            {selectedCategory}
                            categories={userModelCategories}
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
                            <EmptyStateComponent 
                                icon=""
                                title="Aucun modèle trouvé"
                                description="Essayez de modifier vos critères de recherche"
                            />
                        {/if}
                    {/if}
                </section>
            {:else}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-center text-2xl font-bold" style="color: {$theme === 'dark' ? '#ffffff' : '#111827'}">Abonnement</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {#each [
                            { id: 'free', name: 'Free Plan', description: 'Accès limité aux fonctionnalités.', current: true, gradient: 'from-gray-700 to-gray-800 dark:from-gray-700 dark:to-gray-800' },
                            { id: 'pro', name: 'Pro', description: 'Limites étendues et plus de confort.', current: false, gradient: 'from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700' },
                            { id: 'ultra', name: 'Ultra', description: 'Limites très élevées et accès anticipé.', current: false, gradient: 'from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700' }
                        ] as plan}
                            <div class="bg-gradient-to-br {plan.gradient} text-white rounded-xl p-6 grid gap-3 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-white/10">
                                <h4 class="text-white text-xl font-bold">{plan.name}</h4>
                                <p class="text-white/90 text-sm leading-relaxed">{plan.description}</p>
                                <button 
                                    type="button" 
                                    class="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 backdrop-blur-sm border border-white/20" 
                                    disabled={plan.current}
                                >
                                    {plan.current ? 'Plan Actuel' : `Passer en ${plan.name}`}
                                </button>
                            </div>
                        {/each}
                    </div>
                </section>
            {/if}
            </div>
        </main>
        </div>
</div>

<ChangePasswordModal isOpen={showPwdModal} onclose={() => showPwdModal = false} onsaved={() => { showPwdModal = false; }} />

<Model3DPopupComponent
    isOpen={currentPopup.isOpen}
    title={currentPopup.title}
    category={currentPopup.category}
    modelPath={currentPopup.modelPath}
    on:close={closePopup}
    on:download={downloadModel}
/>