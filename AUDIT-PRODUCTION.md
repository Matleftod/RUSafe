# Audit de préparation à la production — R’U SAFE

Date : 12 septembre 2026. Révision auditée : `9ac21f3`, branche `pre-prod`.

**Décision : ouverture publique déconseillée en l’état.** La base est légère, les parcours principaux fonctionnent et les performances sont bonnes. Un secret SMTP est cependant publié dans Git, HTTPS n’est pas imposé et plusieurs défauts d’accessibilité et de robustesse restent à corriger. Les contenus éditoriaux à fournir par le client ne sont pas évalués ici.

## Périmètre et preuves

- Builds GitHub Pages et production IONOS exécutés avec succès ; `dist/` laissé en mode production (`SITE_INDEXABLE=true`, domaine `https://rusafe.fr`, formulaire live).
- 22 pages FR/EN : analyse axe-core, navigation Chromium, largeurs 320, 390, 768 et 1 440 px. Contrôle complémentaire de 611 références locales, dont les ancres : aucune cible manquante.
- Chromium, Firefox 146 et WebKit 26 : menus mobile, fermeture par Échap et retour du focus, bascule FR/EN, ouverture clavier d’une fiche équipe, formulaire simulé, chargement des quatre vidéos. WebKit automatisé ne remplace pas un test sur iPhone physique.
- Lecture réelle complète des quatre vidéos sous Chromium : anti-avance, vitesse ramenée à 1, déverrouillage à la fin et persistance lors du passage en anglais validés pour chacune. Durées : DORA 164,4 s ; AUSECAF 60,9 s ; SECEDI 124,8 s ; DIAG8-2030 107,3 s.
- Panne réseau vidéo simulée : message et bouton Réessayer affichés ; lecture disponible après rétablissement. Navigation clavier entre les onglets fonctionnelle.
- PHP 8.2.26 local : syntaxe valide ; tests avec configuration factice et serveur SMTP TLS local. Aucun nouveau message envoyé au client. Envoi réel IONOS précédemment confirmé par l’utilisateur, non rejoué durant cet audit.
- Vérifications distantes non authentifiées : racine HTTP/HTTPS, www, protection pré-prod, protection des médias et de l’API, DNS SPF/DMARC, métadonnées publiques du dépôt et disponibilité du fichier de configuration (HEAD uniquement, sans afficher son contenu).
- Preuves : [résultats détaillés](audit/2026-09-12/preuves.json), [capture du défaut paysage](audit/2026-09-12/video-paysage.png).

## Qualité de l’interface

Le contrôle des motifs visuels ne justifie pas une refonte. L’identité organique, les portraits et les composants sont cohérents avec la marque ; les accents lumineux, capsules et cartes répétées restent des éléments à modérer lors de futures évolutions. Verdict stylistique : globalement cohérent, appréciation qualitative, sans effet sur la décision de sécurité.

| Dimension | Note / 4 | Conclusion |
|---|---:|---|
| Accessibilité | 2 | Contrastes et lien non distinguable ; slogan automatique ; libellés équipe à améliorer |
| Performances | 3 | Excellent chargement initial ; politique de cache et compression à finaliser |
| Responsive | 2 | Pages courantes stables ; parcours vidéo coupé en paysage |
| Tokens et contextes de couleur | 3 | Variables partagées ; mauvaise couleur de badges sur fond sombre |
| Cohérence et motifs visuels | 3 | Identité reconnaissable ; quelques effets et styles répétés |
| Total indicatif | **13/20** | Corrections ciblées nécessaires |

Ce score concerne l’interface, pas la sécurité globale, et ne constitue pas une certification WCAG.

## Mesures Lighthouse

Une mesure par page, profil mobile simulé, serveur PHP local, cache navigateur neuf. Les réglages Apache IONOS et la latence réelle ne sont pas reproduits. Ces scores ne couvrent pas les étapes vidéo cachées au chargement initial.

| Page FR | Performance | Accessibilité auto | Bonnes pratiques auto | SEO auto | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Landing | 99 | 100 | 100 | 100 | 1,86 s | 0,009 | 0 ms |
| Accueil | 97 | 96 | 100 | 100 | 2,18 s | 0 | 0 ms |
| Contact | 98 | 100 | 100 | 100 | 1,96 s | 0,064 | 0 ms |

