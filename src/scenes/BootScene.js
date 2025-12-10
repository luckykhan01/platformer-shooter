import Phaser from 'phaser';
import { SCENES } from '../utils/Constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Load all assets
        this.loadSprites();
        this.loadSounds();
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff',
            },
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    loadSprites() {
        // We'll create placeholder graphics for now and replace with AI-generated assets later
        // This ensures the game is functional while we generate proper sprites

        // Note: Asset files will be generated in the next phase
        // For now, we'll create simple colored rectangles as placeholders
    }

    loadSounds() {
        // Load music files
        this.load.audio('mainTheme', 'assets/sounds/music/maintheme.mp3');
        this.load.audio('level1Music', 'assets/sounds/music/LEVEL1.mp3');
        this.load.audio('level2Music', 'assets/sounds/music/LEVEL2.mp3');
        this.load.audio('level3Music', 'assets/sounds/music/LEVEL3.mp3');
    }

    create() {
        // Once assets are loaded, proceed to menu
        this.scene.start(SCENES.MENU);
    }
}
