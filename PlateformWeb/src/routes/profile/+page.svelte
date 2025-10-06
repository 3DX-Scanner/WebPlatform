<script lang="ts">
    import TextFieldComponent from '$lib/components/TextField/TextFieldComponent.svelte';
    import { goto } from '$app/navigation';
    import ButtonComponent from '$lib/components/Button/ButtonComponent.svelte';

    export let data: {
    user: {
      id: number;
      username: string;
      email: string;
      createdAt: string;
        };
    };

    let selectedSection: 'securite' | 'preferences' | 'modeles' | 'abonnement' = 'securite';
    let language: 'fr' | 'en' = 'fr';
    let theme: 'light' | 'dark' = 'light';
    // Sécurité - changement de mot de passe
    let editingPassword = false;
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';
    let passwordError = '';
    let leftCardEl: HTMLDivElement;
    let rightCardEl: HTMLDivElement;

    function syncHeights() {
        if (!leftCardEl || !rightCardEl) return;
        const h = leftCardEl.offsetHeight;
        const padding = 57;
        const target = Math.max(300, h - padding);
        rightCardEl.style.height = target + 'px';
    }

    $: selectedSection, syncHeights();

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
        // TODO: appeler l'API de changement de mot de passe lorsqu'elle sera prête
        console.log('Change password', { currentPassword, newPassword });
        editingPassword = false;
        resetPasswordForm();
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

