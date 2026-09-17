# Audit responsive R’U SAFE — 16 septembre 2026

Le site possède une base responsive solide, mais il ne peut pas encore être considéré comme adapté à tous les formats. Les défauts les plus importants concernent la hauteur disponible, le parcours d’entrée, le menu et l’agrandissement du texte. Les pages éditoriales à taille de texte normale se comportent globalement bien.

**8 familles de défauts confirmés : 1 P0, 5 P1, 2 P2, 0 P3.** Les occurrences françaises et anglaises d’un même défaut ne sont pas comptées séparément. Aucun correctif n’a été appliqué aux sources du site.

## Verdict sur les anti-patterns

La direction visuelle reste identifiable et cohérente avec le contexte de marque existant : formes organiques, palette claire, typographie et composants partagés. Aucune refonte esthétique n’est nécessaire pour résoudre les défauts constatés. Les cartes et ombres répétées sont un choix existant, pas une preuve de problème responsive.

L’anti-pattern technique déterminant est **le masquage des débordements sur des conteneurs de contenu** : une page peut afficher une largeur de document correcte tout en coupant du texte. Le second est l’organisation de parcours entiers dans une hauteur d’écran fixe sans solution de défilement dans tous les états.

## Périmètre et méthode

Audit de l’état local du projet, y compris les modifications déjà présentes avant cette tâche. Le paquet de préproduction a été régénéré avec `node scripts/build-preprod.mjs`, puis servi localement. Il comprend 22 pages localisées et la page 404 générée. Le résultat n’est pas une vérification d’un hébergement distant.

| Couverture | Tests exécutés |
|---|---|
| Pages FR + EN | Landing, accueil, approche, expertise, solutions, partenaires, formation, références, contact, mentions légales, confidentialité |
| Largeurs Chromium | 280, 320, 360, 375, 390, 430, 460, 461, 560, 561, 640, 641, 720, 721, 768, 820, 900, 901, 960, 1024, 1120, 1280, 1440, 1920, 2560 px CSS |
| Hauteurs supplémentaires | 568×320, 844×390, 1024×600, 1280×720 ; contrôles ciblés en 320×568, 667×375, 320×256 |
| Autres moteurs | Firefox et WebKit : les 22 pages à 320, 390, 768, 901 et 1440 px, puis interactions ciblées |
| Matrice initiale | **858 relevés page/format/moteur** : 638 Chromium + 220 Firefox/WebKit |
| Interactions | **580 relevés supplémentaires** : 4 onglets vidéo, menu ouvert, défilement, fiches ouvertes/fermées, catalogue déplié, validation du formulaire, texte agrandi |
| Navigation | État visiteur avant déblocage sur Contact ; navigation complète ; Échap ; redimensionnement au-delà de 900 px |
| Agrandissement | Racine typographique à 200 % sur les 20 pages éditoriales, à 390 et 1280 px ; doublement des tailles calculées sur les 22 pages ; largeur/hauteur CSS équivalente à un zoom 400 % d’une fenêtre 1280×1024 |
| Espacement du texte | Interligne 1,5, espacement des paragraphes 2 em, lettres 0,12 em, mots 0,16 em ; les 11 pages FR à 320 et 768 px |
| Contrôles complémentaires | Page 404 sur 7 formats × 3 moteurs ; vidéos Solutions ; message de formulaire en mode démo ; captures et inspection visuelle |
| Accessibilité automatisée | Axe sur les 11 pages FR à 390×844 : aucune violation signalée dans cet état initial |

Les tests principaux attendent le chargement des polices. Les contrôles d’interaction utilisent également un pointeur tactile simulé. Les animations sont réduites pour stabiliser les mesures. Les erreurs de recouvrement ont été confirmées après stabilisation et, pour le bouton retour vidéo, par une tentative de clic normale.