Poids total du paquet : environ 23,5 Mio, essentiellement les quatre vidéos. Aucune vidéo n’est demandée avant l’ouverture de l’étape vidéo ; aucune requête vers un tiers n’a été observée sur les 22 pages du build. Polices locales, médias H.264/AAC 720p, variantes WebP et absence de framework constituent une bonne base. Les avertissements Lighthouse relatifs à la compression/cache du serveur local doivent être recontrôlés sur IONOS après authentification.

## Constats priorisés

15 constats regroupés : **1 P0, 4 P1, 9 P2, 1 P3**. Les contrôles distants restant impossibles sans accès sont séparés en fin de rapport et ne sont pas présentés comme des défauts confirmés.

### P0-01 — Configuration SMTP publiée dans le dépôt public

**Sécurité — action immédiate.** `config/rusafe-smtp.php` est suivi par Git et contient un mot de passe non vide, non identifié comme placeholder. Le commit d’introduction `3cad53d` est dans `origin/pre-prod`. La branche distante est bien à `9ac21f3`, et l’URL brute du fichier sur cette branche répond HTTP 200 sans authentification. L’API GitHub indique un dépôt public. Aucun secret n’a été recopié dans ce rapport ou les preuves.

`.gitignore:13` ignore le chemin mais n’annule pas son suivi existant. Le paquet `dist/` actuel ne contient pas de fichier SMTP ; cela ne protège pas le dépôt source. L’exposition est confirmée ; aucun usage malveillant n’a été établi.

**Action :** changer immédiatement le mot de passe de la boîte dans IONOS, mettre à jour la configuration privée du serveur et les éventuels clients mail concernés. Retirer la configuration remplie du suivi en conservant une copie locale privée et le modèle anonymisé. Préparer ensuite le nettoyage de l’historique public et vérifier les autres branches. Toute réécriture/push forcé doit être coordonnée ; le retrait du fichier ou de l’historique ne remplace jamais la rotation. Ajouter un contrôle de secrets avant commit/CI. Commande de travail suggérée : `$harden`.

### P1-01 — HTTP reste accessible, y compris l’authentification de pré-prod

**Sécurité / déploiement.** `http://rusafe.fr/` répond 200, et `http://rusafe.fr/preprod-rusafe/` répond 401 avec un challenge Basic, sans redirection vers HTTPS. `https://rusafe.fr/` et `https://www.rusafe.fr/` répondent tous deux 200. `server/ionos/.htaccess:1` ne définit pas de redirection.

**Impact :** un accès initial en HTTP peut transmettre le formulaire ou les identifiants Basic sans chiffrement. Aucun identifiant n’a été envoyé en HTTP pendant l’audit.

**Action :** imposer HTTPS avant le challenge d’authentification, choisir `https://rusafe.fr` comme hôte canonique, rediriger www et HTTP en conservant chemins et paramètres. Vérifier les redirections réelles avant activation éventuelle de HSTS ; ne pas activer preload/includeSubDomains sans examiner les sous-domaines. `$harden`.

### P1-02 — Étape vidéo tronquée en paysage mobile

**Responsive / accès au site.** `landing.css:33-49` et `landing.css:91-98` imposent une hauteur de viewport et masquent le débordement. À 844 × 390, le CTA descend jusqu’à environ 425 px ; aucun conteneur ne permet un défilement vertical. Le défaut est reproduit dans les trois moteurs, FR et EN. La capture montre aussi des onglets hors cadre et des éléments superposés.

**Impact :** le parcours d’entrée est dégradé après rotation du téléphone ou dans une fenêtre basse.

**Action :** autoriser le défilement vertical de la scène active quand la hauteur manque et adapter les espacements en faible hauteur ; vérifier tous les onglets et les éléments fixes. Contrôler également le zoom texte et le clavier virtuel sur appareil réel. `$adapt`.

### P1-03 — Contrastes et distinction des liens insuffisants

**Accessibilité.** Axe confirme un contraste de **2,62:1** au lieu de 4,5:1 sur les badges `.eyebrow` des sections sombres : `accueil.html:97`, `references.html:125` et `references.html:134`, et leurs versions EN. La règle `site.css:88` ne s’adapte pas à ces fonds.

