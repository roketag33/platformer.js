# PixiGame

Un jeu de plateforme 2D développé avec PixiJS.

## Structure du Projet

```
pixigame/
├── public/              # Ressources statiques
│   └── assets/          
│       └── images/      # Images du jeu
├── src/                 # Code source
│   ├── core/            # Logique fondamentale du jeu
│   │   ├── game.ts      # Classe principale du jeu
│   │   └── level.ts     # Gestion des niveaux
│   ├── entities/        # Entités du jeu
│   │   ├── player.ts    # Joueur 
│   │   ├── enemy.ts     # Ennemis
│   │   ├── platform.ts  # Plateformes
│   │   ├── collectible.ts # Objets à collecter
│   │   └── powerup.ts   # Power-ups
│   ├── ui/              # Interface utilisateur
│   │   └── ui.ts        # UI du jeu
│   ├── index.ts         # Point d'entrée
│   └── style.css        # Styles CSS
├── index.html           # Page HTML
└── package.json         # Configuration du projet
```

## Installation

```bash
yarn install
```

## Démarrage

```bash
yarn dev
``` 