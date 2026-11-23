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

## Version 18 — qualité locale et charge graphique

Le bouton ⚡ ouvre Auto, Fluide, Équilibré ou Détaillé, sur téléphone comme dans le menu hôte. Le choix reste enregistré sur cet appareil uniquement. Auto démarre prudemment selon les capacités disponibles et adapte la qualité vers le bas après deux fenêtres de trois secondes de rendu lent (moyenne supérieure à 27 ms). Le mode manuel reste stable. Aucune règle ni donnée réseau ne change.

Les filtres imbriqués du SVG des météorites sont supprimés, les particules passent de 54 à 12 en Fluide et à 21 en Équilibré. Les traînées effilées et les illustrations restent présentes. Le contour du tour reste visible sans animer son ombre en permanence sur les profils allégés. Le décor est dessiné à une résolution réduite et moins souvent; ses dimensions sont mises en cache via ResizeObserver. Les explosions de cartes utilisent une densité, une résolution et un plafond de particules adaptés; les flous Canvas sont désactivés sur les profils allégés. Les nouveaux niveaux de qualité sont appliqués à la table sans attendre une action réseau.

Mesure locale contrôlée dans le navigateur de bureau, scène mobile simulée de 390 × 844, échantillons de 6,5 secondes (aucune mesure physique sur téléphone ancien) : avant, moyenne 16,77 ms / p95 17,1 ms, 162 animations SVG et canvas 358 × 342; Équilibré, moyenne 17,08 ms / p95 17,1 ms, 63 animations SVG et canvas 269 × 257; Fluide, moyenne 16,68 ms / p95 17,1 ms, 36 animations SVG et canvas 179 × 171. Le poste était déjà proche de 60 FPS : ces mesures confirment la diminution de travail, sans démontrer un gain de FPS sur appareil faible. Les baisses automatiques et le maintien du réglage manuel sont couverts par des tests déterministes.

## Version 19 — profils du salon et effets de tour

Dans le salon, chaque téléphone peut modifier son pseudo et choisir l’un des 48 personnages avec le bouton Modifier mon nom et personnage. La place et le jeton de reconnexion sont conservés. La modification est validée par le pair hôte, publiée à tous les appareils et refusée après le démarrage. Le formulaire reste indépendant des mises à jour du salon; si la partie commence pendant sa saisie, il se ferme.

Une carte Saut produit un événement partagé : le joueur sauté est signalé avec un symbole et des couleurs corail, son nom reste visible pendant 1,45 seconde, puis le prochain joueur devient actif. L’inversion dure 1,9 seconde : les météorites accélèrent dans le sens initial, un anneau temporaire se forme, puis elles ralentissent dans le sens opposé. À deux joueurs, l’inversion signale également le joueur qui passe son tour. Le pair hôte bloque les nouveaux coups pendant ces transitions. Leur durée restante est transmise aux téléphones pour éviter de dépendre de l’heure de leur horloge. Une dernière carte d’action termine son effet avant l’écran de victoire.

Le vortex réutilise le SVG des météorites avec une animation de rotation et un anneau SVG temporaire, sans multiplication de sprites. Le mode Fluide simplifie l’anneau; la préférence de réduction des animations supprime la rotation accélérée et conserve l’annonce. Les limites de particules de la version 18 restent appliquées.

Les nouveaux salons décochent Contester les +4 par défaut; les +4 illégaux sont donc bloqués automatiquement. L’hôte peut cocher cette règle avant le départ. Les salons déjà créés conservent leurs règles.

Validation : tests du moteur pour l’édition et sa validation, le joueur sauté dans les deux sens et les interceptions; tests du transport pour la propagation des profils et le blocage des coups pendant une transition. Vérification visuelle locale à 390 × 844 avec le vrai rendu et un transport de démonstration : changement de pseudo et portrait, saut puis tour suivant, vortex puis sens antihoraire, sans erreur JavaScript observée.

## Version 20 — prêts, binômes et bots

