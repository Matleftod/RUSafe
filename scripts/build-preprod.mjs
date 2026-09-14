import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const outputDirectory = join(projectRoot, "dist");
const deploymentMode = process.env.DEPLOYMENT_MODE || (process.env.SITE_INDEXABLE === "true" ? "production" : "preview");
const deploymentModes = new Set(["preview", "staging", "production"]);
const explicitIndexable = process.env.SITE_INDEXABLE;

if (!deploymentModes.has(deploymentMode)) {
  throw new Error("DEPLOYMENT_MODE doit être preview, staging ou production.");
}

const isIndexableBuild = deploymentMode === "production";
const contactMode = process.env.CONTACT_MODE || (deploymentMode === "preview" ? "demo" : "live");
const expectedContactMode = deploymentMode === "preview" ? "demo" : "live";

if (explicitIndexable !== undefined && !["true", "false"].includes(explicitIndexable)) {
  throw new Error("SITE_INDEXABLE doit être true ou false lorsqu’il est défini.");
}
if (explicitIndexable !== undefined && (explicitIndexable === "true") !== isIndexableBuild) {
  throw new Error("SITE_INDEXABLE est incompatible avec DEPLOYMENT_MODE.");
}

if (!["demo", "live"].includes(contactMode)) {
  throw new Error("CONTACT_MODE doit être demo ou live.");
}

if (contactMode !== expectedContactMode) {
  throw new Error(`CONTACT_MODE=${contactMode} est incompatible avec DEPLOYMENT_MODE=${deploymentMode}.`);
}

const requiresPublicSiteUrl = deploymentMode !== "preview";
let publicSiteUrl = "";
let publicBasePath = "";

if (requiresPublicSiteUrl) {
  try {
    const parsedUrl = new URL(process.env.PUBLIC_SITE_URL || "");
    if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) throw new Error();
    publicSiteUrl = parsedUrl.toString().replace(/\/$/, "");
    publicBasePath = parsedUrl.pathname.replace(/\/$/, "");
  } catch {
    throw new Error("PUBLIC_SITE_URL doit être une URL HTTPS valide, sans identifiants, paramètres ni fragment.");
  }
}

const pageFiles = [
  "landing.html", "accueil.html", "approche.html", "expertise.html", "solutions.html",
  "partenaires.html", "formation.html", "references.html", "contact.html",
  "mentions-legales.html", "politique-confidentialite.html"
];

const pageMetadata = {
  "landing.html": {
    fr: { title: "R’U SAFE — Conseil en conformité et résilience", description: "Découvrez R’U SAFE, cabinet de conseil en conformité réglementaire, cybersécurité, résilience opérationnelle et gouvernance de l’IA." },
    en: { title: "R’U SAFE — Compliance and resilience consulting", description: "Discover R’U SAFE, a consultancy specialising in regulatory compliance, cybersecurity, operational resilience and AI governance." }
  },
  "accueil.html": {
    fr: { title: "R’U SAFE — Conformité, résilience et gouvernance IA", description: "R’U SAFE transforme les exigences réglementaires, cyber et IA en dispositifs concrets, pilotables et durables." },
    en: { title: "R’U SAFE — Compliance, resilience and AI governance", description: "R’U SAFE turns regulatory, cyber and AI requirements into concrete, manageable and durable operating frameworks." }
  },
  "approche.html": { fr: { title: "Notre approche — R’U SAFE", description: "Une méthode structurée pour diagnostiquer, remédier, automatiser et piloter durablement la conformité et la résilience." }, en: { title: "Our approach — R’U SAFE", description: "A structured approach to assess, remediate, automate and sustainably manage compliance and resilience." } },
  "expertise.html": { fr: { title: "Expertise — R’U SAFE", description: "Conformité réglementaire, résilience opérationnelle, TPRM, cybersécurité, gouvernance IA et automatisation des contrôles." }, en: { title: "Expertise — R’U SAFE", description: "Regulatory compliance, operational resilience, TPRM, cybersecurity, AI governance and control automation." } },
  "solutions.html": { fr: { title: "Solutions — R’U SAFE", description: "Resilient Advisor, AUSECAF, SECEDI, D&IM et Compliance Accelerator : des solutions issues du terrain." }, en: { title: "Solutions — R’U SAFE", description: "Resilient Advisor, AUSECAF, SECEDI, D&IM and Compliance Accelerator: solutions built from operational needs." } },
  "partenaires.html": { fr: { title: "Partenaires — R’U SAFE", description: "Des modèles de collaboration clairs pour cabinets, intégrateurs, éditeurs, organismes de formation et institutions." }, en: { title: "Partners — R’U SAFE", description: "Clear collaboration models for consultancies, systems integrators, software vendors, training providers and institutions." } },
  "formation.html": { fr: { title: "Formation — R’U SAFE", description: "Formations opérationnelles en IA, conformité, cyber, résilience et réglementations pour décideurs et équipes métiers." }, en: { title: "Training — R’U SAFE", description: "Practical training in AI, compliance, cybersecurity, resilience and regulation for decision-makers and business teams." } },
  "references.html": { fr: { title: "Références — R’U SAFE", description: "Retour d’expérience : sécurisation et mise en conformité d’une plateforme d’échanges financiers critique." }, en: { title: "Case studies — R’U SAFE", description: "Case study: securing and bringing a critical financial exchange platform into compliance." } },
  "contact.html": { fr: { title: "Contact — R’U SAFE", description: "Présentez votre besoin à R’U SAFE et cadrez une intervention adaptée à vos priorités et à votre échéance." }, en: { title: "Contact — R’U SAFE", description: "Tell R’U SAFE about your needs and scope an engagement tailored to your priorities and timeline." } },
  "mentions-legales.html": { fr: { title: "Mentions légales — R’U SAFE", description: "Mentions légales du site R’U SAFE." }, en: { title: "Legal notice — R’U SAFE", description: "Legal notice for the R’U SAFE website." } },
  "politique-confidentialite.html": { fr: { title: "Politique de confidentialité — R’U SAFE", description: "Politique de confidentialité du site R’U SAFE." }, en: { title: "Privacy policy — R’U SAFE", description: "Privacy policy for the R’U SAFE website." } }
};

