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

    export let data: {
    user: {
      id: number;
      username: string;
      email: string;
      createdAt: string;
      hasPassword: boolean;
        };
    };

    let selectedSection: 'securite' | 'preferences' | 'modeles' | 'abonnement' = 'securite';
    let language: 'fr' | 'en' = 'fr';
    let editingPassword = false;
    let showPwdModal = false;
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';
    let passwordError = '';
    // Changement de username
    let editingUsername = false;
    let newUsername = '';
    let usernameError = '';
    let leftCardEl: HTMLDivElement;
    let rightCardEl: HTMLDivElement;

    // Modèles 3D
    let userModels: any[] = [];
    let filteredUserModels: any[] = [];
    let userModelCategories: string[] = [];
    let searchQuery = '';
    let selectedCategory = '';
    let isLoadingModels = false;
    let loadModelsError = '';

    let currentPopup = {
        isOpen: false,
        title: '',
        category: '',
        modelPath: ''
    };

    async function syncHeights() {
        if (!leftCardEl || !rightCardEl) return;
        await tick();
        const h = leftCardEl.offsetHeight;
        const target = Math.max(320, h);
        rightCardEl.style.height = target + 'px';
    }

    $: selectedSection, syncHeights();

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

    $: filteredUserModels = filterAndSortUserModels(userModels, searchQuery, selectedCategory);
    $: userModelCategories = Array.from(new Set(userModels.map((m) => m.category))).sort();

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
            
            console.log(`Téléchargement de ${title} réussi`);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du modèle.');
        }
    }

    onMount(() => {
        syncHeights();
        loadUserModels();
        const onResize = () => syncHeights();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    });

    function validatePasswords() {
        passwordError = '';
        if (editingPassword) {
            if (newPassword.length < 8) passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
            if (newPassword && confirmPassword && newPassword !== confirmPassword) passwordError = 'Les mots de passe ne correspondent pas.';
        }
    }
    
    $: validatePasswords();

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

            console.log('Mot de passe changé');
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
    }

    function handleLanguageChange(lang: 'fr' | 'en') {
        language = lang;
    }

    function handleThemeChange(newTheme: 'light' | 'dark') {
        if (newTheme === 'light') {
            theme.set('light');
        } else {
            theme.set('dark');
        }
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
        // Ne valide pas si c'est vide ou identique à l'actuel (pour désactiver le bouton)
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

    // Réinitialiser l'erreur quand l'utilisateur modifie le champ
    $: if (newUsername && editingUsername) {
        // Efface l'erreur serveur uniquement, pas les erreurs de validation
        if (usernameError === 'Ce nom d\'utilisateur est déjà utilisé' || usernameError === 'Erreur réseau') {
            usernameError = '';
        }
    }

    async function saveUsername() {
        // Validation côté client avant envoi
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

            // Mettre à jour les données locales
            data.user.username = newUsername;
            editingUsername = false;
            usernameError = '';
        } catch (err) {
            console.error(err);
            usernameError = 'Erreur réseau';
        }
    }
</script>

