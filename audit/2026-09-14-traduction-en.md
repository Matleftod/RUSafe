# Révision de la version anglaise — 14 septembre 2026

## Périmètre et référence

Les 11 pages françaises à la racine constituent la référence éditoriale. Les empreintes SHA-256 des sources HTML françaises ont été enregistrées avant la révision et comparées après les modifications : aucune source française n’a changé. Les pages générées dans `dist/fr/` sont également inchangées par rapport au début de cette intervention.

La révision porte sur les contenus anglais HTML, les attributs accessibles, les métadonnées SEO et les textes générés par JavaScript. Les styles, les données du formulaire et le fonctionnement du verrou vidéo sont conservés.

## Corrections effectuées

- Harmonisation en anglais britannique : orthographe, vocabulaire, formulations B2B et terminologie de la conformité, de la résilience et de la formation.
- Relecture comparative des pages Accueil, Notre approche, Expertise, Solutions, Partenaires, Formation, Références, Contact, Landing, Mentions légales et Politique de confidentialité.
- Biographies remises en concordance avec le français, notamment Azad, Mauro, Edmond, Eric, François, Mehdi, Pénélope, Pascal et Parham. Les passages manquants ont été rétablis, les ajouts absents de la référence française retirés et les formulations à la troisième personne conservées.
- Retrait des mentions ajoutées en anglais de La Caisse des Dépôts, BIOOOS, CyberBrennus, SILAKAN et de l’usage de ChatGPT dans les biographies concernées, car elles ne figurent pas dans les biographies françaises actuelles.
- Remplacement de traductions littérales comme « operational steering », « programme families » et « reflexes » par des expressions naturelles dans leur contexte.
- Correction des résidus « Équipe » et « Directive REC » ; utilisation de « Team », « CER Directive » et de l’acronyme anglais PSD2 pour DSP2.
- Correction de `lang="fr"` dans les sources anglaises qui le conservaient. Le build produisait déjà `lang="en"` ; les sources sont désormais cohérentes elles aussi.
- Harmonisation des libellés des portraits, des liens de retour vers l’introduction et du sélecteur de langue.
- Amélioration des métadonnées anglaises, y compris la présence de CIATA Manager dans la description des solutions.
- Concordance du message d’erreur vidéo avec le bouton « Try again » et amélioration des messages du formulaire.
- Traduction du footer et du libellé accessible du logo de la page 404 anglaise. Le logo mène maintenant à l’accueil anglais lorsque la 404 est affichée dans un chemin anglais.

## Vérifications réalisées

- Syntaxe des deux scripts partagés et du script de build : OK.
- `git diff --check` : OK.
- Build de production : OK, 22 pages localisées, 23,5 Mo. La validation intégrée des références locales n’a signalé aucun fichier manquant.
- Chromium, largeur 1440 px : ouverture des 11 pages EN, contrôle de la langue du document et recherche des résidus FR dans les textes et attributs ; aucun résidu involontaire détecté.
- Sélecteur EN → FR → EN vérifié sur les 11 pages.
- Mobile, largeur 390 px : Accueil, Formation, Solutions, Contact et Landing ; aucun débordement horizontal détecté.
- 33 fiches équipe présentes ; ouverture d’une biographie et libellé « Profile » vérifiés.
- Ouverture des cinq groupes du catalogue de formation : OK.
- Formulaire : validation, succès, confirmation en attente et erreur vérifiés avec des réponses simulées localement. Aucun e-mail envoyé.
- Vidéos : sélection des quatre offres, descriptions anglaises et message d’erreur réseau vérifiés.
- Page 404 : langue, footer, libellé du logo et destination du lien vérifiés en FR et EN.
- Aucune erreur JavaScript constatée pendant ce parcours.

Ces contrôles sont ciblés sur la traduction et son intégration ; ils ne constituent pas un nouvel audit général de performance, de sécurité ou de conformité juridique.

## Éléments conservés et limites

- Les prénoms, coordonnées et dénominations officielles restent inchangés : R’U SAFE, CIATA, AUSECAF, SECEDI, D&IM (Documents & Informations Manager), Cyber–Tech–IA Hub, RTT — Resilient Test Tracker, références normatives et organismes cités.
- « Français » reste le nom natif de la langue dans le sélecteur ; son libellé d’action anglais est « Switch to French ».
- Les contenus manquants en français ne sont pas inventés en anglais. Le placeholder de durée de conservation et les biographies absentes restent à compléter. Les biographies absentes sont masquées par le comportement existant des fiches.
- La politique de confidentialité française indique encore que les coordonnées légales doivent être complétées. Cette indication est conservée dans sa traduction pour respecter la référence française demandée.
- Les médias partagés (vidéos, audio, images et éventuels textes incrustés) n’ont pas été traduits ou remplacés dans cette passe HTML/JS.
- L’architecture existante de la page 404 sélectionne l’anglais via JavaScript. Sans JavaScript, son contenu initial reste français.

## Fichiers sources modifiés

Les 11 fichiers HTML dans `locales/en/`, ainsi que `script.js`, `site.js` et `scripts/build-preprod.mjs`. Dans ces trois scripts, les changements concernent les contenus et le rendu anglais. Ce rapport est ajouté dans `audit/`.

## Fichiers à transférer sur IONOS

Remplacer les fichiers correspondants dans le répertoire du site :

- `dist/en/accueil.html`
- `dist/en/approche.html`
- `dist/en/contact.html`
- `dist/en/expertise.html`
- `dist/en/formation.html`
- `dist/en/landing.html`
- `dist/en/mentions-legales.html`
- `dist/en/partenaires.html`
- `dist/en/politique-confidentialite.html`
- `dist/en/references.html`
- `dist/en/solutions.html`
- `dist/script.js`
- `dist/site.js`
- `dist/404.html`

Le rapport et le script de build ne sont pas à transférer. Aucun transfert des fichiers FR, des CSS ou des médias n’est nécessaire pour cette révision.
