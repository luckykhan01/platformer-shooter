export const SCENES = {
    BOOT: 'BootScene',
    MENU: 'MenuScene',
    LEVEL_1: 'Level1Scene',
    LEVEL_2: 'Level2Scene',
    LEVEL_3: 'Level3Scene',
    GAME_OVER: 'GameOverScene',
    VICTORY: 'VictoryScene',
};

export const EVENTS = {
    PLAYER_HIT: 'playerHit',
    PLAYER_DIED: 'playerDied',
    ENEMY_KILLED: 'enemyKilled',
    COIN_COLLECTED: 'coinCollected',
    LEVEL_COMPLETE: 'levelComplete',
    SCORE_UPDATED: 'scoreUpdated',
};

export const LAYERS = {
    BACKGROUND: 0,
    PLATFORMS: 1,
    COINS: 2,
    ENEMIES: 3,
    PLAYER: 4,
    BULLETS: 5,
    UI: 6,
};

export const COLORS = {
    PRIMARY: 0x4a90e2,
    DANGER: 0xe74c3c,
    SUCCESS: 0x2ecc71,
    WARNING: 0xf39c12,
    WHITE: 0xffffff,
    BLACK: 0x000000,
};
