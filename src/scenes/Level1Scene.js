import Phaser from 'phaser';
import { SCENES, EVENTS } from '../utils/Constants.js';
import { CONFIG } from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Coin from '../entities/Coin.js';

export default class Level1Scene extends Phaser.Scene {
    constructor(config = { key: SCENES.LEVEL_1 }) {
        super(config);
    }

    create() {
        this.currentLevel = 1;
        this.levelConfig = CONFIG.levels[1];
        this.isLevelComplete = false; // Reset level completion flag

        // Create background
        this.createBackground();

        // Create platforms
        this.createPlatforms();

        // Create player
        // Create player
        this.player = new Player(this, 100, 400, () => this.handlePlayerDeath());

        // Create coins
        this.createCoins();

        // Create enemies
        this.createEnemies();

        // Create UI
        this.createUI();

        // Expose coinText to player for updates
        this.player.scene.coinText = this.coinsText;


        // Set up collisions
        this.setupCollisions();

        // Set up events
        this.setupEvents();

        // Camera follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 2400, 600);
        this.physics.world.setBounds(0, 0, 2400, 600);

        // Pause key
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Play level music (once, not looped)
        this.playLevelMusic();
    }

    playLevelMusic() {
        // Stop all previous music
        this.sound.stopAll();
        // Play level-specific music
        const musicKey = `level${this.currentLevel}Music`;
        if (this.cache.audio.exists(musicKey)) {
            this.levelMusic = this.sound.add(musicKey, { loop: false, volume: 0.6 });
            this.levelMusic.play();
        }
    }

    createBackground() {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8E8, 0x98D8E8, 1);
        bg.fillRect(0, 0, 2400, 600);
        bg.setScrollFactor(0);

        // Add clouds
        for (let i = 0; i < 10; i++) {
            const cloud = this.add.graphics();
            cloud.fillStyle(0xffffff, 0.6);
            cloud.fillCircle(0, 0, 30);
            cloud.fillCircle(25, -5, 35);
            cloud.fillCircle(50, 0, 30);
            cloud.x = Phaser.Math.Between(0, 2400);
            cloud.y = Phaser.Math.Between(50, 200);
            cloud.setScrollFactor(0.3);
        }
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        // Ground
        this.createPlatform(0, 580, 2400, 20, 0x2ecc71);

        // Platforms - Tutorial level layout
        this.createPlatform(300, 480, 200, 20, 0x27ae60);
        this.createPlatform(600, 400, 150, 20, 0x27ae60);
        this.createPlatform(850, 320, 200, 20, 0x27ae60);
        this.createPlatform(1150, 380, 150, 20, 0x27ae60);
        this.createPlatform(1400, 450, 200, 20, 0x27ae60);
        this.createPlatform(1700, 350, 150, 20, 0x27ae60);
        this.createPlatform(1950, 280, 200, 20, 0x27ae60);
        this.createPlatform(2250, 350, 150, 20, 0x27ae60);

