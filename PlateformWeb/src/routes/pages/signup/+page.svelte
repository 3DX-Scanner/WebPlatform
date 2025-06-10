<script lang="ts">
import emailjs from 'emailjs-com';
let email = '';
let password = '';
let code = '';
let isCodeSent = false;
let message = '';

const sendCode = async () => {

const res = await fetch('/api/signup/send-code', {

method: 'POST',
body: JSON.stringify({ email, password }),
headers: { 'Content-Type': 'application/json' }
});

const data = await res.json();

if (data.success) {

await emailjs.send(
import.meta.env.VITE_EMAILJS_SERVICE_ID,
import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
{
to_email: email,
code: data.code,
},
import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);

isCodeSent = true;
message = 'Code envoyé par email.';
} else {
message = data.error || 'Erreur lors de l’envoi.';
}
};

const verifyCode = async () => {
const res = await fetch('/api/signup/verify-code', {
method: 'POST',
body: JSON.stringify({ email, code }),
headers: { 'Content-Type': 'application/json' }
});
const data = await res.json();
message = data.success ? 'Inscription réussie !' : data.error;
};

</script>



{#if !isCodeSent}
<form on:submit|preventDefault={sendCode}>
<input bind:value={email} type="email" placeholder="Email" />
<input bind:value={password} type="password" placeholder="Mot de passe" />
<button type="submit">Envoyer le code</button>
</form>

{:else}
<form on:submit|preventDefault={verifyCode}>
<input bind:value={code} placeholder="Code reçu par email" />
<button type="submit">Valider le code</button>
</form>
{/if}

<p>{message}</p>

