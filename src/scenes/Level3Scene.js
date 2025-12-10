import Phaser from 'phaser';
import Level1Scene from './Level1Scene.js';
import { SCENES } from '../utils/Constants.js';
import { CONFIG } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Coin from '../entities/Coin.js';

export default class Level3Scene extends Level1Scene {
    constructor() {
        super({ key: SCENES.LEVEL_3 });
    }

    create() {
        this.currentLevel = 3;
        this.levelConfig = CONFIG.levels[3];
        this.isLevelComplete = false; // Reset level completion flag

        this.createBackground();
        this.createPlatforms();

        this.player = new Player(this, 100, 400, () => this.handlePlayerDeath());

        this.createCoins();
        this.createEnemies();
        this.createUI();
        this.setupCollisions();
        this.setupEvents();

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 3500, 600);
        this.physics.world.setBounds(0, 0, 3500, 600);

        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Play level music
        this.playLevelMusic();
    }

    createBackground() {
        // Dark volcanic sky
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x3a1a0a, 0x3a1a0a, 1);
        bg.fillRect(0, 0, 3500, 600);
        bg.setScrollFactor(0);

        // Glowing lava pool at bottom
        const lavaGlow = this.add.graphics();
        lavaGlow.fillGradientStyle(0xff4400, 0xff6600, 0xff2200, 0xff0000, 1);
        lavaGlow.fillRect(0, 550, 3500, 50);
        lavaGlow.setScrollFactor(0);

        // Pulsing glow effect
        this.tweens.add({
            targets: lavaGlow,
            alpha: 0.6,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Volcanic mountains
        for (let i = 0; i < 8; i++) {
            const mountain = this.add.graphics();
            const x = i * 450;
            const height = Phaser.Math.Between(200, 400);

            // Mountain shape
            mountain.fillStyle(0x2a1a1a, 1);
            mountain.fillTriangle(0, height, 150, 0, 300, height);

            // Lava glow at top
            mountain.fillStyle(0xff4400, 0.6);
            mountain.fillCircle(150, 10, 20);

            mountain.x = x;
            mountain.y = 600 - height;
            mountain.setScrollFactor(0.2);
        }

        // Smoke/ash particles
        for (let i = 0; i < 30; i++) {
            const smoke = this.add.graphics();
            smoke.fillStyle(0x444444, Phaser.Math.FloatBetween(0.2, 0.5));
            smoke.fillCircle(0, 0, Phaser.Math.Between(10, 30));
            smoke.x = Phaser.Math.Between(0, 3500);
            smoke.y = Phaser.Math.Between(50, 400);
            smoke.setScrollFactor(0.4);

            // Floating animation
            this.tweens.add({
                targets: smoke,
                y: smoke.y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }

        // Fire particles rising from below
        for (let i = 0; i < 20; i++) {
            const fire = this.add.graphics();
            fire.fillStyle(Phaser.Math.Between(0, 1) ? 0xff6600 : 0xff4400, 0.8);
            fire.fillCircle(0, 0, Phaser.Math.Between(3, 8));
            fire.x = Phaser.Math.Between(0, 3500);
            fire.y = 580;
            fire.setScrollFactor(0);

            // Rising animation
            this.tweens.add({
                targets: fire,
                y: Phaser.Math.Between(300, 500),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        // Ground
        this.createPlatform(0, 580, 3500, 20, 0x34495e);

        // Level 3 - Hard platforming with precision jumps
        this.createPlatform(300, 480, 120, 20, 0x7f8c8d);
        this.createPlatform(500, 380, 100, 20, 0x7f8c8d);
        this.createPlatform(680, 300, 80, 20, 0x7f8c8d);
        this.createPlatform(850, 380, 100, 20, 0x7f8c8d);
        this.createPlatform(1050, 280, 120, 20, 0x7f8c8d);
        this.createPlatform(1270, 360, 80, 20, 0x7f8c8d);
        this.createPlatform(1450, 450, 100, 20, 0x7f8c8d);
        this.createPlatform(1650, 320, 120, 20, 0x7f8c8d);
        this.createPlatform(1870, 250, 80, 20, 0x7f8c8d);
        this.createPlatform(2050, 350, 100, 20, 0x7f8c8d);
        this.createPlatform(2250, 420, 120, 20, 0x7f8c8d);
        this.createPlatform(2470, 300, 80, 20, 0x7f8c8d);
        this.createPlatform(2650, 380, 100, 20, 0x7f8c8d);
        this.createPlatform(2850, 280, 120, 20, 0x7f8c8d);

        // Boss platform
        this.createPlatform(3100, 480, 400, 20, 0xc0392b);

        // Stepping platform to reach the end
        this.createPlatform(3350, 350, 100, 20, 0x7f8c8d);

        // End platform
        this.createPlatform(3300, 200, 200, 20, 0xf39c12);
        this.createFlag(3380, 180);
    }

    createCoins() {
        this.coins = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        const coinPositions = [
            [350, 440], [400, 440],
            [600, 260], [650, 260],
            [850, 340], [900, 340],
            [1050, 240], [1100, 240],
            [1270, 320], [1320, 320],
            [1450, 410], [1500, 410],
            [1650, 280], [1700, 280],
            [1870, 210], [1920, 210],
            [2050, 310], [2100, 310],
            [2250, 380], [2300, 380],
            [2470, 260], [2520, 260],
            [2650, 340], [2700, 340],
            [2850, 240], [2900, 240],
            [3100, 440], [3150, 440], [3200, 440], [3250, 440],
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

        // Level 3 - Hard difficulty with advanced enemies
        this.enemies.add(new Enemy(this, 550, 280, 'flyer'));
        this.enemies.add(new Enemy(this, 900, 280, 'fastWalker'));
        this.enemies.add(new Enemy(this, 1150, 180, 'trackingShooter'));
        this.enemies.add(new Enemy(this, 1500, 350, 'flyer'));
        this.enemies.add(new Enemy(this, 1750, 220, 'tank'));
        this.enemies.add(new Enemy(this, 2150, 250, 'fastWalker'));
        this.enemies.add(new Enemy(this, 2500, 200, 'trackingShooter'));
        this.enemies.add(new Enemy(this, 2750, 280, 'flyer'));
        this.enemies.add(new Enemy(this, 3000, 180, 'tank'));

        // Boss enemy
        this.boss = new Enemy(this, 3250, 380, 'boss');
        this.enemies.add(this.boss);
    }

    levelComplete() {
        this.events.emit('levelComplete');

        // Game completed!
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start(SCENES.VICTORY);
        });
    }
}
