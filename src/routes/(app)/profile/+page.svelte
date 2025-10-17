<script lang="ts">
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { goto } from '$app/navigation';
    import { onMount, tick } from 'svelte';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';
    import ChangePasswordModal from '$lib/components/ChangePasswordModal/ChangePasswordModal.svelte';

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
    let theme: 'light' | 'dark' = 'light';
    // Sécurité - changement de mot de passe
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

    async function syncHeights() {
        if (!leftCardEl || !rightCardEl) return;
        await tick();
        const h = leftCardEl.offsetHeight;
        const target = Math.max(320, h);
        rightCardEl.style.height = target + 'px';
    }

    $: selectedSection, syncHeights();

    onMount(() => {
        syncHeights();
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
        theme = newTheme;
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

<div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4">
    <div class="w-full max-w-6xl mx-auto grid gap-5 grid-cols-[340px_1fr] items-stretch">
        <aside>
            <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-7 grid place-items-center gap-2 h-full" bind:this={leftCardEl}>
                <div class="w-24 h-24 rounded-full grid place-items-center bg-gray-700 text-white text-2xl font-bold">
                    {data.user.email.charAt(0).toUpperCase()}
                </div>
                <div class="font-extrabold text-gray-900 text-lg">{data.user.username}</div>
                <div class="text-gray-500 text-base">{data.user.email || 'Connecté via Google'}</div>
                <div class="mt-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full text-sm">
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
                                class="w-full text-left rounded-xl bg-slate-50 hover:bg-slate-100 px-4 py-3 font-semibold text-gray-800 transition-colors duration-200"
                                class:bg-indigo-50={selectedSection === section.id}
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
            <div class="bg-white rounded-2xl shadow-2xl p-7 overflow-auto h-full" bind:this={rightCardEl}>
            {#if selectedSection==='securite'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 text-center text-2xl">Sécurité du compte</h3>
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
                            {/if}
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]">
                            <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                <span class="font-bold text-gray-700">Double authentification</span>
                                <input type="text" value="Désactivée" disabled class="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
                            </div>
                        </div>
                    </div>
                </section>
            {:else if selectedSection==='preferences'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 text-center text-2xl">Préférences</h3>
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
                            <span class="font-bold text-gray-700">Langue</span>
                            <select 
                                id="lang-select" 
                                value={language}
                                onchange={(e) => handleLanguageChange((e.target as HTMLSelectElement).value as 'fr' | 'en')}
                                class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                            <span class="font-bold text-gray-700">Thème</span>
                            <div class="inline-flex gap-2 bg-gray-100 p-1.5 rounded-lg" role="tablist" aria-label="Theme">
                                <button 
                                    type="button" 
                                    role="tab" 
                                    class="px-3 py-2 rounded-md font-semibold text-gray-800 transition-colors duration-200"
                                    class:bg-white={theme === 'light'}
                                    onclick={() => handleThemeChange('light')} 
                                    aria-selected={theme === 'light'}
                                >
                                    <span class="mr-1">☀️</span> Clair
                                </button>
                                <button 
                                    type="button" 
                                    role="tab" 
                                    class="px-3 py-2 rounded-md font-semibold text-gray-800 transition-colors duration-200"
                                    class:bg-white={theme === 'dark'}
                                    onclick={() => handleThemeChange('dark')} 
                                    aria-selected={theme === 'dark'}
                                >
                                    <span class="mr-1">🌙</span> Sombre
                                </button>
                            </div>
                        </div>
            </div>
                </section>
            {:else if selectedSection==='modeles'}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 text-center text-2xl">Mes modèles</h3>
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
                </section>
            {:else}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 text-center text-2xl">Abonnement</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {#each [
                            { id: 'free', name: 'Free Plan', description: 'Accès limité aux fonctionnalités.', current: true },
                            { id: 'pro', name: 'Pro', description: 'Limites étendues et plus de confort.', current: false },
                            { id: 'ultra', name: 'Ultra', description: 'Limites très élevées et accès anticipé.', current: false }
                        ] as plan}
                            <div class="bg-gray-900 text-gray-200 rounded-xl p-4 grid gap-2">
                                <h4>{plan.name}</h4>
                                <p class="text-gray-400">{plan.description}</p>
                                <button 
                                    type="button" 
                                    class="bg-blue-400 text-gray-900 px-3 py-2 rounded-md font-semibold transition-colors duration-200 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" 
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