import * as PIXI from 'pixi.js';
import { Game } from './core/game';

// Dans PixiJS v8, l'initialisation doit être asynchrone
async function init() {
    try {
        const game = new Game();
        await game.start();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du jeu:', error);
    }
}

window.onload = init; 