const sharedFiles = [
  "assets/flags/fr.svg", "assets/flags/en.svg",
  "design-system.css", "landing.css", "site.css", "script.js", "site.js",
  "assets/logo.png", "assets/favicon.png",
  "assets/fonts/poppins-400-latin.woff2", "assets/fonts/poppins-500-latin.woff2",
  "assets/fonts/poppins-600-latin.woff2", "assets/fonts/poppins-700-latin.woff2", "assets/fonts/OFL.txt",
  "assets/logo-80.webp", "assets/logo-160.webp", "assets/logo-245.webp",
  "assets/posters/DORA.webp", "assets/posters/AUSECAF.webp", "assets/posters/SECEDI.webp", "assets/posters/DIAG6-2030.webp",
  "assets/DORA.web.mp4", "assets/AUSECAF.web.mp4", "assets/SECEDI.web.mp4", "assets/DIAG6.web.mp4",
  "assets/avatars/aurelien.webp", "assets/avatars/gilles.webp",
  "assets/avatars/mauro.webp", "assets/avatars/mickael.webp", "assets/avatars/parham.webp",
  "assets/avatars/anas.webp", "assets/avatars/azad.webp", "assets/avatars/celine.webp", "assets/avatars/clement-r.webp", "assets/avatars/edmond.webp",
  "assets/avatars/eric-g.webp", "assets/avatars/francois.webp", "assets/avatars/mehdi.webp", "assets/avatars/pascal.webp",
  "assets/avatars/penelope.webp", "assets/avatars/prasanthi.webp", "assets/avatars/samy.webp", "assets/avatars/serge.webp", "assets/avatars/venkata.webp",
  "assets/background/Vector1.svg", "assets/background/Vector2.svg", "assets/background/Vector3.svg", "assets/background/Vector4.svg",
  "assets/mockups/handphoneLeft.webp", "assets/mockups/handphoneright.webp",
  "assets/mockups/laptop.webp", "assets/mockups/moniteur.webp"
];

const locales = {
  fr: { flag: "🇫🇷", currentLabel: "Français", switchLabel: "Passer en français" },
  en: { flag: "🇬🇧", currentLabel: "English", switchLabel: "Switch to English" }
};

