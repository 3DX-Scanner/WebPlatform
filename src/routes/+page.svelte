<script>
  import { onMount } from 'svelte';
</script>

<svelte:head>
  <title>Scanner 3D - Numérisez vos objets en 3D</title>
</svelte:head>

<main class="container">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>Scanner 3D</h1>
      <p class="subtitle">Transformez vos objets physiques en modèles 3D numériques</p>
      <div class="cta-buttons">
        <button class="primary-btn">Commencer la numérisation</button>
        <button class="secondary-btn">En savoir plus</button>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features">
    <h2>Fonctionnalités principales</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📷</div>
        <h3>Numérisation précise</h3>
        <p>Capturez vos objets avec une précision millimétrique</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <h3>Reconstruction 3D</h3>
        <p>Transformez vos captures en modèles 3D détaillés</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💾</div>
        <h3>Export multiple</h3>
        <p>Exportez vos modèles dans différents formats (STL, OBJ, PLY)</p>
      </div>
    </div>
  </section>

  <!-- How it works Section -->
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

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .hero {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: white;
    border-radius: 1rem;
    margin: 2rem 0;
  }

  .hero-content {
    padding: 2rem;
  }

  h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, #00ff87, #60efff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: #e0e0e0;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  button {
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.2s;
  }

  button:hover {
    transform: translateY(-2px);
  }

  .primary-btn {
    background: linear-gradient(45deg, #00ff87, #60efff);
    border: none;
    color: #1a1a1a;
  }

  .secondary-btn {
    background: transparent;
    border: 2px solid #00ff87;
    color: #00ff87;
  }

  .features {
    padding: 4rem 0;
    text-align: center;
  }

  .features h2 {
    font-size: 2.5rem;
    margin-bottom: 3rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    padding: 2rem;
    background: #f5f5f5;
    border-radius: 1rem;
    transition: transform 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .how-it-works {
    padding: 4rem 0;
    text-align: center;
    background: #f5f5f5;
    border-radius: 1rem;
    margin: 2rem 0;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    padding: 2rem;
  }

  .step {
    padding: 2rem;
  }

  .step-number {
    width: 40px;
    height: 40px;
    background: linear-gradient(45deg, #00ff87, #60efff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: #1a1a1a;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 3rem;
    }

    .cta-buttons {
      flex-direction: column;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
