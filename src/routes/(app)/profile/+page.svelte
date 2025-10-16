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
            alert('Mot de passe modifié avec succès !');
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
</script>

<div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4">
    <div class="w-full max-w-6xl mx-auto grid gap-5 grid-cols-[340px_1fr] items-stretch">
        <aside>
            <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-7 grid place-items-center gap-2 h-full" bind:this={leftCardEl}>
                <div class="w-24 h-24 rounded-full grid place-items-center bg-gray-700 text-white text-2xl font-bold">{data.user.email.charAt(0).toUpperCase()}</div>
                <div class="font-extrabold text-gray-900 text-lg">{data.user.username}</div>
                <div class="text-gray-500 text-base">{data.user.email || 'Connecté via Google'}</div>
                <div class="mt-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full text-sm">Membre depuis {new Date(data.user.createdAt).toLocaleDateString('fr-FR')}</div>

                <ul class="w-full grid gap-3 mt-4" role="tablist">
                    <li>
                        <button type="button" role="tab" class:bg-indigo-50={selectedSection==='securite'} class="w-full text-left rounded-xl bg-slate-50 hover:bg-slate-100 px-4 py-3 font-semibold text-gray-800" aria-selected={selectedSection==='securite'} onclick={() => selectedSection='securite'}>
                            Sécurité du compte
                        </button>
                    </li>
                    <li>
                        <button type="button" role="tab" class:bg-indigo-50={selectedSection==='preferences'} class="w-full text-left rounded-xl bg-slate-50 hover:bg-slate-100 px-4 py-3 font-semibold text-gray-800" aria-selected={selectedSection==='preferences'} onclick={() => selectedSection='preferences'}>
                            Préférences
                        </button>
                    </li>
                    <li>
                        <button type="button" role="tab" class:bg-indigo-50={selectedSection==='modeles'} class="w-full text-left rounded-xl bg-slate-50 hover:bg-slate-100 px-4 py-3 font-semibold text-gray-800" aria-selected={selectedSection==='modeles'} onclick={() => selectedSection='modeles'}>
                            Mes modèles
                        </button>
                    </li>
                    <li>
                        <button type="button" role="tab" class:bg-indigo-50={selectedSection==='abonnement'} class="w-full text-left rounded-xl bg-slate-50 hover:bg-slate-100 px-4 py-3 font-semibold text-gray-800" aria-selected={selectedSection==='abonnement'} onclick={() => selectedSection='abonnement'}>
                            Abonnement
                        </button>
                    </li>
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
                            {#if !data.user.hasPassword}
                                <!-- Utilisateur connecté via Google OAuth -->
                                <div class="flex gap-4 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-xl p-5 text-white items-start">
                                    <div class="text-2xl">🔒</div>
                                    <div class="flex flex-col gap-2">
                                        <h4 class="m-0 text-white text-lg font-bold">Authentification Google</h4>
                                        <p class="m-0 leading-relaxed">Votre compte est connecté via Google. La gestion du mot de passe se fait directement depuis votre compte Google.</p>
                                        <p class="m-0 text-white/85 italic">Vous n'avez pas besoin de définir un mot de passe pour ce compte.</p>
                                    </div>
                                </div>
                            {:else if !editingPassword}
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
                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                            <span class="font-bold text-gray-700">Langue</span>
                            <select id="lang-select" bind:value={language}>
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-[220px_1fr] gap-3 items-center mb-2">
                            <span class="font-bold text-gray-700">Thème</span>
                            <div class="inline-flex gap-2 bg-gray-100 p-1.5 rounded-lg" role="tablist" aria-label="Theme">
                                <button type="button" role="tab" class:bg-white={theme==='light'} class="px-3 py-2 rounded-md font-semibold text-gray-800" onclick={() => theme='light'} aria-selected={theme==='light'}>
                                    <span class="mr-1">☀️</span> Clair
                                </button>
                                <button type="button" role="tab" class:bg-white={theme==='dark'} class="px-3 py-2 rounded-md font-semibold text-gray-800" onclick={() => theme='dark'} aria-selected={theme==='dark'}>
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
                        <a class="border rounded-md px-3 py-2 text-blue-600 border-blue-300" href="/models3D">Voir les modèles</a>
                    </div>
                </section>
            {:else}
                <section class="mb-4">
                    <h3 class="m-0 mb-8 text-gray-900 text-center text-2xl">Abonnement</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-gray-900 text-gray-200 rounded-xl p-4 grid gap-2">
                            <h4>Free Plan</h4>
                            <p class="text-gray-400">Accès limité aux fonctionnalités.</p>
                            <button type="button" class="bg-blue-400 text-gray-900 px-3 py-2 rounded-md font-semibold" disabled>Actuel</button>
                        </div>
                        <div class="bg-gray-900 text-gray-200 rounded-xl p-4 grid gap-2">
                            <h4>Pro</h4>
                            <p class="text-gray-400">Limites étendues et plus de confort.</p>
                            <button type="button" class="bg-blue-400 text-gray-900 px-3 py-2 rounded-md font-semibold">Passer en Pro</button>
                        </div>
                        <div class="bg-gray-900 text-gray-200 rounded-xl p-4 grid gap-2">
                            <h4>Ultra</h4>
                            <p class="text-gray-400">Limites très élevées et accès anticipé.</p>
                            <button type="button" class="bg-blue-400 text-gray-900 px-3 py-2 rounded-md font-semibold">Passer en Ultra</button>
                    </div>
                    </div>
                </section>
            {/if}
            </div>
        </main>
        </div>
</div>

<ChangePasswordModal isOpen={showPwdModal} onclose={() => showPwdModal = false} onsaved={() => { showPwdModal = false; }} />

<style></style>