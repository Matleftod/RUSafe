# Contenu anglais

La version française située à la racine du projet reste la source de référence.

Pour traduire une page, copiez son fichier HTML français dans ce dossier en conservant le même nom, puis traduisez uniquement son contenu. Le script de build utilisera automatiquement cette version anglaise à la place du contenu temporaire.

Les chemins restent identiques à ceux des sources françaises (`assets/`, `site.css`, `site.js`, etc.) : le build les adapte automatiquement aux dossiers `/fr/` et `/en/`.

Tant qu’une page anglaise n’existe pas ici, une copie française temporaire est générée sous `/en/` avec un avertissement visible et une directive `noindex`.