Chaque téléphone dispose d’un bouton Je suis prêt dans le salon. Dès qu’au moins deux participants sont présents et que tous les humains en ligne sont prêts, un décompte partagé de trois secondes commence. Une bannière indique le temps restant et permet Pas prêt ! en permanence; cette action annule le départ. Le départ est bloqué si un joueur est absent, si un mode exige un bot manquant ou si les binômes sont incomplets. Un nouveau joueur, une suppression ou un changement des règles, du mode, des équipes ou du niveau d’un bot remet les humains à Pas prêt. Ouvrir son éditeur de profil retire également son statut Prêt. L’hôte conserve le démarrage manuel, désactivé pendant le décompte. Le navigateur hôte programme le départ et transmet une durée restante aux téléphones, sans exiger des horloges synchronisées. Après une reconnexion de l’hôte, le décompte est annulé.

Le choix du mode est disponible dans la préparation côté hôte : Chacun pour soi, Équipes de 2, Contre les bots. Les équipes demandent au moins quatre participants et un nombre pair, jusqu’à 32 participants (16 binômes). Le téléphone choisit son équipe; l’hôte peut aussi la modifier sur les fiches des joueurs. Choisir une équipe déjà complète échange une place, ce que précise l’interface. Les partenaires sont espacés dans l’ordre de jeu. Chaque téléphone voit une bande de cartes de son équipier au-dessus de sa propre main; les cartes alliées restent non interactives. Le pair hôte et les adversaires ne reçoivent pas cette main. Dès qu’une main est vide, son binôme gagne; les points des mains adverses sont accordés aux deux partenaires et affichés une seule fois par équipe. Les cartes restantes du partenaire ne comptent pas dans ce score.

Contre les bots ajoute un bot Moyen par défaut et permet d’ajouter d’autres bots ou de modifier leurs niveaux : Facile, Moyen, Difficile. Un humain sur téléphone et un bot suffisent pour jouer. Les bots sont aussi disponibles en équipe. Ils occupent une place parmi les 32, sont toujours prêts et acceptent automatiquement une revanche. Ils jouent depuis le navigateur hôte, à un rythme lisible et après les animations de saut ou d’inversion; aucune instance Node ni API d’IA hébergée n’est nécessaire. Le module `public/bots.js` reçoit uniquement une vue de joueur : main propre, état public et éventuellement main du partenaire. Il ne consulte jamais la pioche ou les mains ennemies. Facile choisit au hasard et peut manquer une occasion; Moyen privilégie ses couleurs et conserve ses jokers; Difficile tient aussi compte des petits compteurs adverses, des correspondances futures et du partenaire. Les bots gèrent la pioche, la carte piochée, les pénalités et NOVA; Difficile peut attraper un NOVA oublié adverse.

Validation : 45 tests, dont départ à trois secondes et annulation, démarrage automatique réel du transport simulé PeerJS, bot automatique du pair hôte, confidentialité entre équipes, victoire et score du binôme, rendu de la main alliée non interactive et 24 manches complètes pilotées par les trois stratégies avec conservation de toutes les cartes. Vérification visuelle locale à 390 × 844 : annulation du décompte, départ automatique, main du partenaire, contrôles et niveaux des bots côté hôte. Les captures de démonstration utilisent le rendu de production avec un transport local de vérification; elles ne constituent pas un nouveau test de WebRTC physique entre téléphones.

## Version 21 — format et bots indépendants, configuration depuis le téléphone solo

Le format propose Chacun pour soi ou Équipes de 2 · 2v2, avec une case indépendante Jouer avec des bots. Le joueur seul peut régler ces options depuis son téléphone, ainsi que la difficulté. En chacun pour soi, activer les bots ajoute au moins un adversaire, avec possibilité d’en ajouter. En 2v2 solo, exactement trois bots sont préparés : un partenaire et deux adversaires. Désactiver les bots les retire et laisse le salon attendre d’autres humains. Le niveau reste Moyen par défaut. Le pair hôte valide l’autorisation : dès qu’il y a plusieurs humains, seul l’hôte règle la composition générale. Les réglages annulent le statut Prêt; le décompte reste donc volontaire. L’ancien mode interne bots reste accepté pour compatibilité, mais les nouveaux réglages utilisent le format classique ou équipes et la présence de bots séparément.

Validation : 46 tests réussis, dont un scénario du transport pour l’autorisation du joueur seul, le passage chacun pour soi → 2v2 avec trois bots, le retrait des bots et le refus de modifier le salon après l’arrivée d’un autre humain. Vérification visuelle locale des options 2v2, du niveau Moyen et de la désactivation des bots sur téléphone.

## Version 22 — sons, réactivité, arrivée du tour et feu des météorites

Les six fichiers fournis par l’utilisateur sont intégrés dans `public/sounds/` :

