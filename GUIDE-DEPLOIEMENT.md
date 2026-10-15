# IslamCraft v1.1 — Mettre le jeu en ligne (gratuit)

Ce que contient ce dossier :
- `client/` : le jeu (page d'accueil avec salles, jeu 3D, sons)
- `server/` : le serveur Node.js (Express + Socket.io), salles de 2 joueurs
- `render.yaml` : configuration automatique pour Render.com
- `.gitignore`

## Nouveautés par rapport à la v1.0
- **Salles** : chaque partie a un code (ex. `K7QZP`). Plusieurs duos peuvent jouer en même temps.
- **Lien à partager** : bouton « Copier le lien » dans le jeu.
- Le port est lu depuis l'hébergeur (`process.env.PORT`), route `/health` ajoutée.
- Serveur réécrit en code lisible (le code d'origine était obfusqué).
- Limite de fréquence des déplacements (même vitesse sur tous les écrans).
- Suppression de la découverte UDP mobile (inutile en ligne).

## Étape 1 — Mettre le code sur GitHub
1. Créez un compte sur https://github.com puis un dépôt vide « islamcraft » (public ou privé).
2. Cliquez « uploading an existing file » et glissez **le contenu** de ce dossier
   (`client`, `server`, `render.yaml`, `.gitignore`). Ne mettez pas `node_modules`.
3. Cliquez « Commit changes ».

## Étape 2 — Déployer sur Render
1. Créez un compte sur https://render.com (connexion avec GitHub possible).
2. « New + » → « Blueprint » → choisissez votre dépôt. Render lit `render.yaml` et configure tout.
   (Sinon : « New + » → « Web Service » → Root Directory `server`, Build `npm install`, Start `npm start`.)
3. Attendez 2-3 minutes. Vous obtenez une adresse : `https://islamcraft-xxxx.onrender.com`.

## Étape 3 — Jouer
1. Ouvrez l'adresse, cliquez « Créer une partie ».
2. Envoyez le lien (bouton « Copier le lien ») à votre ami.
3. Chacun entre son pseudo : la partie démarre à 2 joueurs.

## À savoir
- Offre gratuite Render : le serveur s'endort après ~15 min sans visite. La première visite met 30 à 60 s.
- Aucune installation de Node.js n'est nécessaire pour les joueurs.
- Le fichier `correct.mp3` est demandé par le jeu mais n'existait pas dans votre dossier :
  ajoutez-le dans `client/assets/sounds/` si vous voulez ce son (sans lui, le jeu fonctionne quand même).

## Jouer en local (comme avant)
```
cd server
npm install
npm start
```
puis ouvrir http://localhost:3000
