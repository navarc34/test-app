# test-app

# Déployer l'app + mesurer l'audience (GitHub Pages + Apps Script + Google Sheet)

## A. Côté Google (5 min) — le compteur

1. Crée un nouveau **Google Sheet** (vierge), titre-le par ex. « Suivi app contraction ».
2. Menu **Extensions → Apps Script**.
3. Supprime le contenu de l'éditeur et colle le code de `suivi-audience.gs`.
4. **Enregistrer** (icône disquette).
5. Clique sur **Déployer → Nouveau déploiement** :
   - Type : **Application Web**
   - *Exécuter en tant que* : **Moi**
   - *Qui a accès* : **Tout le monde** (nécessaire pour que l'app des élèves puisse appeler l'URL — sinon l'appel sera bloqué par une page de connexion Google).
6. **Autoriser** (Google te demande d'accorder la permission au script ; message « app non vérifiée » → Paramètres avancés → continuer : c'est ton propre script).
7. Copie l'**URL de l'application Web** fournie (du type `https://script.google.com/macros/s/…/exec`).
8. Teste-la : ouvre-la dans un onglet avec `?e=test` à la fin. Une ligne doit apparaître dans l'onglet « Suivi » du Sheet.

## B. Côté app (2 min) — brancher le compteur

1. Ouvre `index.html` dans un éditeur de texte.
2. Ligne 20, remplace :
   `const TRACK_URL = "COLLE_ICI_L_URL_DEPLOIEMENT_APPS_SCRIPT";`
   par :
   `const TRACK_URL = "https://script.google.com/macros/s/…/exec";` (ton URL de l'étape A7).
3. Enregistre. Tant que le placeholder n'est pas remplacé, l'app fonctionne mais ne mesure rien.

## C. Côté GitHub (10 min) — mettre en ligne

1. Crée un compte sur github.com (si besoin), puis **New repository** :
   - Nom : `app-contraction` (par ex.), visibilité **Public**.
2. **Add file → Upload files** : glisse `index.html` (modifié en B2).
3. **Commit changes**.
4. **Settings → Pages** : Source = **Deploy from a branch**, branche **main**, dossier **/ (root)** → **Save**.
5. Après 1-2 min, l'URL apparaît : `https://ton-pseudo.github.io/app-contraction/`
6. Ouvre-la, navigue dans un module, puis vérifie que deux lignes apparaissent dans le Sheet (« ouverture » puis « module »). Si oui : tout est branché. ✅

## D. Partager aux élèves

- Colle l'URL GitHub Pages dans Pronote / un QR code (attention : URL longue en HTTPS, génère le QR à partir de l'URL exacte).
- Les scores restent dans le navigateur de chaque élève (localStorage) : rien ne remonte, seuls les événements « ouverture » et « module » sont comptés.

## Ce qui est mesuré (et rien d'autre)

| Colonne | Contenu |
|---|---|
| Horodatage | date + heure de l'événement |
| Événement | `ouverture` (1 par session navigateur) ou `module` |
| Module | flash / quiz / vf / count / texte |
| Provenance | page d'où vient l'élève (souvent vide) |

**Aucune donnée personnelle** : pas de nom, pas d'IP enregistrée, pas de score individuel remonté. La mesure est purement anonyme — c'est l'esprit RGPD-friendly de la stratégie.

## Astuces de lecture du Sheet

- **Audience** = nombre de lignes « ouverture » (≈ 1 par session élève).
- **Modules les plus utilisés** = filtre sur la colonne Événement = « module », puis compter par Module.
- Crée un onglet « Bilan » avec un pivot (Insertion → Tableau croisé dynamique) pour avoir les visites par jour.
