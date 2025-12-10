import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { SCENES } from './utils/Constants.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import Level1Scene from './scenes/Level1Scene.js';
import Level2Scene from './scenes/Level2Scene.js';
import Level3Scene from './scenes/Level3Scene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import PauseScene from './scenes/PauseScene.js';

// Game configuration
const gameConfig = {
  type: Phaser.AUTO,
  width: CONFIG.width,
  height: CONFIG.height,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: CONFIG.gravity },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MenuScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    GameOverScene,
    VictoryScene,
    PauseScene,
  ],
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Initialize game
const game = new Phaser.Game(gameConfig);

// Global game state
window.gameState = {
  lives: CONFIG.lives,
  score: 0,
  coins: 0,
  currentLevel: 1,
  maxLevel: 1,
};