Le lien intégré vers les mentions légales dans la politique de confidentialité n’est pas souligné et son contraste avec le texte environnant est **2,84:1**, inférieur à 3:1 ; `site.css:2021` ne rétablit pas le soulignement supprimé globalement.

**Action :** variante de badge accessible sur fond sombre et distinction permanente des liens dans le texte. Critères [WCAG 2.2 — 1.4.3 et 1.4.1](https://www.w3.org/TR/WCAG22/). `$colorize`, puis `$polish`.

### P1-04 — Slogan automatique sans pause

**Accessibilité / mouvement.** `script.js:729-745` et `script.js:859-860` changent le slogan toutes les 4,2 s ; `landing.html:33` l’annonce via `aria-live="polite"`. En mode réduction des animations, le texte change toujours après 4,7 s dans le test. Aucun contrôle de pause n’est prévu.

**Impact :** mises à jour et annonces répétées qui peuvent gêner la lecture ou le lecteur d’écran. Le critère [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) prévoit un mécanisme de pause pour les informations mises à jour automatiquement.

**Action :** slogan fixe, ou commande de pause accessible ; respecter la préférence de réduction du mouvement et éviter les annonces automatiques répétées. `$animate`.

### P2-01 — Faux échec après acceptation du mail

**Formulaire.** `api/contact.php:154-161` attend une réponse 221 à QUIT dans le même bloc que la livraison. Avec le SMTP local simulé, le message est accepté par un 250 après DATA, puis la fermeture à QUIT déclenche un 502 côté application.

**Impact :** un visiteur peut renvoyer un message déjà accepté et produire un doublon.

**Action :** considérer l’acceptation DATA comme la réussite de soumission au serveur SMTP ; traiter séparément les erreurs de fermeture. Cela ne promet pas la livraison finale en boîte de réception. `$harden`.

### P2-02 — Validation et erreurs du formulaire encore incomplètes

**Robustesse.** `api/contact.php:53-69` convertit les tableaux reçus en chaîne ; le test `name[]=invalid` aboutit à un envoi accepté avec avertissement PHP. Les champs sont tronqués silencieusement côté serveur (message limité à 5 000 caractères), sans `maxlength` correspondant dans les pages contact. `site.js:216-235` n’a pas de délai d’expiration applicatif et présente la même erreur pour 429, 503 et 502.

**Impact :** contenu perdu au-delà de la limite, données mal typées acceptées, bouton pouvant rester en attente lors d’une requête qui ne se termine pas, essais répétés inutiles sur une limite horaire.

**Action :** refuser les valeurs non scalaires, harmoniser et annoncer les limites, distinguer indisponibilité/limitation, borner l’attente réseau. Valider aussi le type du tableau de configuration. Les rejets 403/422, le champ anti-robot et le sixième envoi rejeté en 429 fonctionnent déjà. `$harden`, `$clarify`.

### P2-03 — Cache, compression et en-têtes de sécurité à finaliser

**Déploiement / performance.** `server/ionos/.htaccess` est limité à l’interdiction du listing et de certains fichiers. Il ne définit ni cache des pages/assets, ni compression, ni protection contre l’intégration en iframe. Les réponses de la page d’attente n’affichent pas Cache-Control, HSTS ou protection contre l’encadrement. Les réponses de pages pré-prod authentifiées n’ont pas été observées : il ne faut pas déduire leurs réglages du serveur local.

**Action :** politique de revalidation des HTML et des CSS/JS non versionnés ; cache plus long pour les médias avec mécanisme de versionnement ; vérifier gzip/Brotli réellement servis. Ajouter les en-têtes compatibles, notamment nosniff pour les pages et une restriction frame-ancestors. Une CSP complète doit tenir compte des scripts/styles inline existants et être testée avant enforcement. Ne pas mettre `immutable` sur des fichiers modifiés sous le même nom. [Référence MDN sur le cache](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching). `$harden`, `$optimize`.

### P2-04 — Page 404 non raccordée à Apache

**Navigation / SEO.** `scripts/build-preprod.mjs:228-229` génère `404.html`, mais aucun `ErrorDocument 404` n’est prévu dans la configuration IONOS livrée. Les liens CSS et retour sont relatifs dans cette page : si elle est servie pour une URL profonde, leur résolution peut être incorrecte.

**Action :** raccorder la page en conservant le statut HTTP 404, rendre ses chemins compatibles avec le chemin de déploiement et tester `/fr/inexistante`, `/en/inexistante` et un chemin imbriqué. Le comportement IONOS authentifié reste à confirmer. `$harden`.

### P2-05 — Aucun accès principal de secours sans JavaScript

**Résilience.** `landing.html:39` et la version EN utilisent un bouton JS comme entrée. Sans JavaScript, le clic ne change rien ; aucun `noscript` n’explique le problème ou ne propose un accès au site. Les liens de contact/légal du pied restent utilisables.

**Action :** proposer une issue explicite en cas de JS indisponible, compatible avec le verrou incitatif accepté par le client. Ce verrou n’a pas vocation à sécuriser les URL directes ; la possibilité d’accès direct n’est pas signalée comme faille. `$harden`.

### P2-06 — Noms accessibles des fiches équipe différents du texte affiché

**Accessibilité.** `site.js:97-98` et `site.js:151-153` remplacent le nom accessible des `<summary>` par un `aria-label` qui ne reprend pas tout le texte visible (nom, rôle, fiche). Lighthouse signale 19 fiches sur l’accueil FR ; ce contrôle expérimental a été vérifié dans le DOM, la gravité d’usage exacte reste à confirmer avec commande vocale.

**Action :** privilégier le nom accessible natif du summary ou `aria-labelledby` cohérent avec les textes visibles. Le clavier Enter et le dépliage fonctionnent. Référence : WCAG 2.5.3. `$clarify`.

### P2-07 — CI sur une version Node arrivée en fin de vie

**Maintenance.** `.github/workflows/deploy-pages.yml:30` utilise Node 20 ; les actions checkout/setup-node sont en v4. Le build fonctionne actuellement, mais [Node 20 est EOL](https://nodejs.org/en/about/previous-releases).

**Action :** choisir une LTS maintenue, mettre à jour les actions compatibles puis vérifier un déploiement GitHub Pages. Ne pas confondre la version Node du build et celle intégrée à chaque action. `$harden`.

### P2-08 — Protections du build FR/EN insuffisantes pour les évolutions

**Maintenance / SEO.** `scripts/build-preprod.mjs:172-196` crée une page EN de repli si une traduction manque, mais ses métadonnées restent `index, follow` en production contrairement à ce qu’annonce README. Aucun repli n’a été constaté parmi les 22 pages actuelles. `CONTACT_MODE` accepte des valeurs arbitraires ; le backend n’est copié que dans un build indexable. Une pré-prod noindex avec formulaire live demande donc une manipulation supplémentaire.

**Action :** faire échouer un build public incomplet ou imposer le noindex du repli ; valider les options et fournir un mode explicite de staging IONOS noindex + backend. Ajouter au build les contrôles d’ancres/actions/états dynamiques réalisés pendant cet audit. `$harden`.

### P2-09 — Accessibilité du contenu vidéo à qualifier avant validation finale

**Accessibilité vidéo, sans rédaction de contenu.** `landing.html:87-101` et la version EN n’intègrent aucun `<track>` ; les trois moteurs confirment zéro piste texte. Les vidéos comportent une piste audio et du texte incrusté, mais l’équivalence complète avec les informations sonores n’a pas été évaluée. L’absence de piste ne permet pas à elle seule d’affirmer qu’aucun sous-titre ouvert n’existe dans l’image.

**Action :** vérifier l’équivalence des informations parlées et visuelles, prévoir l’intégration technique de sous-titres FR/EN et une alternative accessible si nécessaire ; faire fournir le contenu par le client. Référence : [WCAG 1.2.2](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded). Le test du verrou ne vaut pas validation de l’accessibilité des médias. `$harden`.

### P3-01 — Sémantique de la scène vidéo et libellés partagés

**Finition / i18n.** Les deux régions de l’étape vidéo partagent `aria-labelledby="gate-title"` (`landing.html:46,66`) ; le seul h1 se trouve dans la scène inactive. Le sélecteur injecté hors landmark est signalé par axe. `scripts/build-preprod.mjs:126-132` utilise « current language » et « Language selector » aussi sur la version FR.

**Action :** distinguer les régions, prévoir une hiérarchie de titres pertinente pour la scène active, intégrer le sélecteur au bon repère et localiser ses libellés. `$polish`.

## Pratiques positives à conserver

- Site statique, pas de framework, polices locales et pas de tracking tiers observé.
- Manifeste de publication explicite : médias sources, fichiers de travail et configuration SMTP absents du build actuel.
- Routes FR/EN, canonical, hreflang, sitemap et métadonnées présents ; aucun lien local cassé détecté.
- Pré-prod GitHub par défaut non indexable et formulaire en mode démo explicite.
- Verrou incitatif fonctionnel, persistance limitée à 60 jours, gestion des erreurs de stockage, pause à la mise en arrière-plan prévue dans le code, récupération vidéo testée.
- Menus clavier, liens d’évitement des pages internes, états aria et zones du sélecteur de 44 × 44 px sur mobile.
- Formulaire : expéditeur fixe, Reply-To du visiteur, encodage du sujet/corps, chiffrement SMTP avec vérification du certificat, données obligatoires vérifiées côté serveur, limite avec verrou fichier, erreurs SMTP détaillées uniquement dans le journal serveur.
- Pré-prod IONOS protégée : 401 sans identifiants sur l’entrée, le MP4 et l’endpoint PHP.
- SPF configuré pour IONOS ; DMARC présent en mode observation `p=none`. Ce dernier n’est pas à lui seul une anomalie ; durcir la politique exige de vérifier tous les expéditeurs autorisés.

## Contrôles restant à effectuer sur IONOS

Ils nécessitent la session protégée ou le panneau IONOS ; leur résultat ne peut pas être affirmé à partir du code local.

1. Version PHP réellement active et maintenue, extensions mbstring/OpenSSL, accès au fichier privé, display_errors désactivé, journaux accessibles à l’exploitant. La signature `never` exige au minimum PHP 8.1, mais une version encore maintenue doit être retenue ; consulter [les versions PHP supportées](https://www.php.net/supported-versions.php).
2. Envoi réel après rotation SMTP, arrivée en boîte, Reply-To, SPF/DKIM/DMARC dans les en-têtes d’un message reçu. DKIM non vérifié durant cet audit.
3. Compression/cache/en-têtes sur les vraies réponses authentifiées et prise en charge des requêtes Range pour les MP4. La protection 401 ne permet pas de vérifier le 206 attendu pour un segment vidéo.
4. Redirections HTTPS/www, vraie 404 et navigation au chemin final après remplacement de la page d’attente. Le `.htaccess` de protection créé par IONOS doit être conservé dans la pré-prod et ne pas être écrasé par le `.htaccess` minimal du build.
5. Sauvegarde de la page d’attente et de ses assets, paquet de release identifié par commit, possibilité de revenir à la version précédente. Aucun déploiement ni essai de restauration n’a été réalisé pendant l’audit.
6. Tests sur Safari iPhone et Chrome Android physiques : paysage, plein écran vidéo, clavier formulaire, zoom texte et lecteur d’écran. Les émulations locales ne couvrent pas ces appareils réels.

Les mentions légales, durées de conservation et contenus restent à la charge du client. Un point technique à lui transmettre : le stockage local `rusafe:video-access:v1` conserve l’état d’accès pendant 60 jours ; la politique devrait décrire cet usage, même en l’absence d’analytics. Ce rapport ne constitue pas une validation juridique des textes.

## Ordre de traitement proposé

1. **P0 — `$harden` :** rotation SMTP, retrait du suivi et traitement de l’historique, contrôle de secrets.
2. **P1 — `$harden` et `$adapt` :** HTTPS et correction de la scène vidéo en faible hauteur.
3. **P1 — `$colorize` et `$animate` :** contrastes, liens et slogan automatique.
4. **P2 — `$harden` et `$clarify` :** cas SMTP, validation du formulaire, secours sans JS, 404, noms accessibles et fiabilité du build/CI.
5. **P2 — `$optimize` :** cache, compression et petits gains de livraison ; conserver les bons résultats initiaux.
6. **P2/P3 — `$polish` :** sémantique, libellés et vérification finale visuelle FR/EN, puis nouvel audit ciblé des corrections.

Les corrections peuvent être traitées ensemble ou par lots, dans cet ordre. Cet audit n’a modifié aucun fichier applicatif ni la configuration distante. Les seuls fichiers ajoutés au projet sont ce rapport et ses preuves ; `dist/` a été régénéré. Les outils de test ont été installés dans un dossier temporaire sans dépendance ajoutée au projet.
