# NOVA! — Chaos en orbite

Jeu de cartes multijoueur en français, 2 à 32 joueurs. **100 % statique, hébergé sur GitHub Pages. Aucun serveur Node.js à installer ou déployer.** L’écran partagé est l’hôte WebRTC; les téléphones sont ses pairs.

## Publier sur GitHub Pages

Le workflow `.github/workflows/pages.yml` publie automatiquement `public/` après chaque push sur `main`.

Dans le dépôt : **Settings → Pages → Source : GitHub Actions**. Le site sera accessible à https://tommyaudetcontact-wq.github.io/uno/ après le déploiement réussi.

Aucune variable d’environnement, base de données, clé API ou commande de build. Les fichiers de jeu sont tous dans `public/`. Node n’est utilisé qu’en développement pour les tests automatisés, jamais par le site.

## Jouer

1. Ouvrir le site sur la télé ou l’ordinateur et choisir « Créer une partie ».
2. Chaque joueur scanne le QR avec son téléphone, choisit son pseudo et son avatar.
3. L’hôte lance la manche. Les téléphones affichent leur main; l’écran partagé affiche les cartes jouées, les compteurs et le fil d’actions.
4. Garder l’écran hôte allumé et ouvert pendant la partie. Utiliser un appareil ou profil de navigateur distinct par joueur.

Pour un aperçu local, servir `public/` avec n’importe quel serveur de fichiers statiques, par exemple `python -m http.server 3000 --directory public`, puis ouvrir `http://localhost:3000`. Les téléphones doivent utiliser l’URL HTTPS de GitHub Pages; WebRTC et Web Crypto demandent un contexte sécurisé (HTTPS ou localhost).

## Comment le P2P fonctionne

PeerJS établit des **DataChannels WebRTC chiffrés** entre l’hôte et les joueurs. Un service de signalisation PeerServer Cloud et des services STUN aident les navigateurs à se trouver; **ce sont des services externes**, pas un backend de jeu à héberger. Les actions et les mains passent directement entre l’hôte et les téléphones. Les bibliothèques PeerJS et QR sont incluses dans le dépôt, pas chargées depuis un CDN.

Le P2P Internet ne peut pas promettre zéro infrastructure externe : sans signalisation et traversée NAT, des téléphones ne se découvrent pas automatiquement avec un simple code de salon. Cette version utilise le service public gratuit de PeerJS. Certains réseaux restrictifs, VPN ou NAT peuvent empêcher une connexion directe; essayer le même Wi-Fi ou un autre réseau. Aucun relais TURN privé n’est configuré. La disponibilité du service de signalisation n’est pas garantie par ce projet.

Documentation : https://peerjs.com/client/faq et https://peerjs.com/server/cloud.

## Confidentialité et reconnexion

L’hôte valide les coups et ne transmet à chaque téléphone que sa main privée. Les autres joueurs reçoivent uniquement les compteurs. L’interface de l’hôte ne montre aucune main. **L’hôte doit être de confiance : son navigateur possède l’état complet de la partie**, comme toute architecture P2P avec un arbitre unique.

Le navigateur conserve le jeton du joueur pour reconnecter après un rafraîchissement. La partie de l’hôte est conservée dans `sessionStorage` pour reprendre après un rafraîchissement du même onglet. Une fermeture définitive de l’onglet hôte perd la partie. Il n’y a pas de migration automatique d’hôte. Les déconnexions sont affichées; les absents conservent leur place. L’hôte peut retirer un joueur avant ou après une manche. Un joueur ne peut pas entrer en cours de manche.

Ne pas partager son profil de navigateur. Deux onglets de la même origine partagent la session; utiliser un appareil ou un profil par joueur.

## Règles et options

Paquet de 108 cartes en mode classique (2–10 joueurs), plusieurs paquets automatiques au-delà de 10, 7 cartes par joueur, correspondance couleur/chiffre/symbole, saut, inversion, +2, joker, +4 avec contestation, annonce NOVA et pénalité de dernière carte oubliée, recyclage de la pioche, scores et revanche. Les effets de la carte d’ouverture sont appliqués; un +4 d’ouverture est remélangé. Le donneur tourne. Objectif classique : 500 points, puis nouvelle partie et remise à zéro.

