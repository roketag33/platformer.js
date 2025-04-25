import * as PIXI from 'pixi.js';
import { Game } from '../core/game';

// Interface pour définir les options des particules
interface ParticleOptions {
    color?: number;
    colors?: number[];
    size?: number;
    sizeStart?: number;
    sizeEnd?: number;
    speed?: number;
    speedVariation?: number;
    lifetime?: number;
    lifetimeVariation?: number;
    alpha?: number;
    alphaStart?: number;
    alphaEnd?: number;
    angle?: number;
    angleVariation?: number;
    shape?: string; // 'circle', 'square', 'star'
    count?: number;
}

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    sizeStart: number;
    sizeEnd: number;
    alpha: number;
    alphaStart: number;
    alphaEnd: number;
    color: number;
    lifetime: number;
    age: number;
    shape: string;
    sprite: PIXI.Sprite;
    
    constructor(
        game: Game, 
        x: number, 
        y: number, 
        container: PIXI.Container, 
        options: ParticleOptions = {}
    ) {
        this.x = x;
        this.y = y;
        
        // Vitesse et direction
        const speed = options.speed || 2;
        const speedVariation = options.speedVariation || 1;
        const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
        const angleVariation = options.angleVariation || 0;
        
        const finalAngle = angle + (Math.random() * 2 - 1) * angleVariation;
        const finalSpeed = speed + (Math.random() * 2 - 1) * speedVariation;
        
        this.vx = Math.cos(finalAngle) * finalSpeed;
        this.vy = Math.sin(finalAngle) * finalSpeed;
        
        // Taille
        this.sizeStart = options.sizeStart !== undefined ? options.sizeStart : (options.size || 5);
        this.sizeEnd = options.sizeEnd !== undefined ? options.sizeEnd : (options.size || 1);
        this.size = this.sizeStart;
        
        // Opacité
        this.alphaStart = options.alphaStart !== undefined ? options.alphaStart : (options.alpha || 1);
        this.alphaEnd = options.alphaEnd !== undefined ? options.alphaEnd : 0;
        this.alpha = this.alphaStart;
        
        // Couleur (utiliser une couleur aléatoire du tableau si fourni)
        if (options.colors && options.colors.length > 0) {
            this.color = options.colors[Math.floor(Math.random() * options.colors.length)];
        } else {
            this.color = options.color || 0xFFFFFF;
        }
        
        // Durée de vie
        const lifetime = options.lifetime || 60;
        const lifetimeVariation = options.lifetimeVariation || 20;
        this.lifetime = lifetime + (Math.random() * 2 - 1) * lifetimeVariation;
        this.age = 0;
        
        // Forme
        this.shape = options.shape || 'circle';
        
        // Créer le graphique de la particule
        const graphics = new PIXI.Graphics();
        this.drawShape(graphics);
        
        // Créer le sprite
        this.sprite = new PIXI.Sprite(game.app.renderer.generateTexture(graphics));
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.alpha = this.alpha;
        
        // Ajouter au container
        container.addChild(this.sprite);
    }
    
    drawShape(graphics: PIXI.Graphics) {
        graphics.beginFill(this.color);
        
        switch (this.shape) {
            case 'square':
                graphics.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
                
            case 'star':
                this.drawStar(graphics, 0, 0, 5, this.size, this.size / 2);
                break;
                
            case 'circle':
            default:
                graphics.drawCircle(0, 0, this.size);
                break;
        }
        
        graphics.endFill();
    }
    
    drawStar(graphics: PIXI.Graphics, x: number, y: number, points: number, outerRadius: number, innerRadius: number) {
        const step = Math.PI / points;
        
        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            
            if (i === 0) {
                graphics.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
            } else {
                graphics.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
            }
        }
        
        graphics.closePath();
    }
    
    update(delta: number = 1) {
        // Mettre à jour l'âge
        this.age += delta;
        
        // Vérifier si la particule est morte
        if (this.age >= this.lifetime) {
            return false;
        }
        
        // Proportion de la vie écoulée (0 à 1)
        const lifeRatio = this.age / this.lifetime;
        
        // Mettre à jour la position
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        
        // Interpolation linéaire pour la taille et l'opacité
        this.size = this.sizeStart + (this.sizeEnd - this.sizeStart) * lifeRatio;
        this.alpha = this.alphaStart + (this.alphaEnd - this.alphaStart) * lifeRatio;
        
        // Mettre à jour le sprite
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.alpha = this.alpha;
        this.sprite.width = this.size * 2;
        this.sprite.height = this.size * 2;
        
        return true;
    }
    
    destroy() {
        if (this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
        }
    }
}

export class ParticleSystem {
    game: Game;
    container: PIXI.Container;
    particles: Particle[];
    
