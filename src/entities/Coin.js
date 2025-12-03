import Phaser from 'phaser';

export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, null);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.enable = true; // Explicitly enable physics body
        this.setSize(16, 16);
        this.setVisible(false); // Hide sprite itself

        // Create visual graphics directly (no container needed)
        this.graphics = scene.add.graphics();
        this.graphics.fillStyle(0xffdd00, 1);
        this.graphics.fillCircle(0, 0, 8);
        this.graphics.lineStyle(2, 0xff8800, 1);
        this.graphics.strokeCircle(0, 0, 8);

        // Position graphics at coin position
        this.graphics.x = x;
        this.graphics.y = y;

        // Store original Y for floating animation
        this.originalY = y;
        this.floatOffset = 0;
        this.floatSpeed = 0.002;
        this.spinScale = 1;
        this.spinSpeed = 0.001;
    }

    update(time, delta) {
        if (!this.active) return;

        // Update floating animation
        this.floatOffset = Math.sin(time * this.floatSpeed) * 5;
        const newY = this.originalY + this.floatOffset;

        // Move BOTH the physics body and graphics together
        this.y = newY;
        this.graphics.x = this.x;
        this.graphics.y = this.y;

        // Update spin animation  
        this.spinScale = 0.8 + Math.sin(time * this.spinSpeed) * 0.2;
        this.graphics.scaleX = this.spinScale;
    }

    collect() {
        // Particle effect - scale up and fade
        this.scene.tweens.add({
            targets: this.graphics,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 200,
            onComplete: () => {
                this.destroy();
            },
        });
    }

    destroy() {
        this.graphics?.destroy();
        super.destroy();
    }
}