Options maison désactivées par défaut : interception avec carte exactement identique, cumul des +2, pioche jusqu’à carte jouable. Le +4 ne se cumule pas. Pas de 7–0, échange de mains, cartes personnalisées, IA ou mode solo. Les règles précises sont disponibles dans le jeu au bouton « ? ».

Référence des règles : https://service.mattel.com/instruction_sheets/W2085-UNO.pdf.

## Tests de développement (optionnels)

```sh
node --test
```

Le moteur de production est `public/engine.js`; le fichier racine le réexporte pour les tests. Le navigateur utilise Web Crypto, sans dépendance Node. Les tests vérifient les règles, les vues privées et 50 manches simulées avec conservation des 108 cartes.

## Visuels et licences

Univers et illustrations originaux : arène tropicale dans l’espace, axolotl explorateur, robot cyan, créature végétale et renard alien mécanicien. Images créées avec ImageGen intégré, prompts dans `ART-PROMPTS.txt`; cartes composées en CSS à partir de ces illustrations. Aucune illustration ou personnage repris des franchises de référence.

PeerJS et qrcodejs : MIT, licences incluses dans `public/`. Polices Barlow Condensed et DM Sans incluses dans le dépôt avec leurs licences OFL; aucune requête Google Fonts au chargement. Sons synthétisés dans le navigateur, activables par le joueur.

## Grands salons et validation

Limite : 32 joueurs. Les salons de plus de 10 joueurs utilisent automatiquement plusieurs paquets et constituent une variante de groupe. Le moteur et la distribution sont testés à 11, 16 et 32 joueurs. Le transport est testé automatiquement avec des pairs simulés; une vraie liaison WebRTC hôte + deux joueurs, les coups et la reconnexion après rafraîchissement de l’hôte ont été vérifiés dans le navigateur. Les performances à 32 appareils physiques ne sont pas garanties sans un essai sur les appareils et réseaux concernés. Un ordinateur récent est préférable pour héberger un grand salon.

Présentation et retours visuels étudiés à partir du gameplay Ubisoft : https://www.youtube.com/watch?v=olm7zZ6V0pk. Univers et interface propres à NOVA; il ne s’agit pas d’une reproduction du jeu Ubisoft.

## Effets visuels

Canvas additif : particules lumineuses à traînées, sprites de halo, ondes concentriques, arcs électriques et vortex sur les cartes spéciales; supernovas et feux cosmiques sur NOVA et la victoire. La boucle s’arrête quand les effets sont finis et quand l’onglet est masqué. Densité et résolution limitées sur mobile; préférence de réduction des animations respectée. Les effets ne bloquent aucun contrôle.

Le décor illustré conserve son image originale; des couches Canvas ajoutent vaisseaux à propulsion turquoise, étoiles filantes et scintillements lents. Ces éléments restent derrière les cartes. Ils s’arrêtent dans les onglets masqués et respectent la réduction des animations.

L’hôte peut activer ou désactiver « Contester les +4 » avant le départ et entre les manches. Désactivé : aucun bouton de contestation, pas de bluff; un +4 est bloqué si son auteur possède la couleur active. Le joueur ciblé pioche quatre et passe.


## Interface arène (version 6)

Pendant la manche, l’hôte affiche une arène qui remplit toute la fenêtre : avatars autour de la table, compteurs de mains, joueur actif lumineux, pioche et défausse empilée. Aucune face de carte privée n’est rendue sur l’hôte. Des météorites illustrées tournent dans le sens actuel, avec des traînées lumineuses animées. Les cartes piochées et la distribution voyagent de la pioche aux portraits; les cartes jouées rejoignent la pile centrale.