function resolveInsideProject(relativePath) {
  const absolutePath = resolve(projectRoot, relativePath);
  const pathFromRoot = relative(projectRoot, absolutePath);

  if (pathFromRoot.startsWith(`..${sep}`) || pathFromRoot === "..") {
    throw new Error(`Chemin hors projet refusé : ${relativePath}`);
  }

  return absolutePath;
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function validateManifest() {
  const duplicates = sharedFiles.filter((file, index) => sharedFiles.indexOf(file) !== index);
  const forbiddenPublicPaths = sharedFiles.filter((file) => /(?:^|\/)(?:private-config|config|assets\/videos)(?:\/|$)|(?:^|\/)\.?env(?:\.|$)/i.test(file));

  if (duplicates.length > 0) {
    throw new Error(`Fichiers dupliqués dans le manifeste : ${duplicates.join(", ")}`);
  }
  if (forbiddenPublicPaths.length > 0) {
    throw new Error(`Fichiers privés interdits dans le paquet public : ${forbiddenPublicPaths.join(", ")}`);
  }

  await Promise.all([...sharedFiles, ...pageFiles].map(async (relativePath) => {
    const file = await stat(resolveInsideProject(relativePath));
    if (!file.isFile()) throw new Error(`Le fichier attendu est introuvable : ${relativePath}`);
  }));
}

async function validateTranslations() {
  const missingEnglishPages = [];

  for (const pageFile of pageFiles) {
    const translationPath = resolveInsideProject(join("locales", "en", pageFile));
    if (!(await fileExists(translationPath))) missingEnglishPages.push(pageFile);
  }

  if (isIndexableBuild && missingEnglishPages.length > 0) {
    throw new Error(`La production exige toutes les traductions EN : ${missingEnglishPages.join(", ")}`);
  }
}

function isExternalReference(reference) {
  return /^(?:[a-z]+:|\/\/|#)/i.test(reference);
}

function collectLocalReferences(relativePath, content) {
  const references = [];
  const simpleAttributePattern = /\b(?:href|src|poster)=["']([^"']+)["']/gi;
  const srcsetPattern = /\bsrcset=["']([^"']+)["']/gi;
  const cssUrlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;

  for (const match of content.matchAll(simpleAttributePattern)) references.push(match[1]);
  for (const match of content.matchAll(srcsetPattern)) {
    match[1].split(",").forEach((candidate) => references.push(candidate.trim().split(/\s+/)[0]));
  }
  if (relativePath.endsWith(".css")) {
    for (const match of content.matchAll(cssUrlPattern)) references.push(match[1]);
  }

  return references.filter((reference) => reference && !isExternalReference(reference));
}

function createLanguageSwitcher(pageFile, activeLocale, isLanding) {
  const groupLabel = activeLocale === "en" ? "Language selector" : "Sélecteur de langue";
  const currentLanguageSuffix = activeLocale === "en" ? "current language" : "langue actuelle";
  const controls = Object.entries(locales).map(([locale, config]) => {
    const flag = `<img class="language-switcher__flag" src="../assets/flags/${locale}.svg" alt="" width="22" height="15" aria-hidden="true">`;
    const text = `<span class="sr-only">${config.currentLabel}</span>`;

    if (locale === activeLocale) {
      return `<strong class="language-switcher__option" lang="${locale}" aria-current="true" aria-label="${config.currentLabel} — ${currentLanguageSuffix}">${flag}${text}</strong>`;
    }

    return `<a class="language-switcher__option" href="../${locale}/${pageFile}" lang="${locale}" hreflang="${locale}" aria-label="${config.switchLabel}">${flag}${text}</a>`;
  }).join('');

  return `<span class="language-switcher${isLanding ? " language-switcher--landing" : ""}" role="group" aria-label="${groupLabel}">${controls}</span>`;
}

function absoluteUrl(locale, pageFile) {
  return `${publicSiteUrl}/${locale}/${pageFile}`;
}

function createSeoTags(pageFile, locale, isFallback) {
  const metadata = pageMetadata[pageFile][locale];
  const title = metadata.title.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const description = metadata.description.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const robots = isFallback ? "noindex, nofollow" : (isIndexableBuild ? "index, follow" : "noindex, nofollow");
  const alternateLinks = Object.keys(locales)
    .map((alternateLocale) => `  <link rel="alternate" hreflang="${alternateLocale}" href="${isIndexableBuild ? absoluteUrl(alternateLocale, pageFile) : `../${alternateLocale}/${pageFile}`}">`)
    .join("\n");
  const xDefault = isIndexableBuild ? absoluteUrl("fr", pageFile) : `../fr/${pageFile}`;
  const socialTags = isIndexableBuild ? `
  <link rel="canonical" href="${absoluteUrl(locale, pageFile)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="R’U SAFE">
  <meta property="og:locale" content="${locale === "fr" ? "fr_FR" : "en_GB"}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${absoluteUrl(locale, pageFile)}">
  <meta property="og:image" content="${publicSiteUrl}/assets/logo.png">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">` : "";
  return `  <meta name="description" content="${description}">
  <meta name="robots" content="${robots}">
${alternateLinks}
  <link rel="alternate" hreflang="x-default" href="${xDefault}">${socialTags}`;
}

function createFooterLinks(locale) {
  const labels = locale === "en"
    ? { aria: "Useful links", legal: "Legal notice", privacy: "Privacy policy", contact: "Contact" }
    : { aria: "Liens utiles", legal: "Mentions légales", privacy: "Politique de confidentialité", contact: "Contact" };
  return `<nav class="footer-links" aria-label="${labels.aria}"><a href="mentions-legales.html">${labels.legal}</a><a href="politique-confidentialite.html">${labels.privacy}</a><a href="contact.html">${labels.contact}</a></nav>`;
}

function localizeHtml(source, pageFile, locale, isFallback) {
  const isLanding = pageFile === "landing.html";
  const notice = locale === "en" && isFallback
    ? '<aside class="translation-notice" role="note"><strong>English version in preparation.</strong> French content is displayed temporarily.</aside>'
    : "";
  const switcher = createLanguageSwitcher(pageFile, locale, isLanding);

  let html = source
    .replace(/<html\s+lang=["'][^"']+["']/, `<html lang="${locale}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${pageMetadata[pageFile][locale].title}</title>`)
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/i, "")
    .replaceAll("assets/", "../assets/")
    .replace(/((?:href|src)=["'])(design-system\.css|landing\.css|site\.css|script\.js|site\.js)(["'])/g, "$1../$2$3")
    .replace(/action=["']api\/contact\.php["']/, 'action="../api/contact.php"')
    .replace("</head>", `${createSeoTags(pageFile, locale, isFallback)}\n</head>`)
    .replace(/<body([^>]*)>/, '<body$1 data-asset-root="../assets">');

  if (pageFile === "contact.html") html = html.replace('data-contact-mode="live"', `data-contact-mode="${contactMode}"`);
  html = html.replace(/(<footer>\s*<div class="container footer-grid">)/, `$1\n      ${createFooterLinks(locale)}`);

  if (notice) html = html.replace(/(<body[^>]*>)/, `$1\n  ${notice}`);
  if (isLanding) html = html.replace(/(<main\b[^>]*>)/, `$1\n    ${switcher}`);
  else html = html.replace("</nav>", `  ${switcher}\n      </nav>`);

  return html;
}

function createRedirectPage(target, label) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0; url=${target}">
  <meta name="robots" content="${isIndexableBuild ? "noindex, follow" : "noindex, nofollow"}">
  <title>R’U SAFE</title>
  <link rel="icon" href="assets/favicon.png" type="image/png">
</head>
<body>
  <p><a href="${target}">${label}</a></p>
</body>
</html>
`;
}

function createRobots() {
  return isIndexableBuild
    ? `User-agent: *\nAllow: /\nSitemap: ${publicSiteUrl}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
}

function createSitemap() {
  const urls = Object.keys(locales).flatMap((locale) => pageFiles.map((pageFile) => `  <url><loc>${absoluteUrl(locale, pageFile)}</loc></url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function publicPath(path) {
  return `${publicBasePath}/${path}`.replace(/\/+/g, "/");
}

function createNotFoundPage() {
  const homePath = publicPath("fr/accueil.html");
  const contactPath = publicPath("fr/contact.html");
  const englishHomePath = publicPath("en/accueil.html");
  const englishContactPath = publicPath("en/contact.html");
  const logoPath = publicPath("assets/logo.png");
  const faviconPath = publicPath("assets/favicon.png");
  const vectorPath = publicPath("assets/background/Vector1.svg");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Page introuvable — R’U SAFE</title>
  <link rel="icon" href="${faviconPath}" type="image/png">
  <link rel="stylesheet" href="${publicPath("design-system.css")}">
  <style>
    .not-found-page { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; margin: 0; overflow: hidden; background: var(--color-page); color: var(--color-text); font-family: var(--font-family-base); line-height: 1.5; -webkit-font-smoothing: antialiased; }
    .not-found-page *, .not-found-page *::before, .not-found-page *::after { box-sizing: border-box; }
    .not-found-page a { color: inherit; text-decoration: none; }
    .not-found-page .container { width: min(1300px, calc(100% - 40px)); margin: 0 auto; }
    .not-found-page .brand { display: inline-flex; align-items: center; }
    .not-found-page .brand-logo { display: block; width: 76px; height: auto; filter: drop-shadow(0 8px 12px var(--color-accent-shadow)); }
    .not-found-page .button { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; gap: 9px; padding: 12px 18px; border: 1px solid transparent; border-radius: var(--radius-pill); font-weight: var(--font-weight-semibold); cursor: pointer; transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) ease, background-color var(--duration-base) ease; }
    .not-found-page .button.primary { background: var(--color-text); color: var(--color-page); box-shadow: var(--shadow-soft); }
    .not-found-page .button:hover { transform: translateY(-2px); }
    .not-found-page .button.primary:hover { box-shadow: var(--shadow-accent-hover); }
    .not-found-page a:focus-visible { outline: 3px solid var(--color-brand-3); outline-offset: 4px; }
    .not-found-page .skip-link { position: fixed; top: 10px; left: 10px; z-index: 10; padding: 12px 16px; border-radius: var(--radius-pill); background: var(--color-text); color: var(--color-page); font-weight: var(--font-weight-semibold); transform: translateY(calc(-100% - 20px)); transition: transform var(--duration-fast) var(--ease-out); }
    .not-found-page .skip-link:focus { transform: translateY(0); }
    .not-found-header { padding: 24px 0; }
    .not-found-header .container { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .not-found-header__label { margin: 0; color: var(--color-text-muted); font-size: .8rem; font-weight: var(--font-weight-semibold); letter-spacing: .08em; text-transform: uppercase; }
    .not-found-main { position: relative; display: grid; align-items: center; padding: clamp(30px, 7vw, 92px) 0; isolation: isolate; }
    .not-found-main::before { content: ""; position: absolute; z-index: -1; width: min(74vw, 900px); aspect-ratio: 1; right: -28vw; bottom: -44vw; background: url("${vectorPath}") center / contain no-repeat; opacity: .19; transform: rotate(26deg); pointer-events: none; }
    .not-found-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, .42fr); align-items: end; gap: clamp(36px, 8vw, 132px); }
    .not-found-copy { max-width: 760px; }
    .not-found-code { display: block; margin-bottom: 14px; color: var(--color-brand-1); font-size: clamp(5rem, 15vw, 12rem); font-weight: var(--font-weight-bold); letter-spacing: -.11em; line-height: .72; }
    .not-found-copy h1 { max-width: 650px; margin: 0; color: var(--color-text); font-size: clamp(2.5rem, 5.7vw, 5.5rem); line-height: .98; letter-spacing: -.06em; }
    .not-found-copy p { max-width: 58ch; margin: 28px 0 0; color: var(--color-text-muted); font-size: clamp(1rem, 1.45vw, 1.2rem); line-height: 1.65; }
    .not-found-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
    .not-found-actions .button--secondary { border-color: var(--color-border-accent-soft); background: transparent; color: var(--color-text); }
    .not-found-actions .button--secondary:hover { background: var(--color-accent-soft); box-shadow: none; }
    .not-found-aside { display: grid; gap: 18px; padding: clamp(22px, 3vw, 32px); border: 1px solid var(--color-border-accent-soft); border-radius: var(--radius-card-lg); background: var(--color-surface-glass-stronger); box-shadow: var(--shadow-soft); }
    .not-found-aside__mark { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; background: var(--color-accent-soft); color: var(--color-brand-3); font-weight: var(--font-weight-bold); }
    .not-found-aside h2 { margin: 0; color: var(--color-text); font-size: 1.15rem; line-height: 1.28; }
    .not-found-aside p { margin: 0; color: var(--color-text-muted); font-size: .95rem; line-height: 1.6; }
    .not-found-footer { padding: 24px 0 32px; }
    .not-found-footer .container { display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: center; justify-content: space-between; color: var(--color-text-muted); font-size: .82rem; }
    .not-found-footer a { color: var(--color-brand-1); font-weight: var(--font-weight-semibold); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--color-brand-1) 38%, transparent); text-underline-offset: 3px; }
    @media (max-width: 760px) { .not-found-page .container { width: min(100% - 32px, 1300px); } .not-found-header { padding: 16px 0; } .not-found-header .brand-logo { width: 58px; } .not-found-header__label { font-size: .7rem; } .not-found-main { align-items: start; padding-top: 52px; } .not-found-layout { grid-template-columns: 1fr; gap: 40px; } .not-found-code { font-size: clamp(5rem, 27vw, 8rem); } .not-found-copy p { margin-top: 22px; } .not-found-aside { max-width: 480px; } .not-found-footer { padding-bottom: 20px; } }
    @media (prefers-reduced-motion: reduce) { .not-found-actions .button { transition: none; } }
  </style>
</head>
<body class="site-page not-found-page">
  <a class="skip-link" href="#main-content">Aller au contenu principal</a>
  <header class="not-found-header">
    <div class="container">
      <a class="brand" href="${homePath}" aria-label="R’U SAFE — retour à l’accueil"><img class="brand-logo" src="${logoPath}" alt="R’U SAFE" width="116" height="84"></a>
      <p class="not-found-header__label" data-not-found-label>Navigation sécurisée</p>
    </div>
  </header>
  <main class="not-found-main" id="main-content" tabindex="-1">
    <div class="container not-found-layout">
      <section class="not-found-copy" aria-labelledby="not-found-title">
        <span class="not-found-code" aria-hidden="true">404</span>
        <h1 id="not-found-title">Cette page est introuvable.</h1>
        <p data-not-found-copy>Le lien que vous avez suivi est peut-être obsolète, ou l’adresse comporte une erreur. Vous pouvez revenir à l’accueil ou nous contacter si vous avez besoin d’aide.</p>
        <div class="not-found-actions">
          <a class="button primary" data-not-found-home href="${homePath}">Revenir à l’accueil <span aria-hidden="true">→</span></a>
          <a class="button button--secondary" data-not-found-contact href="${contactPath}">Nous contacter</a>
        </div>
      </section>
      <aside class="not-found-aside" aria-labelledby="not-found-help-title">
        <span class="not-found-aside__mark" aria-hidden="true">?</span>
        <h2 id="not-found-help-title" data-not-found-help-title>Besoin d’un échange&nbsp;?</h2>
        <p data-not-found-help-copy>Nos équipes restent disponibles pour échanger sur vos enjeux de conformité, cybersécurité et résilience.</p>
      </aside>
    </div>
  </main>
  <footer class="not-found-footer">
    <div class="container"><span>R’U SAFE — Conformité · Cybersécurité · Résilience</span><a href="mailto:contact@rusafe.fr">contact@rusafe.fr</a></div>
  </footer>
  <script>
    (() => {
      if (!/^\\/en(?:\\/|$)/.test(window.location.pathname.replace(${JSON.stringify(publicBasePath)}, ""))) return;
      const text = {
        title: "Page not found — R’U SAFE", label: "Secure navigation", heading: "This page could not be found.",
        copy: "The link you followed may be outdated, or the address may contain an error. You can return to the homepage or contact us if you need assistance.",
        home: "Back to homepage", contact: "Contact us", helpTitle: "Need to talk?",
        helpCopy: "Our teams are available to discuss your compliance, cybersecurity and resilience priorities."
      };
      document.documentElement.lang = "en";
      document.title = text.title;
      document.querySelector(".skip-link").textContent = "Skip to main content";
      document.querySelector("[data-not-found-label]").textContent = text.label;
      document.querySelector("#not-found-title").textContent = text.heading;
      document.querySelector("[data-not-found-copy]").textContent = text.copy;
      document.querySelector("[data-not-found-home]").innerHTML = text.home + ' <span aria-hidden="true">→</span>';
      document.querySelector("[data-not-found-home]").href = ${JSON.stringify(englishHomePath)};
      document.querySelector("[data-not-found-contact]").textContent = text.contact;
      document.querySelector("[data-not-found-contact]").href = ${JSON.stringify(englishContactPath)};
      document.querySelector("[data-not-found-help-title]").textContent = text.helpTitle;
      document.querySelector("[data-not-found-help-copy]").textContent = text.helpCopy;
    })();
  </script>
</body>
</html>`;
}

async function validateGeneratedReferences(textFiles) {
  const missingReferences = [];

  for (const relativePath of textFiles) {
    const content = await readFile(join(outputDirectory, relativePath), "utf8");

    for (const reference of collectLocalReferences(relativePath, content)) {
      const cleanReference = decodeURIComponent(reference.split("#")[0].split("?")[0]);
      if (!cleanReference) continue;

      const rootRelativeReference = cleanReference.startsWith("/");
      const referenceInsideBuild = rootRelativeReference
        ? (publicBasePath && !cleanReference.startsWith(`${publicBasePath}/`)
          ? "../outside-build"
          : cleanReference.slice(publicBasePath.length).replace(/^\/+/, ""))
        : cleanReference;
      const target = resolve(outputDirectory, dirname(relativePath), referenceInsideBuild);
      const pathFromOutput = relative(outputDirectory, target);
      if (pathFromOutput.startsWith(`..${sep}`) || pathFromOutput === ".." || !(await fileExists(target))) {
        missingReferences.push(`${relativePath} → ${reference}`);
      }
    }
  }

  if (missingReferences.length > 0) {
    throw new Error(`Références locales introuvables :\n${missingReferences.join("\n")}`);
  }
}

async function build() {
  await validateManifest();
  await validateTranslations();
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  const generatedTextFiles = sharedFiles.filter((file) => /\.(?:css|js)$/.test(file));
  let totalBytes = 0;

  for (const relativePath of sharedFiles) {
    const source = resolveInsideProject(relativePath);
    const destination = join(outputDirectory, relativePath);
    const file = await stat(source);
    await mkdir(dirname(destination), { recursive: true });
    await cp(source, destination);
    totalBytes += file.size;
  }

  if (deploymentMode !== "preview") {
    const runtimeFiles = ["api/contact.php", "server/ionos/.htaccess"];

    for (const relativePath of runtimeFiles) {
      const source = resolveInsideProject(relativePath);
      const destination = relativePath === "server/ionos/.htaccess"
        ? join(outputDirectory, ".htaccess")
        : join(outputDirectory, relativePath);
      const file = await stat(source);
      await mkdir(dirname(destination), { recursive: true });
      if (relativePath === "server/ionos/.htaccess") {
        const template = await readFile(source, "utf8");
        const configuration = template.replaceAll("__BASE_PATH__", publicBasePath);
        await writeFile(destination, configuration, "utf8");
        totalBytes += Buffer.byteLength(configuration);
      } else {
        await cp(source, destination);
        totalBytes += file.size;
      }
    }
  }

  for (const locale of Object.keys(locales)) {
    for (const pageFile of pageFiles) {
      const overridePath = resolveInsideProject(join("locales", locale, pageFile));
      const hasOverride = await fileExists(overridePath);
      const sourcePath = hasOverride ? overridePath : resolveInsideProject(pageFile);
      const source = await readFile(sourcePath, "utf8");
      const localizedHtml = localizeHtml(source, pageFile, locale, locale !== "fr" && !hasOverride);
      const relativeDestination = join(locale, pageFile);
      await mkdir(dirname(join(outputDirectory, relativeDestination)), { recursive: true });
      await writeFile(join(outputDirectory, relativeDestination), localizedHtml, "utf8");
      generatedTextFiles.push(relativeDestination);
      totalBytes += Buffer.byteLength(localizedHtml);
    }
  }

  for (const pageFile of pageFiles) {
    await writeFile(join(outputDirectory, pageFile), createRedirectPage(`fr/${pageFile}`, "Accéder à la version française"), "utf8");
    generatedTextFiles.push(pageFile);
  }

  await writeFile(join(outputDirectory, "index.html"), createRedirectPage("fr/landing.html", "Accéder au site"), "utf8");
  await writeFile(join(outputDirectory, "404.html"), createNotFoundPage(), "utf8");
  await writeFile(join(outputDirectory, "robots.txt"), createRobots(), "utf8");
  if (isIndexableBuild) await writeFile(join(outputDirectory, "sitemap.xml"), createSitemap(), "utf8");
  await writeFile(join(outputDirectory, ".nojekyll"), "", "utf8");
  generatedTextFiles.push("index.html", "404.html");

  await validateGeneratedReferences(generatedTextFiles);
  console.log(`${isIndexableBuild ? "Production" : "Pré-production"} FR/EN générée : ${pageFiles.length * 2} pages localisées, ${(totalBytes / 1048576).toFixed(1)} Mo.`);
}

build().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
