<script lang="ts">
  import Button from '$lib/components/Button/ButtonComponent.svelte';
  import Header from '$lib/components/Header/HeaderComponent.svelte';

  // TODO: Ajouter la logique de vérification de l'authentification
  let isAuthenticated = false;

  function handleLogout() {
    // TODO: Implémenter la logique de déconnexion
    console.log('Déconnexion...');
  }
</script>

<Header {isAuthenticated} />

<div class="container">
  <main>
    <section class="hero">
      <div class="hero-content">
        <h1>Scanner 3D Professionnel</h1>
        <p class="subtitle">Transformez vos objets physiques en modèles 3D de haute précision</p>
        {#if !isAuthenticated}
          <div class="cta-buttons">
            <a href="/signup" class="cta-button primary">Commencer la numérisation</a>
            <a href="#features" class="cta-button secondary">Découvrir les fonctionnalités</a>
          </div>
        {/if}
      </div>
    </section>

    <section id="features" class="features">
      <h2>Fonctionnalités principales</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">📷</div>
          <h3>Numérisation précise</h3>
          <p>Capturez vos objets avec une précision millimétrique grâce à notre technologie avancée</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>Reconstruction 3D</h3>
          <p>Transformez vos captures en modèles 3D détaillés et optimisés</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>Export multiple</h3>
          <p>Exportez vos modèles dans différents formats (STL, OBJ, PLY) pour une compatibilité maximale</p>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <h2>Comment ça marche ?</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Capturez</h3>
          <p>Prenez plusieurs photos de votre objet sous différents angles</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>Traitez</h3>
          <p>Notre algorithme analyse et traite vos images</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Visualisez</h3>
          <p>Obtenez votre modèle 3D prêt à l'emploi</p>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-content">
      <div class="footer-section">
        <h4>Scanner3D</h4>
        <p>Votre solution professionnelle de numérisation 3D</p>
      </div>
      <div class="footer-section">
        <h4>Liens utiles</h4>
        <a href="/about">À propos</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Politique de confidentialité</a>
      </div>
      <div class="footer-section">
        <h4>Contact</h4>
        <p>Email: contact@scanner3d.com</p>
        <p>Tél: +33 1 23 45 67 89</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 Scanner3D. Tous droits réservés.</p>
    </div>
  </footer>
</div>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-top: 60px; /* Ajout d'un padding pour compenser le header fixe */
  }

  header {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4CAF50;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .nav-link {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #4CAF50;
  }

  .nav-link.signup {
    background-color: #4CAF50;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .nav-link.signup:hover {
    background-color: #45a049;
  }

  .logout-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.2s;
  }

  .logout-btn:hover {
    color: #4CAF50;
  }

  main {
    flex: 1;
    padding: 2rem;
    margin-top: 4rem;
  }

  .hero {
    text-align: center;
    padding: 6rem 2rem;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: white;
    border-radius: 8px;
    margin-bottom: 4rem;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(45deg, #4CAF50, #45a049);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 1.5rem;
    color: #e0e0e0;
    margin-bottom: 2.5rem;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .cta-button {
    padding: 1rem 2rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    transition: transform 0.2s, background-color 0.2s;
  }

  .cta-button:hover {
    transform: translateY(-2px);
  }

  .cta-button.primary {
    background-color: #4CAF50;
    color: white;
  }

  .cta-button.primary:hover {
    background-color: #45a049;
  }

  .cta-button.secondary {
    background-color: transparent;
    color: white;
    border: 2px solid #4CAF50;
  }

  .cta-button.secondary:hover {
    background-color: rgba(76, 175, 80, 0.1);
  }

  .features {
    max-width: 1200px;
    margin: 0 auto 4rem;
  }

  .features h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: #333;
    font-size: 2.5rem;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .feature-card p {
    color: #666;
    line-height: 1.6;
  }

  .how-it-works {
    background-color: #f8f9fa;
    padding: 4rem 2rem;
    border-radius: 8px;
    margin-bottom: 4rem;
  }

  .how-it-works h2 {
    text-align: center;
    margin-bottom: 3rem;
    color: #333;
    font-size: 2.5rem;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .step {
    text-align: center;
    padding: 2rem;
  }

  .step-number {
    width: 50px;
    height: 50px;
    background: #4CAF50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .step h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .step p {
    color: #666;
    line-height: 1.6;
  }

  footer {
    background-color: #1a1a1a;
    color: white;
    padding: 4rem 2rem 2rem;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .footer-section h4 {
    color: #4CAF50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }

  .footer-section a {
    color: #e0e0e0;
    text-decoration: none;
    display: block;
    margin-bottom: 0.5rem;
    transition: color 0.2s;
  }

  .footer-section a:hover {
    color: #4CAF50;
  }

  .footer-section p {
    color: #e0e0e0;
    margin-bottom: 0.5rem;
  }

  .footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid #333;
    color: #666;
  }

  @media (max-width: 768px) {
    header {
      padding: 1rem;
    }

    .nav-links {
      gap: 1rem;
    }

    .hero {
      padding: 4rem 1rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    .subtitle {
      font-size: 1.2rem;
    }

    .cta-buttons {
      flex-direction: column;
    }

    .feature-grid {
      grid-template-columns: 1fr;
    }

    .steps {
      grid-template-columns: 1fr;
    }
  }
</style>
