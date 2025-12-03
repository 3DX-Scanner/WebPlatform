<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import * as Card from '$lib/components/ui/card';
    import { Mail, Phone, MapPin, Send } from '@lucide/svelte';
    
    let name = $state('');
    let email = $state('');
    let subject = $state('');
    let message = $state('');
    let isSubmitting = $state(false);
    let submitStatus = $state<'idle' | 'success' | 'error'>('idle');
    let errorMessage = $state('');
    
    async function handleSubmit(e: Event) {
        e.preventDefault();
        
        if (!name || !email || !subject || !message) {
            errorMessage = 'Veuillez remplir tous les champs';
            submitStatus = 'error';
            return;
        }
        
        isSubmitting = true;
        submitStatus = 'idle';
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi du message');
            }
            
            submitStatus = 'success';
            name = '';
            email = '';
            subject = '';
            message = '';
            
            setTimeout(() => {
                submitStatus = 'idle';
            }, 5000);
        } catch (error: any) {
            submitStatus = 'error';
            errorMessage = error.message || 'Une erreur est survenue';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="min-h-screen w-full overflow-x-hidden bg-background">
    <section class="relative py-16 md:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                    <span class="hero-gradient-text">Contactez-nous</span>
                </h1>
                <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Une question ? Un projet ? N'hésitez pas à nous contacter, notre équipe vous répondra dans les plus brefs délais.
                </p>
            </div>

            <div class="flex justify-center mt-16">
                <div class="w-full max-w-3xl">
                    <Card.Root class="border-2 shadow-xl">
                        <Card.Header>
                            <Card.Title class="text-2xl">Envoyez-nous un message</Card.Title>
                            <Card.Description>Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.</Card.Description>
                        </Card.Header>
                        <Card.Content>
                            <form onsubmit={handleSubmit} class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-2">
                                        <Label for="name">Nom complet</Label>
                                        <Input 
                                            id="name" 
                                            type="text" 
                                            placeholder="Jean Dupont"
                                            bind:value={name}
                                            required
                                        />
                                    </div>
                                    
                                    <div class="space-y-2">
                                        <Label for="email">Email</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            placeholder="jean.dupont@example.com"
                                            bind:value={email}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div class="space-y-2">
                                    <Label for="subject">Sujet</Label>
                                    <Input 
                                        id="subject" 
                                        type="text" 
                                        placeholder="Demande d'information sur les services"
                                        bind:value={subject}
                                        required
                                    />
                                </div>
                                
                                <div class="space-y-2">
                                    <Label for="message">Message</Label>
                                    <textarea 
                                        id="message"
                                        bind:value={message}
                                        rows="6"
                                        placeholder="Décrivez votre projet ou votre question..."
                                        required
                                        class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    ></textarea>
                                </div>
                                
                                {#if submitStatus === 'success'}
                                    <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                                        ✓ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                                    </div>
                                {/if}
                                
                                {#if submitStatus === 'error'}
                                    <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                                        ✗ {errorMessage}
                                    </div>
                                {/if}
                                
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    class="w-full gap-2"
                                    disabled={isSubmitting}
                                >
                                    {#if isSubmitting}
                                        Envoi en cours...
                                    {:else}
                                        <Send size={20} />
                                        Envoyer le message
                                    {/if}
                                </Button>
                            </form>
                        </Card.Content>
                    </Card.Root>
                </div>
            </div>
        </div>
    </section>
</div>