Le hamburger en haut à droite ouvre les commandes hôte. Le fil de partie est masqué par défaut, activable dans ce menu; son affichage ne concerne que cet écran. Le plein écran du navigateur reste une action disponible dans le menu. Sur téléphone, seule la main personnelle apparaît en éventail; les adversaires sont représentés par leur avatar et un compteur.

La couleur active se reflète dans la lumière de la planète, les cristaux et les plateformes du décor, y compris après une faille cosmique. Les 48 portraits originaux (explorateurs, robots, princesses et créatures) sont intégrés dans `public/avatars.png`, générés avec ImageGen intégré. Aucun personnage de franchise n’a été repris.

Dans le menu hamburger, l’hôte peut terminer la partie : tous les appareils reviennent au salon, les mains et les scores sont remis à zéro, sans gagnant. Les joueurs, avatars, connexions et règles restent disponibles pour relancer une partie. Seul le jeton hôte autorise cette action.

## Musique

Arcade Rush et Quantum Dash, fichiers fournis par l’utilisateur, sont inclus dans `public/music/`. Le bouton ♬ ouvre le lecteur dans l’accueil et le salon; le menu hôte contient les mêmes commandes en partie. Lecture/pause, piste et volume sont réglables. Les deux morceaux s’enchaînent en boucle. La musique continue pendant les changements de vue, sur cet appareil uniquement; elle ne démarre pas automatiquement sur les téléphones. Le navigateur peut demander une première action sur Écouter.

## Lisibilité du tour et des jokers

Le téléphone du joueur actif affiche un cadre lumineux sur tout le contour et un bandeau « À TOI DE JOUER ! ». Le cadre reste visible pendant son tour puis disparaît; sa pulsation est désactivée si la réduction des animations est demandée. Les jokers posés prennent la couleur choisie, y compris dans la défausse. Un joker repris à la pioche redevient multicolore dans la main.

La pioche du téléphone est lumineuse dès qu’elle est disponible, et devient dorée avec « PIOCHER MAINTENANT » lorsqu’aucun coup n’est jouable. Les pénalités affichent leur quantité. Les flèches ont un tracé lumineux épais sur un contour sombre; le grand bandeau hôte montre l’avatar et le nom du joueur actif.

Version 15 : les flèches sont remplacées par des météorites à traînées lumineuses. Le joueur actif et le prochain sont indiqués autour de la table et dans la liste mobile ordonnée. Le choix de couleur montre la main restante et laisse son éventail visible.


## Version 16

32 nouveaux personnages sont ajoutés aux 16 existants. Les anciens indices restent compatibles. Riff est un marsupial aventurier original, Capitaine Zenith un ranger spatial original. Le nouvel atlas 8 × 4 est `public/avatars-expansion.png`; les météorites utilisent `public/meteor.png`. Images créées avec ImageGen intégré : portraits 3D colorés de créatures et explorateurs cosmiques, et roche violette incandescente avec cristaux dorés sur fond transparent. Les traînées sont animées séparément (flux, pulsation et étincelles), avec réduction des animations prise en compte.

La pioche est reculée en haut à gauche et réduite; la défausse garde le centre. Le bouton NOVA apparaît uniquement lorsqu’une carte reste en main. La dernière carte dispose de 1,5 seconde pour son animation avant le résultat. Après chaque manche, les téléphones peuvent voter pour rejouer ou retirer leur vote; le compteur et les votes sont visibles sur tous les écrans. L’unanimité de tous les joueurs inscrits (y compris momentanément déconnectés) relance automatiquement la manche, avec sept cartes et les mêmes règles. Les scores sont conservés jusqu’à 500 points, puis remis à zéro. L’hôte garde aussi sa commande de lancement.

Les nouveaux salons activent par défaut le jeu à la volée et le cumul des +2; les réglages restent modifiables avant le départ. Les salons déjà ouverts conservent leurs réglages.

Version 17 : sillage effilé derrière la roche, flux des particules à l’opposé du déplacement, opacité et taille décroissantes vers la pointe. Toutes les roches sont dessinées après toutes les traînées pour garantir leur superposition.
