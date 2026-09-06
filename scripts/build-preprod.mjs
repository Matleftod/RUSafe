import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const outputDirectory = join(projectRoot, "dist");
const isIndexableBuild = process.env.SITE_INDEXABLE === "true";
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");
const contactMode = process.env.CONTACT_MODE || (isIndexableBuild ? "live" : "demo");

if (isIndexableBuild && !/^https:\/\/[^\s/]+/i.test(publicSiteUrl)) {
  throw new Error("PUBLIC_SITE_URL doit être une URL HTTPS valide pour un build indexable.");
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
  "solutions.html": { fr: { title: "Solutions — R’U SAFE", description: "Resilient Advisor, AUSECAF, SECEDI, D&IIM et Compliance Accelerator : des solutions issues du terrain." }, en: { title: "Solutions — R’U SAFE", description: "Resilient Advisor, AUSECAF, SECEDI, D&IIM and Compliance Accelerator: solutions built from operational needs." } },
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
  "assets/avatars/aurelien.webp", "assets/avatars/gilles.webp", "assets/avatars/karim-directeur.svg",
  "assets/avatars/mauro.svg", "assets/avatars/michael.svg", "assets/avatars/mickael.webp", "assets/avatars/parham.webp",
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

  if (duplicates.length > 0) {
    throw new Error(`Fichiers dupliqués dans le manifeste : ${duplicates.join(", ")}`);
  }

  await Promise.all([...sharedFiles, ...pageFiles].map(async (relativePath) => {
    const file = await stat(resolveInsideProject(relativePath));
    if (!file.isFile()) throw new Error(`Le fichier attendu est introuvable : ${relativePath}`);
  }));
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
  const controls = Object.entries(locales).map(([locale, config]) => {
    const flag = `<img class="language-switcher__flag" src="../assets/flags/${locale}.svg" alt="" width="20" height="14" aria-hidden="true">`;
    const text = `<span class="sr-only">${config.currentLabel}</span>`;

    if (locale === activeLocale) {
      return `<strong class="language-switcher__option" lang="${locale}" aria-current="true" aria-label="${config.currentLabel} — current language">${flag}${text}</strong>`;
    }

    return `<a class="language-switcher__option" href="../${locale}/${pageFile}" lang="${locale}" hreflang="${locale}" aria-label="${config.switchLabel}">${flag}${text}</a>`;
  }).join('');

  return `<span class="language-switcher${isLanding ? " language-switcher--landing" : ""}" role="group" aria-label="Language selector">${controls}</span>`;
}

function absoluteUrl(locale, pageFile) {
  return `${publicSiteUrl}/${locale}/${pageFile}`;
}

function createSeoTags(pageFile, locale) {
  const metadata = pageMetadata[pageFile][locale];
  const title = metadata.title.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const description = metadata.description.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const robots = isIndexableBuild ? "index, follow" : "noindex, nofollow";
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
  return `  <meta name="robots" content="${robots}">
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
    .replace("</head>", `${createSeoTags(pageFile, locale)}\n</head>`)
    .replace(/<body([^>]*)>/, '<body$1 data-asset-root="../assets">');

  if (pageFile === "contact.html") html = html.replace('data-contact-mode="live"', `data-contact-mode="${contactMode}"`);
  html = html.replace(/(<footer>\s*<div class="container footer-grid">)/, `$1\n      ${createFooterLinks(locale)}`);

  if (notice) html = html.replace(/(<body[^>]*>)/, `$1\n  ${notice}`);
  if (isLanding) html = html.replace(/(<body[^>]*>)/, `$1\n  ${switcher}`);
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

function createNotFoundPage() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page introuvable — R’U SAFE</title><link rel="stylesheet" href="design-system.css"><link rel="stylesheet" href="site.css"></head><body class="site-page"><main class="content-section"><div class="container legal-content"><span class="eyebrow dark">404</span><h1>Cette page est introuvable.</h1><p>The requested page could not be found.</p><p><a class="button primary" href="fr/landing.html">Accéder au site</a></p></div></main></body></html>`;
}

async function validateGeneratedReferences(textFiles) {
  const missingReferences = [];

  for (const relativePath of textFiles) {
    const content = await readFile(join(outputDirectory, relativePath), "utf8");

    for (const reference of collectLocalReferences(relativePath, content)) {
      const cleanReference = decodeURIComponent(reference.split("#")[0].split("?")[0]);
      if (!cleanReference) continue;

      const target = resolve(outputDirectory, dirname(relativePath), cleanReference);
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
