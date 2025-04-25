import { Game } from './game';
import * as PIXI from 'pixi.js';

interface PlayerScore {
    name: string;
    score: number;
    level: number;
    date: string;
}

export class ScoreManager {
    game: Game;
    localStorageKey: string;
    highScores: PlayerScore[];
    maxScores: number;
    
    constructor(game: Game) {
        this.game = game;
        this.localStorageKey = 'pixiGameHighScores';
        this.highScores = [];
        this.maxScores = 10; // Nombre maximum de scores à conserver
        
        this.loadScores();
    }
    
    loadScores() {
        try {
            // Essayer de charger les scores depuis le localStorage
            const savedScores = localStorage.getItem(this.localStorageKey);
            
            if (savedScores) {
                this.highScores = JSON.parse(savedScores);
                console.log("Scores chargés :", this.highScores);
            } else {
                // Initialiser avec des scores vides
                this.highScores = [];
                console.log("Aucun score trouvé, initialisation d'une liste vide");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des scores :", error);
            this.highScores = [];
        }
    }
    
    saveScores() {
        try {
            // Enregistrer les scores dans le localStorage
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.highScores));
            console.log("Scores sauvegardés");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des scores :", error);
        }
    }
    
    addScore(name: string, score: number, level: number) {
        // Créer un nouvel enregistrement de score
        const newScore: PlayerScore = {
            name,
            score,
            level,
            date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
        };
        
        // Ajouter le score à la liste
        this.highScores.push(newScore);
        
        // Trier les scores (du plus élevé au plus bas)
        this.highScores.sort((a, b) => b.score - a.score);
        
        // Limiter à maxScores entrées
        if (this.highScores.length > this.maxScores) {
            this.highScores = this.highScores.slice(0, this.maxScores);
        }
        
        // Sauvegarder les scores modifiés
        this.saveScores();
        
        // Retourner la position dans le classement (0-indexé)
        return this.highScores.findIndex(s => s === newScore);
    }
    
    isHighScore(score: number): boolean {
        // Vérifier si le score peut entrer dans le classement
        if (this.highScores.length < this.maxScores) {
            return true; // Il y a encore de la place
        }
        
        // Vérifier si le score est meilleur que le dernier du classement
        const lowestScore = this.highScores[this.highScores.length - 1].score;
        return score > lowestScore;
    }
    
    getHighScores(): PlayerScore[] {
        return [...this.highScores]; // Retourne une copie pour éviter la modification directe
    }
    
    clearScores() {
        this.highScores = [];
        this.saveScores();
    }
    
    // Créer un tableau de scores pour l'affichage
    createScoreTable(): PIXI.Container {
        // Supprimer tout tableau de scores existant
        const existingTable = this.game.app.stage.getChildByName('scoreTableContainer');
        if (existingTable) {
            this.game.app.stage.removeChild(existingTable);
        }
        
        const container = new PIXI.Container();
        container.name = 'scoreTableContainer';
        
        // Titre du tableau
        const title = new PIXI.Text('Meilleurs Scores', {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold'
        });
        title.anchor.set(0.5, 0);
        title.position.set(this.game.app.screen.width / 2, 50);
        container.addChild(title);
        
        // Entêtes de colonnes
        const headerStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fontWeight: 'bold',
            fill: ['#FFFF00'],
            stroke: '#000000',
            strokeThickness: 3
        });
        
        const headers = ['Rang', 'Nom', 'Score', 'Niveau', 'Date'];
        const headerWidths = [60, 200, 100, 80, 100];
        let headerX = 50;
        
        headers.forEach((header, index) => {
            const text = new PIXI.Text(header, headerStyle);
            text.x = headerX;
            text.y = 80;
            container.addChild(text);
            headerX += headerWidths[index];
        });
        
        // Lignes de scores
        const rowStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: ['#FFFFFF'],
            stroke: '#000000',
            strokeThickness: 2
        });
        
        const highlightStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: ['#00FFFF'],
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Fond pour les rangées
        const rowHeight = 40;
        const tableWidth = headerWidths.reduce((sum, width) => sum + width, 50);
        
        for (let i = 0; i < this.highScores.length; i++) {
            const y = 120 + i * rowHeight;
            
            // Fond de ligne alterné
            const rowBackground = new PIXI.Graphics();
            
            if (i % 2 === 0) {
                rowBackground.beginFill(0x333333, 0.5);
            } else {
                rowBackground.beginFill(0x666666, 0.5);
            }
            
            rowBackground.drawRect(40, y - 5, tableWidth, rowHeight);
            rowBackground.endFill();
            container.addChild(rowBackground);
            
            const score = this.highScores[i];
            const style = i < 3 ? highlightStyle : rowStyle; // Mettre en évidence les 3 premiers
            
            // Rangée de score
            const columns = [
                (i + 1).toString(), // Rang
                score.name,
                score.score.toString(),
                score.level.toString(),
                score.date
            ];
            
            let colX = 50;
            
            columns.forEach((text, index) => {
                const scoreText = new PIXI.Text(text, style);
                scoreText.x = colX;
                scoreText.y = y;
                container.addChild(scoreText);
                colX += headerWidths[index];
            });
        }
        
        // Si aucun score, afficher un message
        if (this.highScores.length === 0) {
            const noScoreStyle = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 24,
                fontStyle: 'italic',
                fill: ['#CCCCCC'],
                stroke: '#000000',
                strokeThickness: 2
            });
            
            const noScoreText = new PIXI.Text('Aucun score enregistré', noScoreStyle);
            noScoreText.anchor.set(0.5);
            noScoreText.x = this.game.width / 2;
            noScoreText.y = 200;
            container.addChild(noScoreText);
        }
        
        // Bouton pour retourner au menu
        const buttonContainer = this.createButton('Retour au Menu', this.game.width / 2, this.game.height - 80, () => {
            if (container.parent) {
                container.parent.removeChild(container);
            }
            this.game.returnToMainMenu();
        });
        
        container.addChild(buttonContainer);
        
        return container;
    }
    
    createButton(text: string, x: number, y: number, callback: () => void): PIXI.Container {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        
        // Créer le fond du bouton
        const background = new PIXI.Graphics();
        background.beginFill(0x0066CC);
        background.lineStyle(4, 0x0033AA);
        background.drawRoundedRect(-100, -25, 200, 50, 15);
        background.endFill();
        
        // Créer le texte du bouton
        const buttonText = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xFFFFFF,
            align: 'center'
        });
        buttonText.anchor.set(0.5);
        
        // Ajouter les éléments au container
        container.addChild(background);
        container.addChild(buttonText);
        
        // Rendre le bouton interactif
        container.eventMode = 'static';
        container.cursor = 'pointer';
        
        // Effets visuels au survol
        container.on('pointerover', () => {
            background.tint = 0x00AAFF;
            container.scale.set(1.05);
        });
        
        container.on('pointerout', () => {
            background.tint = 0xFFFFFF;
            container.scale.set(1.0);
        });
        
        // Déclencher le callback au clic
        container.on('pointerdown', callback);
        
        return container;
    }
    
    // Afficher la boîte de dialogue pour entrer un nom
    showNameInputDialog(score: number, level: number): PIXI.Container {
        // Supprimer tout tableau de scores existant
        const existingTable = this.game.app.stage.getChildByName('scoreTableContainer');
        if (existingTable) {
            this.game.app.stage.removeChild(existingTable);
        }
        
        const container = new PIXI.Container();
        
        // Fond semi-transparent
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.7);
        background.drawRect(0, 0, this.game.width, this.game.height);
        background.endFill();
        container.addChild(background);
        
        // Boîte de dialogue
        const dialog = new PIXI.Graphics();
        dialog.beginFill(0x333333);
        dialog.lineStyle(4, 0x666666);
        dialog.drawRoundedRect(this.game.width / 2 - 200, this.game.height / 2 - 150, 400, 300, 20);
        dialog.endFill();
        container.addChild(dialog);
        
        // Titre
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: 'bold',
            fill: ['#FFFFFF'],
            stroke: '#000000',
            strokeThickness: 4
        });
        
        const title = new PIXI.Text('Nouveau Score!', titleStyle);
        title.anchor.set(0.5, 0);
        title.x = this.game.width / 2;
        title.y = this.game.height / 2 - 130;
        container.addChild(title);
        
        // Texte du score
        const scoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: ['#FFFF00'],
            stroke: '#000000',
            strokeThickness: 3
        });
        
        const scoreText = new PIXI.Text(`Score: ${score} - Niveau: ${level + 1}`, scoreStyle);
        scoreText.anchor.set(0.5, 0);
        scoreText.x = this.game.width / 2;
        scoreText.y = this.game.height / 2 - 80;
        container.addChild(scoreText);
        
        // Instructions
        const instructionStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: ['#FFFFFF']
        });
        
        const instructionText = new PIXI.Text("Entrez votre nom:", instructionStyle);
        instructionText.anchor.set(0.5, 0);
        instructionText.x = this.game.width / 2;
        instructionText.y = this.game.height / 2 - 30;
        container.addChild(instructionText);
        
        // Champ de saisie (simulation)
        const inputBox = new PIXI.Graphics();
        inputBox.beginFill(0xFFFFFF);
        inputBox.drawRect(this.game.width / 2 - 150, this.game.height / 2 + 10, 300, 40);
        inputBox.endFill();
        container.addChild(inputBox);
        
        const inputText = new PIXI.Text("", {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: ['#000000']
        });
        inputText.x = this.game.width / 2 - 140;
        inputText.y = this.game.height / 2 + 20;
        container.addChild(inputText);
        
        // Créer un curseur clignotant
        const cursor = new PIXI.Text("|", {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: ['#000000']
        });
        cursor.x = inputText.x;
        cursor.y = inputText.y;
        container.addChild(cursor);
        
        // Animation du curseur
        let cursorVisible = true;
        const cursorInterval = setInterval(() => {
            cursor.visible = cursorVisible;
            cursorVisible = !cursorVisible;
        }, 500);
        
        // Bouton de validation
        const submitButton = this.createButton('Valider', this.game.width / 2, this.game.height / 2 + 80, () => {
            clearInterval(cursorInterval);
            
            // Vérifier que le nom n'est pas vide
            const playerName = inputText.text.trim() || "Joueur";
            
            // Enregistrer le score
            this.addScore(playerName, score, level + 1);
            
            // Montrer le tableau des scores
            const scoreTable = this.createScoreTable();
            
            // Remplacer le dialogue par le tableau des scores
            if (container.parent) {
                const parent = container.parent;
                parent.removeChild(container);
                parent.addChild(scoreTable);
            } else {
                // Si pour une raison quelconque le container n'a pas de parent, l'ajouter directement au stage
                this.game.app.stage.addChild(scoreTable);
            }
        });
        
        container.addChild(submitButton);
        
        // Gérer la saisie du clavier
        const keyboardHandler = (e) => {
            if (e.key === 'Enter') {
                // Simuler le clic sur le bouton de validation
                submitButton.emit('pointerdown');
                return;
            }
            
            if (e.key === 'Backspace') {
                inputText.text = inputText.text.slice(0, -1);
            } else if (e.key.length === 1 && inputText.text.length < 15) {
                // Ajouter le caractère si c'est une touche normale et que le nom n'est pas trop long
                inputText.text += e.key;
            }
            
            // Mettre à jour la position du curseur
            cursor.x = inputText.x + inputText.width;
        };
        
        // Ajouter l'écouteur d'événements pour le clavier
        window.addEventListener('keydown', keyboardHandler);
        
        // Nettoyer quand le container est supprimé
        container.on('removed', () => {
            window.removeEventListener('keydown', keyboardHandler);
            clearInterval(cursorInterval);
        });
        
        return container;
    }
} 