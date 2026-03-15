# Rouages - RPG Character Sheet (Realtime)

Feuille de personnage pour jeu de rôle, jouable dans un navigateur.

Le projet permet :
- gérer une feuille de personnage
- lancer des dés
- partager les résultats avec les autres joueurs

bientôt
- voir les fiches des autres joueurs (MJ)

Les données sont sauvegardées localement et synchronisées entre les clients via WebSocket.

---

## Fonctionnalités

- feuille de personnage éditable
- sauvegarde automatique (localStorage)
- lancer de dés avec système d'atout / pénalité
- historique des jets
- portrait par drag & drop
- liste des joueurs connectés
- synchronisation temps réel (WebSocket)

---

## Serveur WebSocket

Le serveur est volontairement minimal.

Il ne fait que **relayer les messages entre les clients**.

---

## Technologies

- JavaScript (ES6)
- WebSocket
- localStorage
- HTML / CSS

Pas de framework.

---

## Objectif du projet

Créer une feuille de personnage :

- simple
- autonome
- temps réel
- sans backend complexe

---

## Roadmap

- [x] synchronisation complète des fiches
- [ ] vue MJ
- [x] historique partagé des jets
- [x] gestion des connexions / déconnexions

---