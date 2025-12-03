import Phaser from 'phaser';
import { SCENES, COLORS } from '../utils/Constants.js';
import { CONFIG } from '../config.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background gradient effect
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1e3c72, 0x1e3c72, 0x2a5298, 0x2a5298, 1);
        bg.fillRect(0, 0, width, height);

        // Title
        const title = this.add.text(width / 2, height / 4, 'PLATFORMER\nSHOOTER', {
            fontSize: '64px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
            fontStyle: 'bold',
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 4 + 100, 'A Classic Adventure', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffdd00',
            stroke: '#000000',
            strokeThickness: 4,
        });
        subtitle.setOrigin(0.5);

        // Start button
        const startButton = this.createButton(width / 2, height / 2 + 50, 'START GAME', () => {
            this.startGame();
        });

        // Instructions
        const instructions = this.add.text(width / 2, height - 120,
            'CONTROLS:\n← → Move   ↑ Jump   SPACE Shoot   ESC Pause', {
            fontSize: '16px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 8,
        });
        instructions.setOrigin(0.5);

        // Credits
        const credits = this.add.text(width / 2, height - 30, 'Created with Phaser 3 | AI-Generated Assets', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            fill: '#aaaaaa',
        });
        credits.setOrigin(0.5);

        // Animated floating effect for title
        this.tweens.add({
            targets: title,
            y: title.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x4a90e2, 1);
        bg.fillRoundedRect(-120, -30, 240, 60, 10);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRoundedRect(-120, -30, 240, 60, 10);

        const label = this.add.text(0, 0, text, {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });
        label.setOrigin(0.5);

        button.add([bg, label]);
        button.setSize(240, 60);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x5aa5f5, 1);
            bg.fillRoundedRect(-120, -30, 240, 60, 10);
            bg.lineStyle(4, 0xffdd00, 1);
            bg.strokeRoundedRect(-120, -30, 240, 60, 10);
            this.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
            });
        });

        button.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4a90e2, 1);
            bg.fillRoundedRect(-120, -30, 240, 60, 10);
            bg.lineStyle(4, 0xffffff, 1);
            bg.strokeRoundedRect(-120, -30, 240, 60, 10);
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

    startGame() {
        // Reset game state
        window.gameState = {
            lives: CONFIG.lives,
            score: 0,
            coins: 0,
            currentLevel: 1,
            maxLevel: 1,
        };

        this.scene.start(SCENES.LEVEL_1);
    }
}