        // End platform with flag
        this.createPlatform(2200, 200, 200, 20, 0xf39c12);
        this.createFlag(2280, 180);
    }

    createPlatform(x, y, width, height, color) {
        // Create a graphics object for the platform visual
        const platform = this.add.graphics();
        platform.setPosition(x, y);

        // Draw filled rectangle with the specified color
        platform.fillStyle(color, 1);
        platform.fillRect(0, 0, width, height);

        // Add a darker border for depth
        const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(30).color;
        platform.lineStyle(3, darkerColor, 1);
        platform.strokeRect(0, 0, width, height);

        // Add top highlight for 3D effect
        const lighterColor = Phaser.Display.Color.ValueToColor(color).lighten(20).color;
        platform.lineStyle(2, lighterColor, 0.8);
        platform.beginPath();
        platform.moveTo(1, 1);
        platform.lineTo(width - 1, 1);
        platform.strokePath();

        // Create invisible physics body
        const body = this.add.rectangle(x + width / 2, y + height / 2, width, height);
        this.physics.add.existing(body, true); // true = static body
        this.platforms.add(body);
    }

    createFlag(x, y) {
        const flag = this.add.graphics();
        flag.fillStyle(0xffdd00, 1);
        flag.fillTriangle(0, 0, 40, 15, 0, 30);
        flag.lineStyle(3, 0x996600);
        flag.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, 40));
        flag.x = x;
        flag.y = y;

        this.tweens.add({
            targets: flag,
            scaleX: 0.9,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        // Create end zone
        this.endZone = this.add.zone(x, y, 50, 50);
        this.physics.add.existing(this.endZone);
        this.endZone.body.setAllowGravity(false);
    }

    createCoins() {
        this.coins = this.physics.add.group({
            allowGravity: false, // Important: Disable gravity for the entire group
            immovable: true
        });

        const coinPositions = [
            [350, 440], [400, 440], [450, 440],
            [650, 360], [700, 360],
            [900, 280], [950, 280], [1000, 280],
            [1200, 340], [1250, 340],
            [1450, 410], [1500, 410], [1550, 410],
            [1750, 310], [1800, 310],
            [2000, 240], [2050, 240], [2100, 240],
            [2300, 310], [2350, 310],
        ];

        coinPositions.forEach(([x, y]) => {
            const coin = new Coin(this, x, y);
            this.coins.add(coin);
            // Re-apply gravity setting just in case group addition reset it
            coin.body.setAllowGravity(false);
        });
    }

    // ... (rest of file)

    handlePlayerDeath() {
        console.log('Player died! Lives before:', window.gameState.lives);
        window.gameState.lives--;
        this.livesText.setText(`${window.gameState.lives}`);
        console.log('Lives after:', window.gameState.lives);

        if (window.gameState.lives <= 0) {
            // Game over
            console.log('Game Over - no lives left');
            this.time.delayedCall(1000, () => {
                this.scene.start(SCENES.GAME_OVER);
            });
        } else {
            // Respawn after 1 second
            console.log('Respawning player in 1 second...');
            this.time.delayedCall(1000, () => {
                console.log('Respawn callback executing...');
                if (this.player) {
                    console.log('Destroying old player');
                    this.player.destroy(); // Clean up old player
                }

                // Create new player
                console.log('Creating new player at (100, 400)');
                this.player = new Player(this, 100, 400);
                this.player.health = this.player.maxHealth;
                this.player.setActive(true); // Ensure physics is active
                this.player.container.setVisible(true); // Ensure container is visible
                console.log('New player created, container visible:', this.player.container.visible);

                // Recreate all collisions with new player
                this.setupCollisions();
                console.log('Collisions re-setup complete');

                // IMPORTANT: Update camera to follow the NEW player
                this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
                console.log('Camera following new player');
            });
        }
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        // Level 1 enemies - Easy
        this.enemies.add(new Enemy(this, 500, 380, 'walker'));
        this.enemies.add(new Enemy(this, 900, 220, 'shooter'));
        this.enemies.add(new Enemy(this, 1250, 280, 'walker'));
        this.enemies.add(new Enemy(this, 1600, 500, 'shooter'));
        this.enemies.add(new Enemy(this, 2000, 180, 'walker'));
    }

    createUI() {
        // HUD Container
        this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.7);
        panel.fillRect(10, 10, 780, 50);
        this.hud.add(panel);

        // Lives
        const livesLabel = this.add.text(20, 20, 'Lives:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff',
        });
        this.hud.add(livesLabel);

        this.livesText = this.add.text(80, 20, `${window.gameState.lives}`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            fill: '#ff0000',
        });
        this.hud.add(this.livesText);

        // Level
        this.levelText = this.add.text(400, 20, `LEVEL ${this.currentLevel}`, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            fill: '#ffdd00',
        }).setOrigin(0.5, 0);
        this.hud.add(this.levelText);

        // Coins
        const coinLabel = this.add.text(660, 20, 'Coins:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff',
        });
        this.hud.add(coinLabel);

        this.coinsText = this.add.text(730, 20, `${window.gameState.coins}`, {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            fill: '#ffdd00',
        });
        this.hud.add(this.coinsText);
    }

    setupCollisions() {
        // Clear existing colliders if any to prevent memory leaks and duplicates
        if (this.colliders) {
            this.colliders.forEach(c => c.destroy());
        }
        this.colliders = [];

        // Player collisions
        this.colliders.push(this.physics.add.collider(this.player, this.platforms));
        this.colliders.push(this.physics.add.collider(this.enemies, this.platforms));

        // Player vs enemies
        this.colliders.push(this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this));

        // Player bullets vs enemies
        this.colliders.push(this.physics.add.overlap(this.player.bullets, this.enemies, this.bulletHitEnemy, null, this));

        // Enemy bullets vs player
        this.colliders.push(this.physics.add.overlap(this.enemyBullets, this.player, this.enemyBulletHitPlayer, null, this));

        // Player vs coins
        this.colliders.push(this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this));

        // Player vs end zone
        if (this.endZone) {
            this.colliders.push(this.physics.add.overlap(this.player, this.endZone, this.levelComplete, null, this));
        }
    }

    // ... (events setup)

    handlePlayerDeath() {
        console.log('Player died! Lives before:', window.gameState.lives);
        window.gameState.lives--;
        this.livesText.setText(`${window.gameState.lives}`);
        console.log('Lives after:', window.gameState.lives);

        if (window.gameState.lives <= 0) {
            // Game over
            console.log('Game Over - no lives left');
            this.time.delayedCall(1000, () => {
                this.scene.start(SCENES.GAME_OVER);
            });
        } else {
            // Respawn after 1 second
            console.log('Respawning player in 1 second...');
            this.time.delayedCall(1000, () => {
                console.log('Respawn callback executing...');

                if (this.player) {
                    console.log('Respawning existing player at (100, 400)');
                    this.player.respawn(100, 400);

                    // IMPORTANT: Snap camera instantly to the player
                    this.cameras.main.startFollow(this.player, false);
                    console.log('Camera snapped to player');
                } else {
                    // Fallback if player was somehow destroyed
                    console.error('Player object missing! Recreating...');
                    this.player = new Player(this, 100, 400, () => this.handlePlayerDeath());
                    this.setupCollisions();
                    this.cameras.main.startFollow(this.player, false);
                }
            });
        }
    }

    setupEvents() {
        this.events.on(EVENTS.PLAYER_DIED, this.handlePlayerDeath, this);
        this.events.on(EVENTS.ENEMY_KILLED, this.handleEnemyKilled, this);
    }

    update(time, delta) {
        if (!this.player || !this.player.active) return;

        this.player.update(time, delta);

        // Update enemies
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.update) {
                enemy.update(time, delta);
            }
        });

        // Update coins (for animations)
        this.coins.children.entries.forEach(coin => {
            if (coin.update) {
                coin.update(time, delta);
            }
        });

        // Update bullets graphics
        this.player.bullets.children.entries.forEach(bullet => {
            if (bullet.active && bullet.graphics) {
                bullet.graphics.x = bullet.x;
                bullet.graphics.y = bullet.y;
            }
        });

        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.active && bullet.graphics) {
                bullet.graphics.x = bullet.x;
                bullet.graphics.y = bullet.y;
            }
        });

        // Pause
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.scene.pause();
            this.scene.launch(SCENES.PAUSE, { pausedScene: this.scene.key });
        }

        // DEBUG: Level skip keys (1, 2, 3)
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('ONE'), 500)) {
            this.scene.start(SCENES.LEVEL_1);
        }
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('TWO'), 500)) {
            this.scene.start(SCENES.LEVEL_2);
        }
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('THREE'), 500)) {
            this.scene.start(SCENES.LEVEL_3);
        }
    }

    playerHitEnemy(player, enemy) {
        // Always use this.player to avoid stale references after respawn
        if (this.player.isInvincible) return;
        this.player.takeDamage(enemy.damage);
    }

    bulletHitEnemy(bullet, enemy) {
        if (bullet.graphics) {
            bullet.graphics.destroy();
        }
        bullet.destroy();
        enemy.takeDamage(CONFIG.bullet.damage);
    }

    enemyBulletHitPlayer(bullet, player) {
        // Bullet hits are instant death - go straight to game over
        if (!this.player.isInvincible) {
            console.log('[BULLET HIT] Instant game over');
            this.player.health = 0;
            this.player.die();
        }

        if (bullet.graphics) {
            bullet.graphics.destroy();
        }
        bullet.destroy();
    }


    collectCoin(player, coin) {
        coin.collect();

        // Use player's collectCoin method for tracking
        this.player.collectCoin();

        // Update score
        window.gameState.score += CONFIG.coinValue;
        this.events.emit(EVENTS.COIN_COLLECTED);
    }

    levelComplete() {
        // Prevent multiple calls
        if (this.isLevelComplete) return;
        this.isLevelComplete = true;

        console.log('[LEVEL COMPLETE] Transitioning to Level 2');
        this.events.emit(EVENTS.LEVEL_COMPLETE);

        // Advance to next level
        window.gameState.currentLevel = 2;
        if (window.gameState.maxLevel < 2) {
            window.gameState.maxLevel = 2;
        }

        // Fade out camera
        this.cameras.main.fadeOut(500, 0, 0, 0);

        // Use timer instead of camera event (more reliable)
        this.time.delayedCall(600, () => {
            console.log('[LEVEL COMPLETE] Starting Level 2 scene');
            this.scene.start(SCENES.LEVEL_2);
        });
    }

    handlePlayerDeath() {
        console.log('Player died! Lives before:', window.gameState.lives);
        window.gameState.lives--;
        this.livesText.setText(`${window.gameState.lives}`);
        console.log('Lives after:', window.gameState.lives);

        if (window.gameState.lives <= 0) {
            // Game over
            console.log('Game Over - no lives left');
            this.time.delayedCall(1000, () => {
                this.scene.start(SCENES.GAME_OVER);
            });
        } else {
            // Respawn after 1 second
            console.log('Respawning player in 1 second...');
            this.time.delayedCall(1000, () => {
                console.log('Respawn callback executing...');
                if (this.player) {
                    console.log('Destroying old player');
                    this.player.destroy(); // Clean up old player
                }

                // Create new player
                console.log('Creating new player at (100, 400)');
                this.player = new Player(this, 100, 400);
                this.player.health = this.player.maxHealth;
                this.player.setActive(true); // Ensure physics is active
                this.player.container.setVisible(true); // Ensure container is visible
                console.log('New player created, container visible:', this.player.container.visible);

                // Recreate all collisions with new player
                this.setupCollisions();
                console.log('Collisions re-setup complete');
            });
        }
    }

    handleEnemyKilled(type) {
        window.gameState.score += 50;
    }
}
