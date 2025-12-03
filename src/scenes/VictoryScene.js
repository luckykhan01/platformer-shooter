import Phaser from 'phaser';
import { SCENES } from '../utils/Constants.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.VICTORY });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Victory background with gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x2ecc71, 0x2ecc71, 0x27ae60, 0x27ae60, 1);
        bg.fillRect(0, 0, width, height);

        // Confetti particles
        this.createConfetti();

        // Victory text
        const victoryText = this.add.text(width / 2, height / 4, 'VICTORY!', {
            fontSize: '84px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ffdd00',
            stroke: '#000000',
            strokeThickness: 10,
        });
        victoryText.setOrigin(0.5);

        // Bounce animation
        this.tweens.add({
            targets: victoryText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Congratulations
        const congrats = this.add.text(width / 2, height / 4 + 80,
            'You completed all levels!', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });
        congrats.setOrigin(0.5);

        // Final stats
        const stats = this.add.text(width / 2, height / 2,
            `═══════════════════════════\n\n` +
            `Total Coins Collected: ${window.gameState.coins}\n` +
            `Final Score: ${window.gameState.score}\n` +
            `Lives Remaining: ${window.gameState.lives}\n\n` +
            `═══════════════════════════`, {
            fontSize: '22px',
            fontFamily: 'monospace',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 8,
            stroke: '#000000',
            strokeThickness: 2,
        });
        stats.setOrigin(0.5);

        // Performance grade
        const grade = this.calculateGrade();
        const gradeText = this.add.text(width / 2, height / 1.6, `Grade: ${grade}`, {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            fill: this.getGradeColor(grade),
            stroke: '#000000',
            strokeThickness: 6,
        });
        gradeText.setOrigin(0.5);

        // Play again button
        const playButton = this.createButton(width / 2, height - 100, 'PLAY AGAIN', () => {
            this.scene.start(SCENES.MENU);
        });

        // Trophy
        this.createTrophy(width / 2, height / 1.35);
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
            const confetti = this.add.graphics();
            confetti.fillStyle(Phaser.Utils.Array.GetRandom(colors), 1);
            confetti.fillRect(0, 0, 10, 10);
            confetti.x = Phaser.Math.Between(0, 800);
            confetti.y = Phaser.Math.Between(-100, 0);

            this.tweens.add({
                targets: confetti,
                y: 650,
                angle: 720,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000),
            });
        }
    }

    createTrophy(x, y) {
        const trophy = this.add.graphics();
        trophy.fillStyle(0xffd700, 1);
        trophy.fillCircle(0, -20, 15);
        trophy.fillRect(-5, -5, 10, 15);
        trophy.fillRect(-15, 10, 30, 5);
        trophy.lineStyle(2, 0xff8c00, 1);
        trophy.strokeCircle(0, -20, 15);
        trophy.x = x;
        trophy.y = y;

        this.tweens.add({
            targets: trophy,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    calculateGrade() {
        const score = window.gameState.score;
        const coins = window.gameState.coins;
        const lives = window.gameState.lives;

        const total = score + (coins * 10) + (lives * 100);

        if (total >= 1500) return 'S';
        if (total >= 1200) return 'A';
        if (total >= 900) return 'B';
        if (total >= 600) return 'C';
        return 'D';
    }

    getGradeColor(grade) {
        const colors = {
            'S': '#FFD700',
            'A': '#00ff00',
            'B': '#4a90e2',
            'C': '#f39c12',
            'D': '#e74c3c',
        };
        return colors[grade] || '#ffffff';
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x2980b9, 1);
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
            bg.fillStyle(0x3498db, 1);
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
            bg.fillStyle(0x2980b9, 1);
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
