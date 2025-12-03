import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { EVENTS, SCENES } from '../utils/Constants.js';


export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, onDeath) {
        // Create placeholder graphic (will be replaced with actual sprite)
        super(scene, x, y, null);

        this.onDeath = onDeath; // Store callback

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Player properties
        this.maxHealth = CONFIG.player.maxHealth;
        this.health = this.maxHealth;
        this.isInvincible = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.lastShootTime = 0;

        // Respawn and coin tracking
        this.respawnX = x;  // Store starting position
        this.respawnY = y;
        this.coins = 0;  // Track coins collected by this player

        // Physics properties
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDrag(400, 0);
        this.setSize(28, 32);
        this.setVisible(false); // Hide sprite, we use graphics container for visuals

        // Create visual representation (placeholder)
        this.graphics = scene.add.graphics();
        this.graphics.fillStyle(0x4a90e2, 1);
        this.graphics.fillRect(-14, -16, 28, 32);
        this.container = scene.add.container(x, y, [this.graphics]);

        // Create health bar (above player)
        this.createHealthBar();

        // Create fixed on-screen health display (top-left corner)
        this.createHealthDisplay();

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Bullets group
        this.bullets = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: true,
        });
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.graphics();
        this.healthBarFg = this.scene.add.graphics();
        this.updateHealthBar();
    }

    createHealthDisplay() {
        // Fixed on-screen health display (top-left corner)
        this.healthText = this.scene.add.text(20, 20, `Health: ${this.health}`, {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.healthText.setScrollFactor(0);  // Stays fixed on screen
        this.healthText.setDepth(101);  // Above other UI elements
    }

    updateHealthBar() {
        const barWidth = 40;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - 25;

        this.healthBarBg.clear();
        this.healthBarBg.fillStyle(0x000000, 0.5);
        this.healthBarBg.fillRect(x, y, barWidth, barHeight);

        this.healthBarFg.clear();
        const healthPercent = this.health / this.maxHealth;
        const color = healthPercent > 0.5 ? 0x2ecc71 : healthPercent > 0.25 ? 0xf39c12 : 0xe74c3c;
        this.healthBarFg.fillStyle(color, 1);
        this.healthBarFg.fillRect(x, y, barWidth * healthPercent, barHeight);
    }

    update(time, delta) {
        if (!this.active) return;

        // Update container position to match sprite
        this.container.x = this.x;
        this.container.y = this.y;

        // Handle movement
        this.handleMovement();

        // Handle shooting
        this.handleShooting(time);

        // Update health bar position
        this.updateHealthBar();

        // Check if on ground
        if (this.body.blocked.down || this.body.touching.down) {
            this.hasDoubleJumped = false;
            this.canDoubleJump = true;
        }
    }

    handleMovement() {
        const { speed, jumpVelocity, doubleJumpVelocity } = CONFIG.player;

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.setVelocityX(-speed);
            this.container.scaleX = -1;
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(speed);
            this.container.scaleX = 1;
        } else {
            this.setVelocityX(0);
        }

        // Jumping
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (this.body.blocked.down || this.body.touching.down) {
                this.setVelocityY(jumpVelocity);
            } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                this.setVelocityY(doubleJumpVelocity);
                this.hasDoubleJumped = true;
            }
        }
    }

    handleShooting(time) {
        if (this.shootKey.isDown && time > this.lastShootTime + CONFIG.player.shootCooldown) {
            this.shoot();
            this.lastShootTime = time;
        }
    }

    shoot() {
        const direction = this.container.scaleX > 0 ? 1 : -1;
        const offsetX = direction * 20;

        const bullet = this.bullets.get(this.x + offsetX, this.y);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);

            // Create bullet visual
            if (!bullet.graphics) {
                bullet.graphics = this.scene.add.graphics();
                bullet.graphics.fillStyle(0xffdd00, 1);
                bullet.graphics.fillCircle(0, 0, 4);
            }
            bullet.graphics.x = bullet.x;
            bullet.graphics.y = bullet.y;

            bullet.setVelocityX(CONFIG.bullet.speed * direction);
            bullet.setVelocityY(0);
            bullet.body.setAllowGravity(false);
            bullet.setSize(8, 8);

            // Destroy bullet after lifespan
            this.scene.time.delayedCall(CONFIG.bullet.lifespan, () => {
                if (bullet.active) {
                    bullet.graphics?.destroy();
                    bullet.destroy();
                }
            });
        }
    }

    takeDamage(amount = 1) {
        console.log(`[TAKE DAMAGE] Amount: ${amount}, Current Health: ${this.health}, Invincible: ${this.isInvincible}`);
        if (this.isInvincible || this.health <= 0) return;


        this.health -= amount;
        this.updateHealthBar();

        // Update health text display
        if (this.healthText) {
            this.healthText.setText(`Health: ${this.health}`);
        }

        this.scene.events.emit(EVENTS.PLAYER_HIT, this.health);

        // Visual feedback - screen shake
        this.scene.cameras.main.shake(300, 0.01);

        if (this.health <= 0) {
            this.die();
        } else {
            // IMPORTANT: Reposition FIRST, then apply visual effects
            this.reposition(this.respawnX, this.respawnY);
            this.flashRed();
            this.becomeInvincible();
        }
    }

    reposition(x, y) {
        // Fallback to default position if undefined
        const targetX = x !== undefined ? x : 100;
        const targetY = y !== undefined ? y : 400;

        // CRITICAL: Kill any existing tweens on the container FIRST
        if (this.scene && this.scene.tweens) {
            this.scene.tweens.killTweensOf(this.container);
        }

        // Reset physics body position
        this.body.reset(targetX, targetY);

        // CRITICAL: Explicitly sync sprite x/y
        this.x = targetX;
        this.y = targetY;

        // Ensure player is active and visible
        this.setActive(true);
        this.body.enable = true;

        // CRITICAL: Force container to be fully visible
        this.container.setVisible(true);
        this.container.alpha = 1;
        this.container.x = this.x;
        this.container.y = this.y;

        // CRITICAL: Explicitly set graphics visibility and alpha
        if (this.graphics) {
            this.graphics.setVisible(true);
            this.graphics.alpha = 1;

            // Reset graphics to normal color
            this.graphics.clear();
            this.graphics.fillStyle(0x4a90e2, 1);
            this.graphics.fillRect(-14, -16, 28, 32);
        }

        this.setVelocity(0, 0);

        console.log(`[REPOSITION] Player at (${this.x}, ${this.y})`);
        console.log(`[REPOSITION] Container pos: (${this.container.x}, ${this.container.y}), visible: ${this.container.visible}, alpha: ${this.container.alpha}`);
        console.log(`[REPOSITION] Graphics exists: ${!!this.graphics}, visible: ${this.graphics?.visible}, alpha: ${this.graphics?.alpha}`);
        console.log(`[REPOSITION] Container children: ${this.container.list.length}`);
    }


    becomeInvincible() {
        this.isInvincible = true;

        // Kill any existing flicker tweens
        if (this.scene && this.scene.tweens) {
            this.scene.tweens.killTweensOf(this.container);
        }

        // CRITICAL: Cancel any existing invincibility timers
        if (this.invincibilityFlickerTimer) {
            this.invincibilityFlickerTimer.remove();
            this.invincibilityFlickerTimer = null;
        }
        if (this.invincibilityEndTimer) {
            this.invincibilityEndTimer.remove();
            this.invincibilityEndTimer = null;
        }

        // Start with full visibility
        this.container.alpha = 1;
        this.container.setVisible(true);

        // CRITICAL: Wait 100ms before starting flicker so player is solidly visible first
        this.invincibilityFlickerTimer = this.scene.time.delayedCall(100, () => {
            if (!this.scene || !this.active) return;

            // Use a tween that NEVER goes below 0.5 alpha
            const flicker = this.scene.tweens.add({
                targets: this.container,
                alpha: { from: 1, to: 0.5 }, // Only go down to 0.5, never invisible
                duration: 150,
                yoyo: true,
                repeat: Math.floor((CONFIG.player.invincibilityDuration - 100) / 300),
                onComplete: () => {
                    if (this.container) {
                        this.container.alpha = 1;
                        this.container.setVisible(true);
                    }
                }
            });
        });

        this.invincibilityEndTimer = this.scene.time.delayedCall(CONFIG.player.invincibilityDuration, () => {
            // Check if scene and player still exist
            if (!this.scene || !this.active) return;

            this.isInvincible = false;

            // Safely kill tweens
            if (this.scene.tweens && this.container) {
                this.scene.tweens.killTweensOf(this.container);
            }

            if (this.container) {
                this.container.alpha = 1;
                this.container.setVisible(true);
            }

            // Restore normal graphics color
            if (this.graphics) {
                this.graphics.clear();
                this.graphics.fillStyle(0x4a90e2, 1);
                this.graphics.fillRect(-14, -16, 28, 32);
            }

            console.log('[INVINCIBILITY END] Container restored to full visibility');
        });
    }

    flashRed() {
        this.graphics.clear();
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillRect(-14, -16, 28, 32);

        this.scene.time.delayedCall(100, () => {
            this.graphics.clear();
            this.graphics.fillStyle(0x4a90e2, 1);
            this.graphics.fillRect(-14, -16, 28, 32);
        });
    }

    die() {
        console.log('Player.die() called - transitioning to GameOverScene');
        this.health = 0;

        // Stop player movement
        this.setActive(false);
        this.setVisible(false);
        this.container.setVisible(false);
        this.healthBarBg.setVisible(false);
        this.healthBarFg.setVisible(false);
        if (this.healthText) {
            this.healthText.setVisible(false);
        }

        // Emit event for other systems
        this.scene.events.emit(EVENTS.PLAYER_DIED);

        // Transition to GameOverScene with player stats
        this.scene.time.delayedCall(500, () => {
            // Check if scene still exists before transitioning
            if (!this.scene || !this.scene.scene) return;

            this.scene.scene.start(SCENES.GAME_OVER, {
                coins: this.coins,
                level: this.scene.currentLevel || 1
            });
        });
    }

    collectCoin() {
        this.coins++;
        // Update coin display if it exists in the scene
        if (this.scene.coinText) {
            this.scene.coinText.setText(`${this.coins}`);
        }
        // Also update global state for compatibility
        if (window.gameState) {
            window.gameState.coins = this.coins;
        }
    }

    respawn(x, y) {
        // Re-enable physics body and reset position
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(false); // Keep sprite invisible (we use container)

        // Show and position visual container
        this.container.setVisible(true);
        this.container.alpha = 1;
        this.container.x = x;
        this.container.y = y;

        // Show health bars
        this.healthBarBg.setVisible(true);
        this.healthBarFg.setVisible(true);

        // Show health text
        if (this.healthText) {
            this.healthText.setVisible(true);
        }

        // Reset health and state
        this.health = this.maxHealth;
        this.updateHealthBar();

        // Update health text display
        if (this.healthText) {
            this.healthText.setText(`Health: ${this.health}`);
        }

        this.setVelocity(0, 0);
        this.isInvincible = false;
        this.hasDoubleJumped = false;
        this.canDoubleJump = false;

        console.log('Player respawned at', x, y, 'with health', this.health);
    }

    destroy() {
        this.graphics?.destroy();
        this.container?.destroy();
        this.healthBarBg?.destroy();
        this.healthBarFg?.destroy();
        this.healthText?.destroy();

        // Safely clear bullets group
        try {
            if (this.bullets && this.bullets.clear) {
                this.bullets.clear(true, true);
            }
        } catch (e) {
            // Ignore errors if bullets group is already destroyed
        }

        super.destroy();
    }
}
