import Phaser from 'phaser';
import { SCENES } from '../utils/Constants.js';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PAUSE });
    }

    create(data) {
        this.pausedScene = data.pausedScene || SCENES.LEVEL_1;

        const { width, height } = this.cameras.main;

        // Semi-transparent overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);

        // Pause title
        const title = this.add.text(width / 2, height / 3, 'PAUSED', {
            fontSize: '64px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        });
        title.setOrigin(0.5);

        // Resume button
        this.createButton(width / 2, height / 2, 'RESUME', () => {
            this.resumeGame();
        });

        // Quit button
        this.createButton(width / 2, height / 2 + 80, 'QUIT TO MENU', () => {
            this.scene.stop(this.pausedScene);
            this.scene.stop();
            this.sound.stopAll();
            this.scene.start(SCENES.MENU);
        });

        // ESC to resume
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });

        // Instructions
        const hint = this.add.text(width / 2, height - 50, 'Press ESC to resume', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#aaaaaa',
        });
        hint.setOrigin(0.5);
    }

    resumeGame() {
        this.scene.stop();
        this.scene.resume(this.pausedScene);
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x4a90e2, 1);
        bg.fillRoundedRect(-100, -25, 200, 50, 10);
        bg.lineStyle(3, 0xffffff, 1);
        bg.strokeRoundedRect(-100, -25, 200, 50, 10);

        const label = this.add.text(0, 0, text, {
            fontSize: '22px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ffffff',
        });
        label.setOrigin(0.5);

        button.add([bg, label]);
        button.setSize(200, 50);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x5aa5f5, 1);
            bg.fillRoundedRect(-100, -25, 200, 50, 10);
            bg.lineStyle(3, 0xffdd00, 1);
            bg.strokeRoundedRect(-100, -25, 200, 50, 10);
        });

        button.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4a90e2, 1);
            bg.fillRoundedRect(-100, -25, 200, 50, 10);
            bg.lineStyle(3, 0xffffff, 1);
            bg.strokeRoundedRect(-100, -25, 200, 50, 10);
        });

        button.on('pointerdown', callback);

        return button;
    }
}
