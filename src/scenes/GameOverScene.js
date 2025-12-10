import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/Constants.js';
import { CONFIG } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME_OVER });
    }

    create(data) {
        console.log('GameOverScene.create() started', data);
        const { width, height } = this.cameras.main;

        // Stop all music
        this.sound.stopAll();

        // Get coin and level data from scene data or fallback to global state
        const coins = data.coins !== undefined ? data.coins : window.gameState.coins;
        const level = data.level !== undefined ? data.level : window.gameState.currentLevel;

        // Dark background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(0, 0, width, height);

        // Game Over text
        const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontSize: '72px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8,
        });
        gameOverText.setOrigin(0.5);

        // Flashing effect
        this.tweens.add({
            targets: gameOverText,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        // Stats
        const stats = this.add.text(width / 2, height / 2,
            `Level Reached: ${level}\n` +
            `Coins Collected: ${coins}\n` +
            `Score: ${window.gameState.score}`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 10,
        });
        stats.setOrigin(0.5);

        // Restart button
        const restartButton = this.createButton(width / 2, height / 1.6, 'RESTART', () => {
            // Reset game state and start from Level 1
            window.gameState.lives = CONFIG.lives;
            window.gameState.health = CONFIG.player.maxHealth;
            window.gameState.currentLevel = 1;
            window.gameState.coins = 0;
            window.gameState.score = 0;
            this.scene.start(SCENES.LEVEL_1);
        });

        // Quit button
        const quitButton = this.createButton(width / 2, height / 1.3, 'QUIT', () => {
            this.scene.start(SCENES.MENU);
        });

        // Message
        const message = this.add.text(width / 2, height - 50, 'Better luck next time!', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fill: '#aaaaaa',
        });
        message.setOrigin(0.5);
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0xe74c3c, 1);
        bg.fillRoundedRect(-100, -25, 200, 50, 10);
        bg.lineStyle(3, 0xffffff, 1);
        bg.strokeRoundedRect(-100, -25, 200, 50, 10);

        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ffffff',
        });
        label.setOrigin(0.5);

        button.add([bg, label]);
        button.setSize(200, 50);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0xff6b6b, 1);
            bg.fillRoundedRect(-100, -25, 200, 50, 10);
            bg.lineStyle(3, 0xffdd00, 1);
            bg.strokeRoundedRect(-100, -25, 200, 50, 10);
            this.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
            });
        });

        button.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0xe74c3c, 1);
            bg.fillRoundedRect(-100, -25, 200, 50, 10);
            bg.lineStyle(3, 0xffffff, 1);
            bg.strokeRoundedRect(-100, -25, 200, 50, 10);
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
            });
        });

        button.on('pointerdown', callback);

        return button;
    }
}
