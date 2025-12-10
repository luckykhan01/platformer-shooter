import Phaser from 'phaser';
import Level1Scene from './Level1Scene.js';
import { SCENES } from '../utils/Constants.js';
import { CONFIG } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Coin from '../entities/Coin.js';

export default class Level2Scene extends Level1Scene {
    constructor() {
        super({ key: SCENES.LEVEL_2 });
    }

    create() {
        this.currentLevel = 2;
        this.levelConfig = CONFIG.levels[2];
        this.isLevelComplete = false; // Reset level completion flag

        // Reuse parent create logic
        this.createBackground();
        this.createPlatforms();

        this.player = new Player(this, 100, 400, () => this.handlePlayerDeath());

        this.createCoins();
        this.createEnemies();
        this.createUI();
        this.setupCollisions();
        this.setupEvents();

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 3000, 600);
        this.physics.world.setBounds(0, 0, 3000, 600);

        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Play level music
        this.playLevelMusic();
    }

    createBackground() {
        // Night sky gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a1a4e, 0x1a1a4e, 1);
        bg.fillRect(0, 0, 3000, 600);
        bg.setScrollFactor(0);

        // Stars
        for (let i = 0; i < 100; i++) {
            const star = this.add.graphics();
            const size = Phaser.Math.Between(1, 3);
            star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1));
            star.fillCircle(0, 0, size);
            star.x = Phaser.Math.Between(0, 3000);
            star.y = Phaser.Math.Between(20, 250);
            star.setScrollFactor(0.1);

            // Twinkling effect
            this.tweens.add({
                targets: star,
                alpha: 0.3,
                duration: Phaser.Math.Between(500, 1500),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
        }

        // Moon
        const moon = this.add.graphics();
        moon.fillStyle(0xffffcc, 1);
        moon.fillCircle(0, 0, 40);
        moon.fillStyle(0xeeeeaa, 0.8);
        moon.fillCircle(-8, -5, 35);
        moon.x = 700;
        moon.y = 80;
        moon.setScrollFactor(0.05);

        // City buildings silhouettes
        for (let i = 0; i < 20; i++) {
            const building = this.add.graphics();
            const buildingWidth = Phaser.Math.Between(60, 120);
            const buildingHeight = Phaser.Math.Between(150, 350);
            const x = i * 150;

            // Building body
            building.fillStyle(0x1a1a3a, 1);
            building.fillRect(0, 0, buildingWidth, buildingHeight);

            // Windows
            building.fillStyle(0xffdd66, 0.8);
            for (let wy = 20; wy < buildingHeight - 20; wy += 30) {
                for (let wx = 10; wx < buildingWidth - 15; wx += 20) {
                    if (Phaser.Math.Between(0, 10) > 3) { // Random lit windows
                        building.fillRect(wx, wy, 10, 15);
                    }
                }
            }

            building.x = x;
            building.y = 600 - buildingHeight;
            building.setScrollFactor(0.3);
        }
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        // Ground
        this.createPlatform(0, 580, 3000, 20, 0x7f8c8d);

        // Level 2 - More complex platforming
        this.createPlatform(300, 480, 150, 20, 0x95a5a6);
        this.createPlatform(550, 400, 120, 20, 0x95a5a6);
        this.createPlatform(750, 320, 150, 20, 0x95a5a6);
        this.createPlatform(1000, 400, 100, 20, 0x95a5a6);
        this.createPlatform(1200, 480, 150, 20, 0x95a5a6);
        this.createPlatform(1450, 350, 120, 20, 0x95a5a6);
        this.createPlatform(1650, 280, 150, 20, 0x95a5a6);
        this.createPlatform(1900, 380, 100, 20, 0x95a5a6);
        this.createPlatform(2100, 300, 150, 20, 0x95a5a6);
        this.createPlatform(2350, 420, 120, 20, 0x95a5a6);
        this.createPlatform(2600, 340, 150, 20, 0x95a5a6);

        // End platform
        this.createPlatform(2800, 200, 200, 20, 0xe67e22);
        this.createFlag(2880, 180);
    }

    createCoins() {
        this.coins = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        const coinPositions = [
            [350, 440], [400, 440],
            [600, 360], [650, 360],
            [800, 280], [850, 280], [900, 280],
            [1050, 360],
            [1250, 440], [1300, 440], [1350, 440],
            [1500, 310], [1550, 310],
            [1700, 240], [1750, 240], [1800, 240],
            [1950, 340],
            [2150, 260], [2200, 260], [2250, 260],
            [2400, 380], [2450, 380],
            [2650, 300], [2700, 300], [2750, 300],
        ];

        coinPositions.forEach(([x, y]) => {
            const coin = new Coin(this, x, y);
            this.coins.add(coin);
            coin.body.setAllowGravity(false);
        });
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        // Level 2 - Medium difficulty with more enemy types
        this.enemies.add(new Enemy(this, 500, 300, 'fastWalker'));
        this.enemies.add(new Enemy(this, 850, 220, 'trackingShooter'));
        this.enemies.add(new Enemy(this, 1100, 380, 'jumper'));
        this.enemies.add(new Enemy(this, 1500, 250, 'walker'));
        this.enemies.add(new Enemy(this, 1700, 180, 'trackingShooter'));
        this.enemies.add(new Enemy(this, 2000, 280, 'fastWalker'));
        this.enemies.add(new Enemy(this, 2400, 320, 'jumper'));
        this.enemies.add(new Enemy(this, 2700, 240, 'trackingShooter'));
    }

    levelComplete() {
        this.events.emit('levelComplete');

        window.gameState.currentLevel = 3;
        if (window.gameState.maxLevel < 3) {
            window.gameState.maxLevel = 3;
        }

        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start(SCENES.LEVEL_3);
        });
    }
}
