<script lang="ts">
    import {Input} from '$lib/components/ui/input';
    import {Label} from '$lib/components/ui/label';
    import {goto} from '$app/navigation';
    import {onMount, tick} from 'svelte';
    import {Button} from '$lib/components/ui/button';
    import ChangePasswordModal from '$lib/components/ChangePasswordModal/ChangePasswordModal.svelte';
    import ModelFiltersComponent from '$lib/components/ModelFilters/ModelFiltersComponent.svelte';
    import ModelCardComponent from '$lib/components/ModelCard/ModelCardComponent.svelte';
    import {Empty} from '$lib/components/ui/empty';
    import Model3DPopupComponent from '$lib/components/Model3DPopup/Model3DPopupComponent.svelte';

    export let data: {
        user: {
            id: number;
            username: string;
            email: string;
            createdAt: string;
            hasPassword: boolean;
        };
    };

    let selectedSection: string = 'securite';
    let editingPassword = false;
    let showPwdModal = false;
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';
    let passwordError = '';

    let editingUsername = false;
    let newUsername = '';
    let usernameError = '';
    let leftCardEl: HTMLDivElement;
    let rightCardEl: HTMLDivElement;

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

    $: syncHeights();

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

            console.log(`Téléchargement de ${title} réussi`);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du modèle.');
        }
    }

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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({currentPassword, newPassword, confirmPassword}),
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
            await goto('/');
        }
    }

    function handleSectionChange(section: string) {
        selectedSection = section;
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({newUsername}),
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

<div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4 bg-muted">
    <div class="w-full max-w-6xl mx-auto grid gap-5 grid-cols-[340px_1fr] items-stretch">
        <aside>
            <div class="bg-card backdrop-blur-md rounded-2xl shadow-2xl p-7 grid place-items-center gap-2 h-full"
                 bind:this={leftCardEl}>
                <div class="w-24 h-24 rounded-full grid place-items-center bg-primary text-primary-foreground text-4xl font-bold">
                    {data.user.email.charAt(0).toUpperCase()}
                </div>
                <div class="font-extrabold text-card-foreground text-lg">{data.user.username}</div>
                <div class="text-muted-foreground text-base">{data.user.email || 'Connecté via Google'}</div>
                <div class="mt-1 px-3 py-2 rounded-full text-sm bg-secondary text-secondary-foreground">
                    Membre depuis {new Date(data.user.createdAt).toLocaleDateString('fr-FR')}
                </div>

                <ul class="w-full grid gap-3 mt-4" role="tablist">
                    {#each [
                        {id: 'devices', label: 'Appareils'},
                        {id: 'security', label: 'Sécurité du compte'},
                        {id: 'preferences', label: 'Préférences'},
                        {id: 'subscription', label: 'Abonnement'}
                    ] as section}
                        <li>
                            <button
                                    type="button"
                                    role="tab"
                                    class="w-full text-left rounded-xl px-4 py-3 font-semibold transition-colors duration-200"
                                    class:bg-accent={selectedSection === section.id}
                                    class:text-accent-foreground={selectedSection === section.id}
                                    class:bg-secondary={selectedSection !== section.id}
                                    class:text-secondary-foreground={selectedSection !== section.id}
                                    aria-selected={selectedSection === section.id}
                                    onclick={() => handleSectionChange(section.id)}
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
            <div class="bg-card rounded-2xl shadow-2xl p-7 overflow-auto h-full" bind:this={rightCardEl}>
                {#if selectedSection === 'devices'}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-card-foreground text-center text-2xl">Appareils</h3>
                    </section>
                {:else if selectedSection === 'security'}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-card-foreground text-center text-2xl">Sécurité du compte</h3>
                        <div class="flex flex-col items-center gap-5">
                            <div class="grid gap-3 w-full max-w-[500px]">
                                {#if data.user.hasPassword}
                                    {#if !editingPassword}
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                            <span class="font-bold text-foreground">Mot de passe</span>
                                            <Button variant="default" class="w-64"
                                                    onclick={() => { showPwdModal = true; }}>
                                                Changer le mot de passe
                                            </Button>
                                        </div>
                                    {:else}
                                        <div class="grid gap-3">
                                            <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                                <Label for="currentPassword" class="font-bold text-foreground">Mot de
                                                    passe actuel</Label>
                                                <Input id="currentPassword" type="password"
                                                       bind:value={currentPassword}/>
                                            </div>
                                            <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                                <Label for="newPasswordProfile" class="font-bold text-foreground">Nouveau
                                                    mot de passe</Label>
                                                <Input id="newPasswordProfile" type="password"
                                                       bind:value={newPassword}/>
                                            </div>
                                            <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                                <Label for="confirmPasswordProfile" class="font-bold text-foreground">Confirmer
                                                    le mot de passe</Label>
                                                <Input id="confirmPasswordProfile" type="password"
                                                       bind:value={confirmPassword}/>
                                            </div>
                                            {#if passwordError}
                                                <div class="text-destructive font-semibold">{passwordError}</div>
                                            {/if}
                                            <div class="flex gap-3 items-center">
                                                <Button variant="default" onclick={savePassword}
                                                        disabled={!!passwordError || !currentPassword || !newPassword || !confirmPassword}>
                                                    Enregistrer
                                                </Button>
                                                <Button variant="outline"
                                                        onclick={() => { editingPassword = false; resetPasswordForm(); }}>
                                                    Annuler
                                                </Button>
                                            </div>
                                        </div>
                                    {/if}
                                {:else}
                                    <!-- Utilisateur connecté via Google OAuth -->
                                    <div class="flex gap-4 bg-accent rounded-xl p-5 text-accent-foreground items-start">
                                        <div class="text-2xl">🔒</div>
                                        <div class="flex flex-col gap-2">
                                            <h4 class="m-0 text-accent-foreground text-lg font-bold">Authentification
                                                Google</h4>
                                            <p class="m-0 leading-relaxed">Votre compte est connecté via Google. La
                                                gestion du mot de passe se fait directement depuis votre compte
                                                Google.</p>
                                            <p class="m-0 text-muted-foreground italic">Vous n'avez pas besoin de
                                                définir un mot de passe pour ce compte.</p>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]">
                                <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                                    <span class="font-bold text-foreground">Double authentification</span>
                                    <input type="text" value="Désactivée" disabled
                                           class="border border-border rounded-lg px-3 py-2 bg-muted text-muted-foreground"/>
                                </div>
                            </div>
                        </div>
                    </section>
                {:else if selectedSection === 'preferences'}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-card-foreground text-center text-2xl">Préférences</h3>
                        <div class="grid gap-4">
                            <!-- Changement de username -->
                            <div class="grid gap-3 mb-4">
                                {#if !editingUsername}
                                    <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                        <span class="font-bold text-foreground">Nom d'utilisateur</span>
                                        <div class="flex gap-3 items-center">
                                            <span class="text-foreground">{data.user.username}</span>
                                            <Button variant="outline" class="ml-auto" onclick={startEditingUsername}>
                                                Modifier
                                            </Button>
                                        </div>
                                    </div>
                                {:else}
                                    <div class="grid gap-3">
                                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center">
                                            <Label for="newUsername" class="font-bold text-foreground">Nouveau nom
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
                                                Enregistrer
                                            </Button>
                                            <Button variant="outline" onclick={cancelEditingUsername}>
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            <div class="border-t border-border my-2"></div>
                        </div>
                    </section>
                {:else}
                    <section class="mb-4">
                        <h3 class="m-0 mb-8 text-card-foreground text-center text-2xl">Abonnement</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {#each [
                                {
                                    id: 'free',
                                    name: 'Free Plan',
                                    description: 'Accès limité aux fonctionnalités.',
                                    current: true
                                },
                                {
                                    id: 'pro',
                                    name: 'Pro',
                                    description: 'Limites étendues et plus de confort.',
                                    current: false
                                },
                                {
                                    id: 'ultra',
                                    name: 'Ultra',
                                    description: 'Limites très élevées et accès anticipé.',
                                    current: false
                                }
                            ] as plan}
                                <div class="bg-card border border-border text-card-foreground rounded-xl p-4 grid gap-2">
                                    <h4 class="text-card-foreground font-bold">{plan.name}</h4>
                                    <p class="text-muted-foreground">{plan.description}</p>
                                    <button
                                            type="button"
                                            class="bg-primary text-primary-foreground px-3 py-2 rounded-md font-semibold transition-colors duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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

<ChangePasswordModal isOpen={showPwdModal} onclose={() => showPwdModal = false}
                     onsaved={() => { showPwdModal = false; }}/>