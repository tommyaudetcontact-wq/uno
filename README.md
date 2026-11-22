# NOVA! — Chaos en orbite

Jeu de cartes web multijoueur en français, pour 2 à 10 personnes. L’écran de l’hôte affiche la table et le fil de partie. Chaque joueur scanne le QR et garde sa main sur son téléphone.

## Jouer tout de suite en local

Installer Node.js 20 ou plus, puis depuis ce dossier :

```sh
node server.js
```

Aucune dépendance à installer. Ouvrir **l’adresse réseau affichée dans le terminal**, par exemple `http://192.168.0.199:3000`, sur l’écran partagé. Créer une partie; les téléphones, sur le même Wi-Fi, scannent le QR. Au moins deux joueurs doivent rejoindre avant de lancer. Autoriser Node sur le réseau privé si Windows le demande. Ne pas ouvrir l’écran partagé avec `localhost` pour générer un QR destiné aux téléphones.

## Hébergement Internet recommandé

Le dépôt GitHub contient tout le jeu. Un hébergeur **Node persistant** est nécessaire : GitHub Pages seul ne peut pas synchroniser les mains et les tours.

- Sur Render, créer un Blueprint depuis ce dépôt (`render.yaml` fourni), ou un Web Service Node avec `node --check server.js` comme commande de build et `node server.js` comme commande de démarrage.
- Le serveur utilise `PORT` de l’hébergeur, écoute sur `0.0.0.0` et sert aussi l’interface. Ouvrir son URL HTTPS : le QR utilisera automatiquement cette URL. Aucun secret ni clé API nécessaire.
- Un Dockerfile est fourni pour un autre hébergeur. Le reverse proxy doit autoriser les connexions SSE et désactiver leur buffering.
- Un seul processus / une seule instance : les salons sont en mémoire. Un redémarrage efface les parties. Un service qui se met en veille n’est pas adapté à une soirée ininterrompue; choisir sa formule en conséquence.

## GitHub Pages pour l’interface (optionnel)

Le plus simple est de tout servir depuis Node. Pour séparer les deux :

1. Déployer d’abord le serveur Node en HTTPS.
2. Mettre son URL dans `public/config.js`, par exemple `window.NOVA_SERVER = 'https://votre-serveur.example';`.
3. Publier le contenu de `public/` avec GitHub Pages. Le workflow `.github/workflows/pages.yml` est manuel; il publie uniquement l’interface. Dans Settings → Pages, sélectionner GitHub Actions.
4. Définir `ALLOWED_ORIGIN=https://tommyaudetcontact-wq.github.io` sur le serveur pour restreindre CORS à cette origine.

Ne pas confondre dépôt exporté et service Internet déployé : le multijoueur n’est accessible sur Internet qu’après le lancement du serveur.

## Règles

108 cartes, 7 distribuées, correspondance couleur/chiffre/symbole; jokers, inversion, saut, +2, +4 avec contestation, annonce NOVA et pénalité d’oubli, recyclage de la pioche, score et revanche. En tête de manche, l’ouverture est toujours numérique. Les règles intégrées au bouton « ? » explicitent le comportement exact.

Options maison indépendantes : jeu à la volée avec carte identique, cumul des +2, pioche jusqu’à une carte jouable. Le +4 ne se cumule pas. Les variantes 7–0, échange de mains et cartes personnalisées ne font pas partie de cette version.

## Confidentialité et fonctionnement

Le serveur est l’autorité : validation de chaque coup avant mutation. Les flux privés ne contiennent que la main du joueur authentifié par un jeton aléatoire. Les autres voient des compteurs; l’hôte ne reçoit aucune main. Le code de salon permet de rejoindre uniquement avant le début. Le jeton est conservé dans le navigateur pour reconnecter après un rafraîchissement; ne pas partager son profil de navigateur. Les participants d’une même origine partagent une session : utiliser un appareil/profil distinct par joueur.

Les salons sans connexion expirent après 6 heures d’inactivité. Les pseudos et scores ne sont pas sauvegardés sur disque. Les absents conservent leur place pour pouvoir se reconnecter; aucun remplacement ni passage automatique en cours de manche. L’hôte peut retirer un joueur avant le départ ou à la fin. Pas d’IA ni de mode solo.

## Vérification

```sh
node --test
```

Tests des règles, de 50 manches complètes, de la conservation des cartes, des accès API et de la séparation des vues publiques/privées. Interface vérifiée avec un écran hôte et deux sessions de joueurs dans le navigateur. Une partie sur plusieurs téléphones physiques reste à faire sur le réseau d’hébergement final.

## Visuels

Univers original, sans personnages ou illustrations repris des franchises citées comme inspiration. Illustrations générées avec l’outil ImageGen intégré : `public/arena.png` (îles tropicales spatiales et gadgets, centre dégagé) et `public/mascots.png` (atlas 2×2 : axolotl explorateur, robot cyan, créature végétale, renard alien violet). Les cartes sont composées en CSS avec ces illustrations et des valeurs lisibles, jamais du texte peint dans les images. Prompts de production dans `ART-PROMPTS.txt`.

Le QR est généré localement avec qrcodejs (MIT), sa licence est incluse. Polices Barlow Condensed et DM Sans via Google Fonts; polices système de secours. Sons synthétisés dans le navigateur, activables par le joueur. Aucun son externe.
