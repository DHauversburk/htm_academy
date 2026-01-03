import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class StartScreen extends Scene {
    private isGameReady = false;

    constructor() {
        super('StartScreen');
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0f172a).setOrigin(0);

        // Title Text
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'HTM ACADEMY', {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '64px',
            color: '#e2e8f0',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Prompt the UI to show the ProfileSetup component
        EventBus.emit('start-setup');

        // Listen for the signal from the UI to start the game
        EventBus.on('start-game', this.startGame, this);
        this.isGameReady = true;

        EventBus.emit('scene-ready', this);
    }

    startGame() {
        if (!this.isGameReady) return;
        this.isGameReady = false; // Prevent multiple starts
        EventBus.off('start-game', this.startGame, this);

        // Transition to the main game, tutorial, etc.
        // For now, let's assume it goes to the tutorial flow which starts in the BenchScene
        this.scene.start('BenchScene', { mode: 'tutorial' });
    }
}