**Limites précises :** tests sur moteurs de navigateur de bureau, pas sur de vrais iPhone, Android ou iPad. Le zoom est testé par réduction du viewport CSS et par substitutions typographiques, pas par toutes les interfaces de zoom natives. Clavier virtuel, encoche, barres mobiles dynamiques, lecteur vidéo natif mobile et fonctionnement en réseau lent restent à valider sur appareil. Les anciennes sauvegardes, `waiting.html`, `accueil.css` historique et les documents de travail exclus de la publication ne sont pas des pages publiques auditées. Les 858 relevés initiaux portent sur les 22 pages, pas sur la 404.

## Grille de santé

Notes indicatives selon le protocole `audit`. Ce score n’est ni un pourcentage de compatibilité ni une certification WCAG. Les notes performance, thèmes et anti-patterns reposent sur les éléments examinés pour cet audit responsive ; aucun benchmark de performance mobile n’a été réalisé.

| Dimension | Note /4 | Observation principale |
|---|---:|---|
| Accessibilité liée au responsive | 2 | Bons contrôles et sémantique ; texte agrandi rogné et champ focalisé masqué |
| Performance de l’implémentation examinée | 3 | Pas de framework, médias WebP et chargement différé ; vidéos de 2,6 à 8,2 Mo à éprouver en réseau mobile |
| Responsive | 2 | Bonne adaptation des pages courantes ; parcours bloqués sur écrans courts |
| Tokens et cohérence | 3 | Styles et variables partagés ; règles de dimensions propres à la landing moins cohérentes |
| Anti-patterns | 3 | Identité cohérente ; usage trop large du masquage des débordements |
| **Total** | **13/20** | **Travail significatif et ciblé avant validation tous formats** |

## Défauts confirmés, par priorité

### R01 — P0 — Le bouton d’entrée devient inaccessible sur écran bas

**Page :** landing FR et EN. **Catégorie :** responsive / accessibilité.

- À 568×320 en FR, « Découvrir nos activités » occupe environ **y=377 à 442**, entièrement sous le viewport.
- À 844×390, le bouton occupe **y=472 à 537**. Le sous-titre est lui aussi partiellement coupé.
- À 667×375, le bouton commence sous l’écran.
- Aucun conteneur de défilement utilisable n’existe dans cet état. Le pied de page absolu empiète sur les textes visibles.
- À 320×568, après doublement des tailles de texte calculées, le bouton commence vers **y=833** : même problème d’accès.

**Impact :** l’action principale du parcours d’arrivée ne peut pas être activée au pointeur dans ces formats. P0 dans ce parcours et ces conditions ; ce n’est pas une indisponibilité générale de toutes les pages.