<div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-6xl mx-auto grid gap-5 grid-cols-[340px_1fr] items-stretch">
        <aside>
            <div class="bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-2xl p-7 grid place-items-center gap-2 h-full" bind:this={leftCardEl}>
                <div class="w-24 h-24 rounded-full grid place-items-center bg-gray-700 text-white text-2xl font-bold">
                    {data.user.email.charAt(0).toUpperCase()}
                </div>
                <div class="font-extrabold text-gray-900 dark:text-white text-lg">{data.user.username}</div>
                <div class="text-gray-500 dark:text-gray-400 text-base">{data.user.email || 'Connecté via Google'}</div>
                <div class="mt-1 px-3 py-2 rounded-full text-sm" style="background-color: {$theme === 'dark' ? '#064e3b' : '#d1fae5'}; color: {$theme === 'dark' ? '#6ee7b7' : '#065f46'};">
                    Membre depuis {new Date(data.user.createdAt).toLocaleDateString('fr-FR')}
                </div>

                <ul class="w-full grid gap-3 mt-4" role="tablist">
                    {#each [
                        { id: 'securite', label: 'Sécurité du compte' },
                        { id: 'preferences', label: 'Préférences' },
                        { id: 'modeles', label: 'Mes modèles' },
                        { id: 'abonnement', label: 'Abonnement' }
                    ] as section}
                        <li>
                            <button 
                                type="button" 
                                role="tab" 
                                class="w-full text-left rounded-xl px-4 py-3 font-semibold transition-colors duration-200"
                                style="background-color: {selectedSection === section.id ? ($theme === 'dark' ? '#1e3a8a' : '#eef2ff') : ($theme === 'dark' ? '#374151' : '#f8fafc')}; color: {selectedSection === section.id ? ($theme === 'dark' ? '#dbeafe' : '#1e3a8a') : ($theme === 'dark' ? '#ffffff' : '#1f2937')};"
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
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-7 overflow-auto h-full" bind:this={rightCardEl}>
            {#if selectedSection==='securite'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 dark:text-white text-center text-2xl">Sécurité du compte</h3>
                    <div class="flex flex-col items-center gap-5">
                        <div class="grid gap-3 w-full max-w-[500px]">
                            {#if data.user.hasPassword}
                                {#if !editingPassword}
                                    <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                        <span class="font-bold text-gray-700">Mot de passe</span>
                                        <ButtonComponent color="primary" variant="raised" classe="w-64" href="" onClick={() => { showPwdModal = true; }}>
                                            Changer le mot de passe
                                        </ButtonComponent>
                                    </div>
                                {:else}
                                    <div class="grid gap-3">
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                            <span class="font-bold text-gray-700">Mot de passe actuel</span>
                                            <TextFieldComponent label="" classe="nolabel" type="password" bind:value={currentPassword} />
                                        </div>
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                            <span class="font-bold text-gray-700">Nouveau mot de passe</span>
                                            <TextFieldComponent label="" classe="nolabel" type="password" bind:value={newPassword} />
                                        </div>
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                            <span class="font-bold text-gray-700">Confirmer le mot de passe</span>
                                            <TextFieldComponent label="" classe="nolabel" type="password" bind:value={confirmPassword} />
                                        </div>
                                        {#if passwordError}
                                            <div class="text-red-600 font-semibold">{passwordError}</div>
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
                                <!-- Utilisateur connecté via Google OAuth -->
                                <div class="flex gap-4 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-xl p-5 text-white items-start">
                                    <div class="text-2xl">🔒</div>
                                    <div class="flex flex-col gap-2">
                                        <h4 class="m-0 text-white text-lg font-bold">Authentification Google</h4>
                                        <p class="m-0 leading-relaxed">Votre compte est connecté via Google. La gestion du mot de passe se fait directement depuis votre compte Google.</p>
                                        <p class="m-0 text-white/85 italic">Vous n'avez pas besoin de définir un mot de passe pour ce compte.</p>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]">
                            <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                <span class="font-bold text-gray-700 dark:text-gray-300">Double authentification</span>
                                <input type="text" value="Désactivée" disabled class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>
                    </div>
                </section>
            {:else if selectedSection==='preferences'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 dark:text-white text-center text-2xl">Préférences</h3>
                    <div class="grid gap-4">
                        <!-- Changement de username -->
                        <div class="grid gap-3 mb-4">
                            {#if !editingUsername}
                                <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                    <span class="font-bold text-gray-700">Nom d'utilisateur</span>
                                    <div class="flex gap-3 items-center">
                                        <span class="text-gray-600">{data.user.username}</span>
                                        <ButtonComponent color="primary" variant="outlined" classe="ml-auto" onClick={startEditingUsername}>
                                            Modifier
                                        </ButtonComponent>
                                    </div>
                                </div>
                            {:else}
                                <div class="grid gap-3">
                                    <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                        <span class="font-bold text-gray-700">Nouveau nom d'utilisateur</span>
                                        <TextFieldComponent 
                                            label="" 
                                            classe="nolabel" 
                                            type="text" 
                                            bind:value={newUsername}
                                            error={usernameError}
                                        />
                                    </div>
                                    <div class="flex gap-3 items-center">
                                        <ButtonComponent 
                                            color="primary" 
                                            variant="raised" 
                                            onClick={saveUsername}
                                            disabled={!!usernameError || !newUsername || newUsername === data.user.username}
                                        >
                                            Enregistrer
                                        </ButtonComponent>
                                        <ButtonComponent color="secondary" variant="outlined" onClick={cancelEditingUsername}>
                                            Annuler
                                        </ButtonComponent>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        
                        <div class="border-t border-gray-200 my-2"></div>
                        
                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                            <span class="font-bold text-gray-700 dark:text-gray-300">Langue</span>
                            <select 
                                id="lang-select" 
                                value={language}
                                onchange={(e) => handleLanguageChange((e.target as HTMLSelectElement).value as 'fr' | 'en')}
                                class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                            <span class="font-bold text-gray-700 dark:text-gray-300">Thème</span>
                            <div class="inline-flex gap-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg" role="tablist" aria-label="Theme">
                                <button 
                                    type="button" 
                                    role="tab" 
                                    class="px-3 py-2 rounded-md font-semibold text-gray-800 dark:text-white transition-colors duration-200"
                                    class:bg-white={$theme === 'light'}
                                    class:dark:bg-gray-600={$theme === 'light'}
                                    onclick={() => handleThemeChange('light')} 
                                    aria-selected={$theme === 'light'}
                                >
                                    <span class="mr-1">☀️</span> Clair
                                </button>
                                <button 
                                    type="button" 
                                    role="tab" 
                                    class="px-3 py-2 rounded-md font-semibold text-gray-800 dark:text-white transition-colors duration-200"
                                    class:bg-white={$theme === 'dark'}
                                    class:dark:bg-gray-600={$theme === 'dark'}
                                    onclick={() => handleThemeChange('dark')} 
                                    aria-selected={$theme === 'dark'}
                                >
                                    <span class="mr-1">🌙</span> Sombre
                                </button>
                            </div>
                        </div>
            </div>
                </section>
            {:else if selectedSection==='modeles'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 dark:text-white text-center text-2xl">Mes modèles</h3>
                    
                    {#if isLoadingModels}
                        <div class="flex items-center justify-center min-h-[300px]">
                            <div class="text-center">
                                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p class="mt-4 text-gray-600">Chargement de vos modèles...</p>
                            </div>
                        </div>
                    {:else if loadModelsError}
                        <EmptyStateComponent 
                            icon="❌"
                            title="Erreur de chargement"
                            description={loadModelsError}
                        />
                    {:else if userModels.length === 0}
                        <div class="flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                            <p class="text-gray-500 font-semibold">Vous n'avez aucun modèle pour le moment</p>
                            <p class="text-gray-400">Ouvrez la galerie des modèles 3D.</p>
                            <a 
                                class="border rounded-md px-3 py-2 text-blue-600 border-blue-300 hover:bg-blue-50 transition-colors duration-200" 
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
                                icon="🔍"
                                title="Aucun modèle trouvé"
                                description="Essayez de modifier vos critères de recherche"
                            />
                        {/if}
                    {/if}
                </section>
            {:else}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 dark:text-white text-center text-2xl">Abonnement</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {#each [
                            { id: 'free', name: 'Free Plan', description: 'Accès limité aux fonctionnalités.', current: true },
                            { id: 'pro', name: 'Pro', description: 'Limites étendues et plus de confort.', current: false },
                            { id: 'ultra', name: 'Ultra', description: 'Limites très élevées et accès anticipé.', current: false }
                        ] as plan}
                            <div class="bg-gray-900 dark:bg-gray-700 text-gray-200 dark:text-gray-100 rounded-xl p-4 grid gap-2">
                                <h4 class="text-white dark:text-white">{plan.name}</h4>
                                <p class="text-gray-400 dark:text-gray-300">{plan.description}</p>
                                <button 
                                    type="button" 
                                    class="bg-blue-400 dark:bg-blue-500 text-gray-900 dark:text-white px-3 py-2 rounded-md font-semibold transition-colors duration-200 hover:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                                    disabled={plan.current}
                                >
                                    {plan.current ? 'Actuel' : `Passer en ${plan.name}`}
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