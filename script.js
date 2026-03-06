const sloganEntries = [
  { html: 'Grand angle sur <span class="accent">vos risques.</span>' },
  { html: 'Du rapport au <span class="accent">rempart.</span>' },
  { html: 'Tranquillité <span class="accent">approuvée.</span>' },
  { html: 'Les surprises, seulement si elles viennent avec du <span class="accent">champagne.</span>' }
];

const gateContent = {
  dora: {
    description: 'Passez de la conformité « papier » à la résilience opérationnelle.',
    accent: '#4d73ef'
  },
  ausecaf: {
    description: 'Votre trésorerie est une cible : auditez vos applis, pas seulement vos process.',
    accent: '#2097b2'
  },
  secedi: {
    description: 'Moins d’angles morts sur vos plateformes EDI bancaires.',
    accent: '#6d56f6'
  },
  diag62030: {
    description: 'Diagnostic 2030 : état des lieux, gaps, roadmap, budget, échéances.',
    accent: '#3a63dd'
  }
};

const stageSlider = document.querySelector('[data-stage-slider]');
const openGateButton = document.querySelector('[data-open-gate]');
const backToLandingButton = document.querySelector('[data-back-to-landing]');
const sloganNode = document.querySelector('[data-slogan]');
const gateTabs = document.querySelectorAll('[data-gate-tab]');
const gateDescription = document.querySelector('[data-gate-description]');
const gateMedia = document.querySelector('[data-gate-media]');

let sloganIndex = 0;

function setStage(stage) {
  if (!stageSlider) return;
  stageSlider.classList.toggle('is-gate', stage === 'gate');
}

function swapSlogan() {
  if (!sloganNode || document.hidden || stageSlider?.classList.contains('is-gate')) return;

  sloganNode.classList.add('is-swapping');

  window.setTimeout(() => {
    sloganIndex = (sloganIndex + 1) % sloganEntries.length;
    sloganNode.innerHTML = sloganEntries[sloganIndex].html;
    sloganNode.classList.remove('is-swapping');
  }, 180);
}

function setGateTab(key) {
  if (!gateDescription || !gateMedia || !gateContent[key]) return;

  gateTabs.forEach((tab) => {
    const isActive = tab.dataset.gateTab === key;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  gateDescription.classList.add('is-swapping');
  gateMedia.classList.add('is-refreshing');

  window.setTimeout(() => {
    gateDescription.textContent = gateContent[key].description;
    gateMedia.style.boxShadow = `0 20px 45px ${gateContent[key].accent}22`;
    gateDescription.classList.remove('is-swapping');
    gateMedia.classList.remove('is-refreshing');
  }, 180);
}

if (openGateButton) {
  openGateButton.addEventListener('click', () => setStage('gate'));
}

if (backToLandingButton) {
  backToLandingButton.addEventListener('click', () => setStage('landing'));
}

gateTabs.forEach((tab) => {
  tab.addEventListener('click', () => setGateTab(tab.dataset.gateTab));
});

if (sloganNode) {
  window.setInterval(swapSlogan, 4200);
}

setGateTab('dora');

function updateStageScale() {
  const designWidth = 1440;
  const designHeight = 920;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scale = Math.min(viewportWidth / designWidth, viewportHeight / designHeight, 1);

  document.documentElement.style.setProperty('--stage-scale', scale.toFixed(4));
}

window.addEventListener('resize', updateStageScale);
updateStageScale();
