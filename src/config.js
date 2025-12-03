export const CONFIG = {
  // Game dimensions
  width: 800,
  height: 600,

  // Physics
  gravity: 800,

  // Player settings
  player: {
    speed: 160,
    jumpVelocity: -400,
    doubleJumpVelocity: -350,
    maxHealth: 3,
    invincibilityDuration: 1500, // ms
    shootCooldown: 250, // ms
  },

  // Bullet settings
  bullet: {
    speed: 400,
    damage: 1,
    lifespan: 2000, // ms
  },

  // Enemy settings
  enemies: {
    walker: {
      speed: 60,
      health: 1,
      damage: 1,
      patrolDistance: 150,
    },
    shooter: {
      health: 2,
      damage: 1,
      shootInterval: 2000,
    },
    jumper: {
      speed: 80,
      health: 2,
      damage: 1,
      jumpInterval: 1500,
      jumpVelocity: -300,
    },
    fastWalker: {
      speed: 120,
      health: 2,
      damage: 1,
      patrolDistance: 200,
    },
    trackingShooter: {
      health: 3,
      damage: 1,
      shootInterval: 1800,
    },
    flyer: {
      speed: 80,
      health: 2,
      damage: 1,
      amplitude: 50,
      frequency: 0.02,
    },
    tank: {
      speed: 40,
      health: 5,
      damage: 2,
      patrolDistance: 100,
      shootInterval: 2500,
    },
    boss: {
      speed: 60,
      health: 15,
      damage: 2,
      shootInterval: 1500,
    },
  },

  // Game settings
  lives: 1,
  coinValue: 10,

  // Level settings
  levels: {
    1: {
      name: 'Green Gardens',
      theme: 'grass',
      difficulty: 'easy',
      enemyTypes: ['walker', 'shooter'],
      targetCoins: 20,
    },
    2: {
      name: 'Stone Caverns',
      theme: 'stone',
      difficulty: 'medium',
      enemyTypes: ['walker', 'shooter', 'jumper', 'fastWalker', 'trackingShooter'],
      targetCoins: 25,
    },
    3: {
      name: 'Metal Fortress',
      theme: 'metal',
      difficulty: 'hard',
      enemyTypes: ['fastWalker', 'trackingShooter', 'flyer', 'tank', 'boss'],
      targetCoins: 30,
    },
  },
};