| Événement | Fichier source | Asset du jeu |
|---|---|---|
| Piocher | oxidvideos-taking-playing-card-522520.mp3 | draw-card.mp3 |
| Départ d’une carte au clic | freesound_community-card-sounds-35956.mp3 | play-card.mp3 |
| Arrivée d’une carte ordinaire | rescopicsound-modern-interface-swoosh-whoosh-small-02-230467.mp3 | card-land.mp3 |
| Changement de couleur | sdanezis-futuristic-cyber-glitch-whoosh-transition-1-609675.mp3 | change-color.mp3 |
| Arrivée d’un +2 ou +4 | dariocoiro-transition-sound-fx-530749.mp3 | penalty-impact.mp3 |
| Inversion du sens | dragon-studio-drop-the-bass-463664.mp3 | reverse.mp3 |

Les sons sont préchargés, décodés une fois et joués via Web Audio avec une demande de faible latence. Les premières millisecondes silencieuses sont ignorées à la lecture, sans modifier les MP3 d’origine : mesure locale des débuts utiles à environ 20 ms (départ), 27 ms (pioche), 186 ms (arrivée), 24 ms (pénalité), 11 ms (inversion) et 20 ms (couleur). Le départ d’une carte est anticipé au clic sur une carte jouable; un joker attend la validation de la couleur. Une pioche connue de deux ou quatre cartes programme autant de lectures dès le clic, espacées de 90 ms. Les confirmations réseau sont réconciliées pour ne pas répéter le son. Les cartes réellement gagnées sur une pioche variable ou une autre pénalité sont comptées par différence de main. Le son d’impact est programmé à la fin des 650 ms de vol, immédiatement si la réduction des animations désactive ce vol. Un +2 ou +4 remplace le whoosh normal par le son de pénalité. Les +2 cumulés utilisent des vitesses de lecture et pitchs croissants (1, 1.12, 1.24, etc.), puis reviennent à 1 après résolution. Les sons sont actifs après une interaction autorisée par le navigateur, avec un bouton de coupure sur le téléphone et dans les commandes hôte; le choix est mémorisé et la musique reste indépendante. Les anciens bips génériques du fil ne doublent plus ces effets.

À l’arrivée d’un tour, quatre traits jaunes se rejoignent autour du portrait actif, puis forment un cadre avec deux impulsions brèves. Le téléphone actif affiche également une courte impulsion jaune sur son contour. Après Saut ou Inversion, cet effet attend la fin de la transition partagée. La réduction des animations conserve un cadre fixe. Les météorites possèdent une lueur de feu dorée-orangé sur leur face avant; la lueur est fixe en mode Fluide et ne dépend d’aucun gros filtre de flou.

À la demande de l’utilisateur, les +4 sont libres par défaut : une carte de la couleur active en main ne les interdit plus. L’hôte peut cocher Appliquer la règle classique du +4 avant la partie. Cette variante exige alors de ne pas avoir de carte de la couleur active; la contestation peut être activée séparément dans ce mode et est désactivée en mode libre. Le +4 libre ne permet pas de jouer hors tour, de cumuler les +4 ou d’éviter une pénalité. Le joker simple reste jouable sur toute couleur à son tour, même avec cette couleur en main. Un clic sur une carte bloquée indique la raison (tour d’un autre joueur, pénalité, couleur de départ, carte piochée uniquement ou règle classique du +4). Les salons sauvegardés sans réglage de +4 migrent vers le mode libre, en conservant une éventuelle pénalité de quatre cartes mais sans contestation résiduelle.

Validation : 57 tests réussis, dont comptage exact des sons, absence de doublons, progression du pitch, début Web Audio sans attente réseau, planification des impacts, mise en cache des six sons, coupure des sources, joker simple sur toutes les couleurs et variantes du +4. Vérification dans le navigateur avec le vrai moteur/rendu et un transport de démonstration retardé de 220 ms : six buffers décodés, deux lectures pour une pioche de deux cartes, départ au clic avant l’état réseau, arrivée planifiée à 650 ms, son de couleur unique, deuxième impact +2 à 1.12 et Drop the Bass à l’inversion. La sortie acoustique et la latence physique des téléphones n’ont pas été mesurées; le contexte de bureau annonçait une latence de base de 10 ms. Les cadres jaunes et les trois reflets de feu sont présents dans le rendu mobile.
