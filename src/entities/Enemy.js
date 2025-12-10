import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { EVENTS } from '../utils/Constants.js';
import { getDistance } from '../utils/Helpers.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'walker') {
        super(scene, x, y, null);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.config = CONFIG.enemies[type];
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.damage = this.config.damage;

        this.setCollideWorldBounds(true);
        this.setSize(28, 28);
        this.setVisible(false); // Hide sprite, we use graphics container for visuals

        // Movement properties
        this.patrolStartX = x;
        this.movementDirection = 1;
        this.lastShootTime = 0;
        this.lastJumpTime = 0;
        this.waveOffset = Math.random() * Math.PI * 2;

        // Create visual representation based on type
        this.createVisual();

        // AI behavior
        this.setupBehavior();
    }

    createVisual() {
        this.graphics = this.scene.add.graphics();
        this.container = this.scene.add.container(this.x, this.y, [this.graphics]);

        if (this.type === 'tank' || this.type === 'boss') {
            this.setSize(this.config.size || 40, this.config.size || 40);
        }

        this.drawVisual();
    }

    drawVisual(colorOverride = null) {
        if (!this.graphics) return;

        const colors = {
            walker: 0xe74c3c,
            shooter: 0x9b59b6,
            jumper: 0xe67e22,
            fastWalker: 0xc0392b,
            trackingShooter: 0x8e44ad,
            flyer: 0x3498db,
            tank: 0x2c3e50,
            boss: 0x8b0000,
        };

        const sizes = {
            walker: 28,
            shooter: 28,
            jumper: 28,
            fastWalker: 28,
            trackingShooter: 28,
            flyer: 28,
            tank: 40,
            boss: 56,
        };

        const size = sizes[this.type] || 28;
        const color = colorOverride !== null ? colorOverride : (colors[this.type] || 0xff0000);

        this.graphics.clear();
        this.graphics.fillStyle(color, 1);
        this.graphics.fillRect(-size / 2, -size / 2, size, size);
        this.graphics.lineStyle(2, 0x000000, 1);
        this.graphics.strokeRect(-size / 2, -size / 2, size, size);
    }

    setupBehavior() {
        switch (this.type) {
            case 'walker':
            case 'fastWalker':
                this.updateFunction = this.updateWalker;
                break;
            case 'shooter':
            case 'trackingShooter':
                this.updateFunction = this.updateShooter;
                this.body.setAllowGravity(false);
                this.setVelocityY(0);
                break;
            case 'jumper':
                this.updateFunction = this.updateJumper;
                break;
            case 'flyer':
                this.updateFunction = this.updateFlyer;
                this.body.setAllowGravity(false);
                break;
            case 'tank':
                this.updateFunction = this.updateTank;
                break;
            case 'boss':
                this.updateFunction = this.updateBoss;
                break;
        }
    }

    update(time, delta) {
        if (!this.active) return;

        // Update container position
        this.container.x = this.x;
        this.container.y = this.y;

        // Run type-specific behavior
        if (this.updateFunction) {
            this.updateFunction(time, delta);
        }
    }

    updateWalker(time, delta) {
        const speed = this.config.speed;
        const patrolDistance = this.config.patrolDistance;

        this.setVelocityX(speed * this.movementDirection);

        // Change direction at patrol boundaries
        if (Math.abs(this.x - this.patrolStartX) > patrolDistance) {
            this.movementDirection *= -1;
            this.container.scaleX = this.movementDirection;
        }

        // Change direction at ledges or walls
        if (this.body.blocked.left || this.body.blocked.right) {
            this.movementDirection *= -1;
            this.container.scaleX = this.movementDirection;
        }
    }

    updateShooter(time, delta) {
        const player = this.scene.player;
        if (!player || !player.active) return;

        const distance = getDistance(this.x, this.y, player.x, player.y);

        if (distance < 300 && time > this.lastShootTime + this.config.shootInterval) {
            this.shootAtPlayer(player);
            this.lastShootTime = time;
        }
    }

    updateJumper(time, delta) {
        const player = this.scene.player;
        if (!player || !player.active) return;

        // Move horizontally toward player
        const direction = player.x > this.x ? 1 : -1;
        this.setVelocityX(this.config.speed * direction);
        this.container.scaleX = direction;

        // Jump periodically when on ground
        if ((this.body.blocked.down || this.body.touching.down) &&
            time > this.lastJumpTime + this.config.jumpInterval) {
            this.setVelocityY(this.config.jumpVelocity);
            this.lastJumpTime = time;
        }
    }

    updateFlyer(time, delta) {
        const player = this.scene.player;
        if (!player || !player.active) return;

        // Move horizontally toward player
        const direction = player.x > this.x ? 1 : -1;
        this.setVelocityX(this.config.speed * direction);
        this.container.scaleX = direction;

        // Wave pattern vertically
        const waveY = Math.sin((time * this.config.frequency) + this.waveOffset) * this.config.amplitude;
        this.setVelocityY(waveY);
    }

    updateTank(time, delta) {
        this.updateWalker(time, delta);
        this.updateShooter(time, delta);
    }

    updateBoss(time, delta) {
        const player = this.scene.player;
        if (!player || !player.active) return;

        // Pattern 1: Move toward player
        const direction = player.x > this.x ? 1 : -1;
        this.setVelocityX(this.config.speed * direction);
        this.container.scaleX = direction;

        // Pattern 2: Shoot frequently
        if (time > this.lastShootTime + this.config.shootInterval) {
            this.shootSpread(player);
            this.lastShootTime = time;
        }
    }

    shootAtPlayer(player) {
        if (!this.scene.enemyBullets) return;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const bullet = this.scene.enemyBullets.get(this.x, this.y);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(false); // Hide sprite, use graphics

            if (!bullet.graphics) {
                bullet.graphics = this.scene.add.graphics();
            }

            // Redraw with glow effect
            bullet.graphics.clear();
            bullet.graphics.fillStyle(0xff0000, 0.3);
            bullet.graphics.fillCircle(0, 0, 10);
            bullet.graphics.fillStyle(0xff3300, 0.5);
            bullet.graphics.fillCircle(0, 0, 7);
            bullet.graphics.fillStyle(0xff0000, 1);
            bullet.graphics.fillCircle(0, 0, 4);
            bullet.graphics.fillStyle(0xffaaaa, 0.9);
            bullet.graphics.fillCircle(0, 0, 2);

            bullet.graphics.x = bullet.x;
            bullet.graphics.y = bullet.y;

            const bulletSpeed = 200;
            bullet.setVelocityX(Math.cos(angle) * bulletSpeed);
            bullet.setVelocityY(Math.sin(angle) * bulletSpeed);
            bullet.body.setAllowGravity(false);
            bullet.setSize(8, 8);
            bullet.damage = this.damage;

            this.scene.time.delayedCall(3000, () => {
                if (bullet.active) {
                    bullet.graphics?.destroy();
                    bullet.destroy();
                }
            });
        }
    }

    shootSpread(player) {
        const angles = [-0.3, 0, 0.3];
        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

        angles.forEach(offset => {
            const angle = baseAngle + offset;
            const bullet = this.scene.enemyBullets.get(this.x, this.y);

            if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(false); // Hide sprite, use graphics

                if (!bullet.graphics) {
                    bullet.graphics = this.scene.add.graphics();
                }

                // Redraw with glow effect
                bullet.graphics.clear();
                bullet.graphics.fillStyle(0xff0000, 0.3);
                bullet.graphics.fillCircle(0, 0, 10);
                bullet.graphics.fillStyle(0xff3300, 0.5);
                bullet.graphics.fillCircle(0, 0, 7);
                bullet.graphics.fillStyle(0xff0000, 1);
                bullet.graphics.fillCircle(0, 0, 4);
                bullet.graphics.fillStyle(0xffaaaa, 0.9);
                bullet.graphics.fillCircle(0, 0, 2);

                bullet.graphics.x = bullet.x;
                bullet.graphics.y = bullet.y;

                const bulletSpeed = 200;
                bullet.setVelocityX(Math.cos(angle) * bulletSpeed);
                bullet.setVelocityY(Math.sin(angle) * bulletSpeed);
                bullet.body.setAllowGravity(false);
                bullet.setSize(8, 8);
                bullet.damage = this.damage;

                this.scene.time.delayedCall(3000, () => {
                    if (bullet.active) {
                        bullet.graphics?.destroy();
                        bullet.destroy();
                    }
                });
            }
        });
    }

    takeDamage(amount = 1) {
        this.health -= amount;

        // Flash white on hit
        // Flash white on hit
        this.drawVisual(0xffffff);

        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.drawVisual(); // Restore original color
            }
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.scene.events.emit(EVENTS.ENEMY_KILLED, this.type);

        // Death animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            angle: 360,
            duration: 300,
            onComplete: () => {
                this.destroy();
            },
        });
    }

    destroy() {
        this.graphics?.destroy();
        this.container?.destroy();
        super.destroy();
    }
}