    constructor(game: Game) {
        this.game = game;
        this.container = new PIXI.Container();
        this.particles = [];
        
        // Ajouter le container au jeu
        this.game.app.stage.addChild(this.container);
        
        // Mettre à jour les particules à chaque frame
        this.game.app.ticker.add(this.update.bind(this));
    }
    
    update(delta: number) {
        // Mettre à jour toutes les particules
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const isAlive = this.particles[i].update(delta);
            
            if (!isAlive) {
                // Supprimer les particules mortes
                this.particles[i].destroy();
                this.particles.splice(i, 1);
            }
        }
    }
    
    createExplosion(x: number, y: number, options: ParticleOptions = {}) {
        const count = options.count || 20;
        
        // Couleurs par défaut pour l'explosion
        const defaultColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0xFFFF33];
        
        const particleOptions: ParticleOptions = {
            colors: options.colors || defaultColors,
            sizeStart: options.sizeStart || 10,
            sizeEnd: options.sizeEnd || 1,
            speed: options.speed || 3,
            speedVariation: options.speedVariation || 2,
            lifetime: options.lifetime || 40,
            lifetimeVariation: options.lifetimeVariation || 20,
            alphaStart: options.alphaStart || 1,
            alphaEnd: options.alphaEnd || 0,
            shape: options.shape || 'circle'
        };
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.game, x, y, this.container, particleOptions);
            this.particles.push(particle);
        }
    }
    
    createSparks(x: number, y: number, angle: number, options: ParticleOptions = {}) {
        const count = options.count || 10;
        
        const particleOptions: ParticleOptions = {
            color: options.color || 0xFFFF00,
            sizeStart: options.sizeStart || 3,
            sizeEnd: options.sizeEnd || 1,
            speed: options.speed || 4,
            speedVariation: options.speedVariation || 2,
            lifetime: options.lifetime || 30,
            lifetimeVariation: options.lifetimeVariation || 10,
            alphaStart: options.alphaStart || 1,
            alphaEnd: options.alphaEnd || 0,
            angle: angle,
            angleVariation: options.angleVariation || Math.PI / 4,
            shape: options.shape || 'circle'
        };
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.game, x, y, this.container, particleOptions);
            this.particles.push(particle);
        }
    }
    
    createCollectEffect(x: number, y: number, options: ParticleOptions = {}) {
        const count = options.count || 15;
        
        const particleOptions: ParticleOptions = {
            color: options.color || 0xFFD700, // Or
            sizeStart: options.sizeStart || 5,
            sizeEnd: options.sizeEnd || 0,
            speed: options.speed || 2,
            speedVariation: options.speedVariation || 1,
            lifetime: options.lifetime || 30,
            lifetimeVariation: options.lifetimeVariation || 10,
            alphaStart: options.alphaStart || 1,
            alphaEnd: options.alphaEnd || 0,
            shape: options.shape || 'star'
        };
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.game, x, y, this.container, particleOptions);
            this.particles.push(particle);
        }
    }
    
    createLevelCompleteEffect(x: number, y: number, options: ParticleOptions = {}) {
        const count = options.count || 50;
        
        // Couleurs festives
        const defaultColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
        
        const particleOptions: ParticleOptions = {
            colors: options.colors || defaultColors,
            sizeStart: options.sizeStart || 8,
            sizeEnd: options.sizeEnd || 2,
            speed: options.speed || 3,
            speedVariation: options.speedVariation || 2,
            lifetime: options.lifetime || 90,
            lifetimeVariation: options.lifetimeVariation || 30,
            alphaStart: options.alphaStart || 1,
            alphaEnd: options.alphaEnd || 0,
            shape: options.shape || 'star'
        };
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.game, x, y, this.container, particleOptions);
            this.particles.push(particle);
        }
    }
    
    createDustEffect(x: number, y: number, options: ParticleOptions = {}) {
        const count = options.count || 5;
        
        const particleOptions: ParticleOptions = {
            color: options.color || 0xCCCCCC, // Gris
            sizeStart: options.sizeStart || 3,
            sizeEnd: options.sizeEnd || 1,
            speed: options.speed || 1,
            speedVariation: options.speedVariation || 0.5,
            lifetime: options.lifetime || 20,
            lifetimeVariation: options.lifetimeVariation || 5,
            alphaStart: options.alphaStart || 0.7,
            alphaEnd: options.alphaEnd || 0,
            angle: Math.PI * 3 / 2, // Vers le haut
            angleVariation: options.angleVariation || Math.PI / 8,
            shape: options.shape || 'circle'
        };
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.game, x, y, this.container, particleOptions);
            this.particles.push(particle);
        }
    }
} 