**Localisation :** [landing.css:33](/Users/mat/Pro/R'Usafe/RUSafe/landing.css:33), lignes 40–49 et 90–102 ; espacements fixes/adaptés par paliers aux lignes 605–704. Le correctif paysage existant, ligne 737, s’applique seulement à `.landing-shell.is-gate`.

**Correction proposée :** laisser le contenu déterminer la hauteur minimale et autoriser le défilement vertical pour les deux étapes du parcours, y compris avant ouverture des vidéos. Réserver la coupure aux décors et à la transition horizontale. Faire participer le pied de page au flux lorsque le contenu manque de place.

**Acceptation :** bouton, titre, sous-titre et liens légaux accessibles en 568×320, 667×375, 844×390, 320×256 et texte 200 %, sans changement d’orientation imposé.

**Preuve :** [landing paysage](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/landing-568x320.png), [texte 200 % sur petit écran](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/landing-text200-320.png) ; `interactions.json`, `confirmation.json`. Référence : [reflow WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Commande suggérée : `$adapt`.

### R02 — P1 — Le menu mobile dépasse la hauteur disponible

**Pages :** toutes les pages utilisant le menu complet, FR/EN. **Catégorie :** responsive / navigation.

Le menu ouvert va de **y=72 à y=544**, soit 472 px de haut. Il convient en 390×844 et reste utilisable en 320×568. En 568×320 ou 844×390, les derniers liens et le sélecteur de langue passent sous l’écran. Faire défiler la page déplace le contenu derrière le menu, sans ramener ses derniers éléments : le menu dépend d’un en-tête fixe et n’a ni hauteur maximale ni défilement interne.

**Impact :** formation, contact et changement de langue deviennent difficiles ou impossibles à atteindre au toucher selon la hauteur.

**Localisation :** [site.css:118](/Users/mat/Pro/R'Usafe/RUSafe/site.css:118), `.topbar` ; [site.css:806](/Users/mat/Pro/R'Usafe/RUSafe/site.css:806), `.nav-links` mobile. `site.js:77` gère l’état mais pas la hauteur disponible.

**Correction proposée :** borner le menu à l’espace réellement disponible sous l’en-tête avec `dvh`, permettre son défilement vertical et conserver une fermeture visible. Vérifier le comportement du défilement de l’arrière-plan et la navigation au clavier.

**Acceptation :** toucher chaque lien et chaque langue à 568×320, 844×390 et 320×256. Le dernier lien doit pouvoir être amené au-dessus du bord inférieur.

**Preuve :** [menu paysage](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/menu-568x320.png), [menu portrait fonctionnel](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/menu-320x568.png) ; `interactions.json`, états `menu-open` et `menu-after-scroll`. Commande : `$adapt`.

### R03 — P1 — Le panneau vidéo recouvre son en-tête sur petit portrait

**Page :** étape vidéo de la landing, notamment 320×568. **Catégorie :** responsive / interaction.

En FR, onglet DORA : le logo va de **y=18 à 108**, les onglets de **y=51 à 116**, le sélecteur de langue de **y=18 à 64**. Le panneau remonte dans l’espace de l’en-tête. Le centre du bouton retour est intercepté par `.gate-card` : **un clic normal échoue dans Chromium, WebKit et Firefox**. En EN/DORA, le bouton retour a réussi le test, mais le logo et les onglets occupent toujours des zones qui se chevauchent. La hauteur du texte selon la langue et l’activité modifie la collision.

**Impact :** éléments mélangés visuellement et retour à l’étape précédente peu fiable sur petit écran.

**Localisation :** [landing.css:198](/Users/mat/Pro/R'Usafe/RUSafe/landing.css:198), centrage du panneau ; `landing.css:205`, en-tête absolu ; `landing.css:247`, carte ; `design-system.css:110`, sélecteur fixe.

**Correction proposée :** réserver une vraie ligne pour retour/langues/logo, placer la carte après cette ligne, puis permettre le défilement quand la hauteur manque. Un simple changement de `z-index` laisserait les chevauchements visuels.

**Acceptation :** aucun recouvrement en 320×568, 360×640 et 390×667 ; retour activable sur les quatre activités, FR et EN, avec texte normal puis agrandi.

**Preuve :** [collision stabilisée](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/gate-collision-320.png) ; `verification.json`, `gate-collision` ; `final-checks.json`, `gate-back-320`. Commande : `$adapt`.

### R04 — P1 — Les grilles et certains textes résistent mal à l’agrandissement

**Pages :** défaut transversal, avec variations de contenu FR/EN. **Catégorie :** responsive / accessibilité typographique.

Avec la taille racine à 200 % et un viewport de 390 px, des blocs dépassent puis sont masqués : accueil, approche, expertise, partenaires, formation, références et contact en FR ; les mêmes pages plus solutions en EN. Exemples :

- Accueil FR : titre/texte jusqu’à **x=472** pour une fenêtre de 390 px.
- Partenaires FR : bloc « Une expertise immédiatement mobilisable » jusqu’à **x=518**.
- Formation FR : plusieurs titres et paragraphes jusqu’à **x=505–518**.
- Contact FR/EN : titre et introduction jusqu’à **x=409**.
- Avec doublement de toutes les tailles calculées, plusieurs noms des fiches équipe dépassent aussi leur colonne, dont Aleksander, Prasanthi et Stéphane.
- Sans doubler le texte, la substitution d’espacement révèle déjà des débordements en 320 px sur Partenaires et Formation FR : bords droits vers **335 et 344 px**.

**Impact :** perte de mots et de portions de paragraphes pour les lecteurs qui agrandissent ou espacent le texte. L’absence de barre horizontale masque le défaut plutôt que de le résoudre.

**Localisation :** `site.css:1304` et `site.css:1450` pour le masquage ; grilles et contenus `site.css:1399`, `1408`, `1576`, `1583`, `1948` ; `site.css:2251` impose `white-space: nowrap` au lien de l’encart d’accueil ; fiches équipe `site.css:1002` et `1011`.

**Cause à traiter :** tailles minimales intrinsèques des éléments de grille, colonnes mobiles en `1fr`, textes longs non sécables et lien forcé sur une ligne. Le masquage appliqué aux sections rend leurs conséquences invisibles aux simples mesures de largeur du document.

**Correction proposée :** utiliser des colonnes réellement réductibles et `min-width: 0` sur les enfants concernés ; permettre les retours à la ligne des liens et noms ; prévoir une stratégie de césure/retour des mots longs ; faire évoluer les cartes quand le texte grossit. Isoler le débordement des décors, sans cacher les textes. Vérifier les solutions sur les contenus FR et EN existants.

**Acceptation :** aucun texte rogné ni recouvrement avec racine 200 %, texte seul 200 %, espacements personnalisés et largeur CSS de 320 px. Les fiches équipe ouvertes et fermées doivent conserver tous leurs noms et actions.

**Preuve :** [accueil, racine 200 %](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/rootfont200-accueil.png), [doublement des textes](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/text200-accueil.png) ; `verification.json`, `root-font-200` ; `final-checks.json`, `text-spacing` ; `interactions.json`, `text-200`.

Références : [redimensionnement du texte, WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [espacement, WCAG 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html). Commandes : `$adapt`, puis `$typeset`.

### R05 — P1 — La page 404 coupe le contenu et bloque le défilement

**Page :** `/404.html`, générée par le build. **Catégorie :** responsive / parcours de récupération.

À 568×320, les deux boutons de récupération commencent vers **y=408**, sous la fenêtre. Une action de défilement laisse `scrollY`, `body.scrollTop` et `documentElement.scrollTop` à zéro. À 320×568, le bouton Contact dépasse le bas. À 390×844, l’adresse de contact du pied de page se trouve sous le viewport.

Les décors absolus agrandissent aussi la zone géométrique du document : 548 px pour une fenêtre de 390 px, par exemple. Ce n’est pas, à lui seul, un débordement de texte ; il faut traiter le décor séparément du contenu utile.

**Impact :** la page destinée à sortir d’une erreur cache une partie de ses moyens de récupération.

**Localisation :** [scripts/build-preprod.mjs:306](/Users/mat/Pro/R'Usafe/RUSafe/scripts/build-preprod.mjs:306), `.not-found-page { overflow: hidden; }`, combiné au `height: 100%` de `design-system.css:280` ; décor à `scripts/build-preprod.mjs:323`.

**Correction proposée :** permettre au document de grandir et de défiler verticalement ; contenir le décor dans une couche distincte. Corriger le générateur, jamais directement `dist/404.html`.

**Acceptation :** retour accueil, contact et pied de page accessibles au défilement en portrait, paysage et 320×256, sans défilement horizontal dû au décor.

**Preuve :** [404 paysage](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/404-landscape.png), [404 portrait](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/page-404-390.png) ; `final-checks.json`, `404` ; `confirmation.json`, `404-wheel`. Commande : `$harden`.

### R06 — P1 — Le premier champ invalide se retrouve derrière l’en-tête dans Chromium

**Page :** Contact FR/EN, test 320×568. **Catégorie :** responsive / formulaire / focus.

Après soumission d’un formulaire vide, le navigateur place le focus sur `#contact-name`. Dans Chromium, le champ occupe environ **y=0 à 51**, alors que l’en-tête fixe couvre **y=0 à 64** : le champ actif est entièrement sous l’en-tête. WebKit et Firefox le placent au milieu de l’écran dans le même scénario, et ne reproduisent pas ce défaut.

**Impact :** l’utilisateur doit retrouver le champ demandé au lieu de pouvoir immédiatement le lire et le corriger. Le problème peut être aggravé par le clavier virtuel, ce dernier point restant à vérifier sur appareil.

**Localisation :** [site.js:322](/Users/mat/Pro/R'Usafe/RUSafe/site.js:322), appel `reportValidity()` ; `.topbar` dans `site.css:118` ; champs dans `site.css:1901`, sans marge de défilement adaptée.

**Correction proposée :** garantir une zone visible sous l’en-tête pour le premier champ invalide, via marges de défilement appropriées et, si nécessaire, gestion explicite du focus et du défilement. Tenir compte du conteneur qui défile réellement.

**Acceptation :** formulaire vide puis erreurs successives : label, champ actif et aide restent visibles, en 320×568 et clavier mobile ouvert.

**Preuve :** [champ invalide masqué](/Users/mat/Pro/R'Usafe/RUSafe/audit/2026-09-16-responsive/contact-invalid-focus.png) ; `final-checks.json`, `contact-invalid-focus`. Référence utile : [focus non masqué, WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Commande : `$harden`.

### R07 — P2 — Les onglets vidéo sont trop serrés à 320 px et en dessous

**Page :** étape vidéo FR/EN. **Catégorie :** responsive / lisibilité.

Les quatre onglets restent sur quatre colonnes. À 320 px, AUSECAF dispose d’environ **69 px**, mais son contenu demande **73 px**. À 280 px, la colonne tombe à **60 px**. DIAG6 2030 passe sur deux lignes tandis que les autres libellés restent sur une ligne. Ces écarts existent dans les trois moteurs.

**Impact :** espacement entre libellés insuffisant et rangée difficile à distinguer sur les plus petits écrans. C’est un débordement interne, même si la page ne déborde pas horizontalement.

**Localisation :** [landing.css:281](/Users/mat/Pro/R'Usafe/RUSafe/landing.css:281), `.gate-tabs` et `.gate-tab` ; règles mobiles autour de `landing.css:681`.

**Correction proposée :** grille 2×2 sur largeur étroite, ou autre disposition explicitement défilable et utilisable au clavier. Conserver des cibles confortables et les rôles d’onglets.

**Acceptation :** quatre libellés distincts et complets à 280/320 px, FR/EN, avec et sans agrandissement. Commande : `$adapt`.

### R08 — P2 — Les cibles tactiles de la landing sont moins confortables que celles du site

**Page :** landing et étape vidéo. **Catégorie :** ergonomie tactile.

- Le sélecteur de langue de la landing conserve des cibles **36×36 px**, même avec un pointeur tactile. La règle spécifique arrive après la règle partagée qui prévoit 44×44.
- Le bouton retour vidéo mesure **42×42 px**.
- Les liens légaux de la landing mesurent environ **20 px de haut** ; ceux du pied de page du site bénéficient au contraire d’une hauteur minimale de 44 px.

**Impact :** précision tactile moins bonne et incohérence entre l’entrée et le reste du site, surtout près des bords de l’écran.

**Localisation :** [design-system.css:97](/Users/mat/Pro/R'Usafe/RUSafe/design-system.css:97) et `design-system.css:120` ; `landing.css:223` et `landing.css:52`.

**Correction proposée :** conserver le standard interne de 44×44 pour les contrôles isolés et augmenter la hauteur cliquable des liens utilitaires de la landing, avec retour à la ligne si nécessaire.

**Attention à la qualification :** une cible inférieure à 44 px ne constitue pas automatiquement un échec WCAG AA. Le critère [2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) utilise 24 px avec des exceptions, notamment liées à l’espacement et aux liens dans le texte. Ici, la recommandation 44 px vise le confort et la cohérence ; aucune violation AA n’est déduite uniquement de ces dimensions.

**Preuves :** `matrix.json`, `small` sur la landing ; dimensions confirmées avec pointeur tactile dans `verification.json`. Commande : `$adapt`, finition `$polish`.

## Ce qui fonctionne déjà

- **Les 22 pages initiales restent dans la largeur du viewport** sur les 858 relevés, à texte normal. Aucun débordement horizontal de contenu utile détecté dans ces états ; cela ne couvre pas les états ouverts ou les textes agrandis décrits plus haut.
- **Transitions de colonnes cohérentes :** sections et formulaire en une colonne sur mobile ; grille équipe en 3, 2 puis 1 colonne ; vidéos Solutions en une colonne sur mobile. Les tests autour de 640/641, 720/721 et 900/901 n’ont pas révélé de rupture horizontale des pages initiales.
- **Fiches équipe :** ouverture en pleine largeur de grille et longs textes lisibles à taille normale ; fermeture des autres fiches du même groupe ; profils ouverts contrôlés entre 280 et 1440 px.
- **Formation :** index adaptatif et accordéons utilisables ; contenu déplié sans débordement interne détecté à taille normale sur les largeurs testées.
- **Formulaire :** champs de 50 px de hauteur minimum, labels présents, taille de saisie héritée de 16 px à taille normale ; bouton et texte de confidentialité s’empilent sur mobile. Le message de préproduction se replie dans sa largeur. Aucun e-mail réel envoyé.
- **Menu :** bouton d’ouverture suffisamment grand, Échap ferme et restitue le focus ; le passage au-dessus de 900 px ferme le menu après traitement de l’événement. L’anomalie de hauteur ne remet pas en cause ces mécanismes.
- **Étape vidéo en paysage :** contrairement à la première étape, elle possède déjà un défilement interne. Le bouton d’accès est ramené dans l’écran après défilement. Ne pas supprimer cet acquis lors de la correction.
- **Images et vidéos :** images bornées en largeur, logos avec `srcset`, portraits WebP différés, lecteurs Solutions adaptatifs et `playsinline`. Les lecteurs Solutions ont été mesurés de 320 à 2560 px.
- **Grand écran :** contenu courant limité à 1300 px ; paragraphes plafonnés dans plusieurs composants. Les vues desktop inspectées restent cohérentes et ne s’étirent pas indéfiniment avec l’écran.
- **Socle accessible :** viewport sans interdiction de zoom, lien d’évitement, boutons/liens sémantiques, états ARIA, styles de focus et prise en compte de la réduction des animations. Zéro erreur JavaScript dans les relevés initiaux.

## Synthèse par page

Les problèmes du menu complet (R02) sont transversaux. Les lignes ci-dessous ajoutent les observations propres au contenu ; « normal » signifie taille de texte par défaut.

| Page | État positif | Écarts à traiter |
|---|---|---|
| Landing + vidéos | Adaptation en largeur, lecteurs et défilement du second écran paysage | R01, R03, R07, R08 ; texte 200 % sur écran court |
| Accueil | Colonnes, cartes et fiches longues adaptés en mode normal | R04 sur hero, appel à contact et noms des consultants |
| Approche | Étapes empilées, hiérarchie et liens conservés | R04 sur titres/CTA agrandis |
| Expertise | Blocs, listes de référentiels et sections adaptées | R04 sur plusieurs sections agrandies |
| Solutions | Cartes et lecteurs adaptatifs | R04 notamment dans les contenus anglais agrandis |
| Partenaires | Tags et blocs adaptés en mode normal | R04 dès l’espacement personnalisé à 320 px, puis texte 200 % |
| Formation | Index, accordéons et catalogue déplié adaptés | R04 sur titres/sections ; espacement personnalisé à 320 px |
| Références | Indicateurs empilés, blocs lisibles en mode normal | R04 sur certains titres/paragraphes agrandis |
| Contact | Champs, colonnes et message démo adaptés | R04 sur introduction agrandie ; R06 dans Chromium |
| Mentions légales | Texte courant et liens se replient ; racine 200 % sans anomalie externe détectée | R02 si navigation complète affichée ; validation appareil à faire |
| Confidentialité | Même résultat positif que les mentions légales | R02 si navigation complète affichée ; validation appareil à faire |
| 404 | Composition et empilement mobile cohérents dans la portion visible | R05 : défilement et accès à la fin de page |

## Causes communes à corriger

1. **La hauteur doit être une contrainte de premier ordre.** Les ajustements en largeur ne suffisent pas pour une landing plein écran, une navigation fixe ou une page d’erreur.
2. **Ne pas cacher les débordements du contenu pour faire disparaître une barre de défilement.** Séparer les décors, puis contrôler les dimensions et les règles de retour à la ligne des vrais contenus.
3. **Le texte et les langues doivent guider la mise en page.** Une grille qui passe en une colonne peut encore dépasser par sa taille minimale intrinsèque ; le cas anglais n’est pas toujours identique au français.
4. **Unifier les règles communes.** Les langues et liens utilitaires de la landing devraient bénéficier des mêmes cibles tactiles que le reste du site.

## Ordre de correction proposé

1. **P0 — `$adapt` :** R01, rétablir l’accès à l’entrée sur toutes les hauteurs.
2. **P1 — `$adapt` :** R02 et R03, menu et en-tête vidéo ; les tester immédiatement sur mobile paysage et petit portrait.
3. **P1 — `$adapt`, `$typeset` :** R04, rendre les grilles et textes robustes à l’agrandissement et aux espacements personnalisés.
4. **P1 — `$harden` :** R05 et R06, page 404 et focus du formulaire.
5. **P2 — `$adapt` :** R07 et R08, onglets et cibles tactiles de la landing.
6. **`$polish` :** dernière passe visuelle sur les formats limites et sur les deux langues.

Les corrections peuvent être réalisées individuellement ou ensemble. Relancer `$audit` après les corrections pour mesurer leur effet et vérifier les régressions.

## Critères pour valider l’objectif « tous formats »

La cible réaliste est une mise en page fluide qui reste utilisable quand la largeur, la hauteur, la langue et la taille de texte changent. Aucun nombre fini de captures ne prouve une compatibilité universelle avec tous les appareils.

- [ ] Résoudre R01–R08 et rejouer leurs scénarios exacts.
- [ ] Balayer continûment les largeurs entre les seuils, y compris ±1 px autour des seuils actifs ; ne pas se limiter à des modèles de téléphone.
- [ ] Couvrir de 320 à 2560 px CSS au minimum ; garder 280 px comme test de robustesse pour les fenêtres exceptionnellement étroites.
- [ ] Tester 320/375/390 px de hauteur paysage ; réduction de la hauteur pendant la saisie ; fenêtre partagée sur tablette/ordinateur.
- [ ] Zoom navigateur natif 200 % et 400 %, zoom texte seul 200 %, taille de police utilisateur et espacement personnalisé, FR et EN.
- [ ] Ouvrir menus, fiches, accordéons ; vérifier les quatre activités vidéo, leur état d’erreur et les contrôles natifs en plein écran/retour portrait.
- [ ] Tester un iPhone Safari, un Android Chrome et une tablette réels, avec clavier virtuel, barres du navigateur, orientation changée en cours de parcours et zones sûres.
- [ ] Vérifier au clavier chaque lien du menu, chaque champ invalide et les contrôles vidéo ; aucun élément focalisé ne doit être caché par une couche fixe.
- [ ] Contrôler réseau mobile lent et appareil moins puissant : dimensions stables pendant le chargement des polices/images/vidéos, états de chargement et de reprise accessibles.
- [ ] Répéter le parcours final sur le paquet réellement déployé, y compris page 404 et formulaire de staging.

## Livrables et traçabilité

Ce dossier contient le rapport, les captures et six fichiers de mesures : `matrix.json`, `cross-browser.json`, `interactions.json`, `verification.json`, `final-checks.json`, `confirmation.json`. Les données brutes sont des observations, pas une liste automatique de défauts : par exemple un élément sous le viewport reste parfaitement valide si son conteneur permet de l’atteindre en défilant.

**Fichiers applicatifs modifiés par cet audit : aucun.** Seul le dossier `audit/2026-09-16-responsive/` a été ajouté ; `dist/`, ignoré par Git, a été régénéré pour les tests. Les modifications déjà présentes dans le projet ont été conservées. Le protocole `audit` et la référence responsive d’`impeccable` ont guidé la priorisation, les tests de texte/toucher et la distinction entre preuve mesurée et validation sur appareil.