<div class="profile-shell">
    <div class="layout">
        <aside class="sidebar">
            <div class="card glass profile" bind:this={leftCardEl}>
                <div class="avatar-xl">{data.user.email.charAt(0).toUpperCase()}</div>
                <div class="name">{data.user.username}</div>
                <div class="email">{data.user.email || 'Connecté via Google'}</div>
                <div class="badge">Membre depuis {new Date(data.user.createdAt).toLocaleDateString('fr-FR')}</div>

                <ul class="side-list" role="tablist">
                    <li class="blue" class:active={selectedSection==='securite'}>
                        <button type="button" role="tab" aria-selected={selectedSection==='securite'} on:click={() => selectedSection='securite'}>
                            <i class="dot"></i><span>Sécurité du compte</span>
                        </button>
                    </li>
                    <li class="green" class:active={selectedSection==='preferences'}>
                        <button type="button" role="tab" aria-selected={selectedSection==='preferences'} on:click={() => selectedSection='preferences'}>
                            <i class="dot"></i><span>Préférences</span>
                        </button>
                    </li>
                    <li class="purple" class:active={selectedSection==='modeles'}>
                        <button type="button" role="tab" aria-selected={selectedSection==='modeles'} on:click={() => selectedSection='modeles'}>
                            <i class="dot"></i><span>Mes modèles</span>
                        </button>
                    </li>
                    <li class="yellow" class:active={selectedSection==='abonnement'}>
                        <button type="button" role="tab" aria-selected={selectedSection==='abonnement'} on:click={() => selectedSection='abonnement'}>
                            <i class="dot"></i><span>Abonnement</span>
                        </button>
                    </li>
                </ul>
                
                <div class="logout-section">
                    <ButtonComponent color="primary" variant="raised" onClick={handleLogout}>
                        Se déconnecter
                    </ButtonComponent>
                </div>
    </div>
        </aside>

        <main class="content">
            <div class="card wrapper" bind:this={rightCardEl}>
            {#if selectedSection==='securite'}
                <section class="section">
                    <h3 class="section-title">Sécurité du compte</h3>
                    <div class="section-content">
                        <div class="password-card">
                            {#if !editingPassword}
                                <div class="inline-field">
                                    <span class="inline-label">Mot de passe</span>
                                    <ButtonComponent color="primary" variant="raised" onClick={() => { editingPassword = true; }}>
                                        Changer le mot de passe
                                    </ButtonComponent>
                                </div>
                            {:else}
                                <div class="edit-password">
                                    <div class="inline-field">
                                        <span class="inline-label">Mot de passe actuel</span>
                                        <TextFieldComponent label="" classe="nolabel" type="password" bind:value={currentPassword} />
                                    </div>
                                    <div class="inline-field">
                                        <span class="inline-label">Nouveau mot de passe</span>
                                        <TextFieldComponent label="" classe="nolabel" type="password" bind:value={newPassword} />
                                    </div>
                                    <div class="inline-field">
                                        <span class="inline-label">Confirmer le mot de passe</span>
                                        <TextFieldComponent label="" classe="nolabel" type="password" bind:value={confirmPassword} />
                                    </div>
                                    {#if passwordError}
                                        <div class="error-inline">{passwordError}</div>
                                    {/if}
                                    <div class="actions-inline">
                                        <ButtonComponent color="primary" variant="raised" onClick={savePassword} disabled={!!passwordError || !currentPassword || !newPassword || !confirmPassword}>
                                            Enregistrer
                                        </ButtonComponent>
                                        <ButtonComponent color="secondary" variant="outlined" onClick={() => { editingPassword = false; resetPasswordForm(); }}>
                                            Annuler
                                        </ButtonComponent>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        <div class="form-grid">
                            <div class="inline-field">
                                <span class="inline-label">Double authentification</span>
                                <input type="text" value="Désactivée" disabled class="auth-input" />
                            </div>
                        </div>
                    </div>
                </section>
            {:else if selectedSection==='preferences'}
                <section class="section">
                    <h3 class="section-title">Préférences</h3>
                    <div class="prefs">
                        <div class="inline-field">
                            <span class="inline-label">Langue</span>
                            <select id="lang-select" bind:value={language}>
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div class="inline-field">
                            <span class="inline-label">Thème</span>
                            <div class="theme-toggle" role="tablist" aria-label="Theme">
                                <button type="button" role="tab" class:active={theme==='light'} on:click={() => theme='light'} aria-selected={theme==='light'}>
                                    <span class="icon">☀️</span> Clair
                                </button>
                                <button type="button" role="tab" class:active={theme==='dark'} on:click={() => theme='dark'} aria-selected={theme==='dark'}>
                                    <span class="icon">🌙</span> Sombre
                                </button>
                    </div>
                </div>
            </div>
                </section>
            {:else if selectedSection==='modeles'}
                <section class="section">
                    <h3 class="section-title">Mes modèles</h3>
                    <div class="empty-state">
                        <p class="empty-message">Vous n'avez aucun modèle pour le moment</p>
                        <p class="muted">Ouvrez la galerie des modèles 3D.</p>
                        <a class="button-outline" href="/models3D">Voir les modèles</a>
                    </div>
                </section>
            {:else}
                <section class="section">
                    <h3 class="section-title">Abonnement</h3>
                    <div class="plans">
                        <div class="plan-card">
                            <h4>Free Plan</h4>
                            <p class="muted">Accès limité aux fonctionnalités.</p>
                            <button type="button" class="plan-btn" disabled>Actuel</button>
                        </div>
                        <div class="plan-card">
                            <h4>Pro</h4>
                            <p class="muted">Limites étendues et plus de confort.</p>
                            <button type="button" class="plan-btn">Passer en Pro</button>
                        </div>
                        <div class="plan-card">
                            <h4>Ultra</h4>
                            <p class="muted">Limites très élevées et accès anticipé.</p>
                            <button type="button" class="plan-btn">Passer en Ultra</button>
                    </div>
                    </div>
                </section>
            {/if}
            </div>
        </main>
        </div>
</div>

<style>
    .profile-shell { background: transparent; padding: 32px 16px; min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; }
    .layout { max-width: 1200px; width: 100%; margin: 0 auto; display: grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start; }

    .card { background: #ffffff; border-radius: 16px; box-shadow: 0 14px 40px rgba(16,24,40,.06); padding: 28px; }
    .wrapper { padding: 28px; overflow: auto; }
    .glass { background: rgba(255,255,255,.9); backdrop-filter: blur(8px); }

    .sidebar .profile { display: grid; place-items: center; gap: 10px; padding: 28px; }
    .avatar-xl { width: 88px; height: 88px; border-radius: 50%; display: grid; place-items: center; background: #374151; color:#fff; font-size: 2rem; font-weight: 700; }
    .name { font-weight: 800; color: #111827; font-size: 1.1rem; }
    .email { color: #6b7280; font-size: 1rem; }
    .badge { margin-top: 6px; background: #e5f6ee; color: #177245; padding: 8px 12px; border-radius: 999px; font-size: .85rem; }

    .side-list { list-style: none; margin: 16px 0 0 0; padding: 0; display: grid; gap: 12px; width: 100%; }
    .side-list li { display: flex; align-items: stretch; border-radius: 12px; width: 100%; overflow: hidden; }
    .side-list li > button { display:flex; align-items:center; gap:12px; padding:14px 14px; background:#f8fafc; border:none; width:100%; text-align:left; cursor:pointer; transition: background .15s; font-size: 1rem; color:#1f2937; font-weight:600; }
    .side-list li.active > button { background: #eef2ff; }
    .side-list li .dot { display:none; }
    .side-list li span { color:#1f2937; font-weight: 600; }

    .logout-section { margin-top: 20px; display: flex; justify-content: center; }

    /* cleaned decorative styles */
    /* .plain removed */
    .section { margin-bottom: 16px; background: transparent; }
    /* Force removal of any global gray background applied to <section> */
    .wrapper section { background: transparent !important; box-shadow: none !important; border: none !important; padding: 0; border-radius: 0; }
    .section-title { margin: 0 0 32px 0; color: #111827; text-align: center; font-size: 2rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    /* inputs/labels gérés par TextFieldComponent */
    @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } }
    
    .prefs { display: grid; gap: 16px; }
    .prefs select { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; background: #fff; color: #111827; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 16px; min-height: 200px; }
    .empty-message { font-size: 1.1rem; font-weight: 600; color: #6b7280; margin: 0; }
    .theme-toggle { display: inline-flex; gap: 8px; background: #f3f4f6; padding: 6px; border-radius: 10px; }
    .theme-toggle button { border: none; background: transparent; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #1f2937; }
    .theme-toggle button.active { background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .theme-toggle .icon { margin-right: 6px; }

    .section-content { display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .password-card { display: grid; gap: 12px; width: 100%; max-width: 500px; }
    .form-grid { width: 100%; max-width: 500px; }
    /* cleaned old button helpers */
    .actions-inline { display: flex; gap: 10px; align-items: center; }
    .error-inline { color: #dc2626; font-weight: 600; }
    .inline-field { display: grid; grid-template-columns: 220px 1fr; gap: 12px; align-items: center; margin-bottom: 10px; }
    .inline-field :global(button) { width: fit-content; }
    .inline-label { font-weight: 700; color: #374151; }
    .auth-input { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; background: #f9fafb; color: #6b7280; font-size: 1rem; }
    .edit-password { display: grid; gap: 12px; }
    :global(.nolabel) :global(.label) { display: none; }

    .plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .plan-card { background: #111827; color: #e5e7eb; border-radius: 12px; padding: 16px; display: grid; gap: 10px; }
    .plan-card h4 { color: #ffffff; margin: 0; }
    .plan-btn { align-self: start; background: #60a5fa; color: #0b1220; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .plan-btn[disabled] { background: #9ca3af; color: #111827; cursor: default; }
    @media (max-width: 900px) { .plans { grid-template-columns: 1fr; } }


    @media (max-width: 900px) {
        .layout { grid-template-columns: 1fr; }
    }
</style>