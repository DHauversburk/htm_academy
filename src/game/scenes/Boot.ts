import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load assets here (images, spritesheets)
        // For now, we'll just draw some placeholders
        this.load.setPath('assets');
    }

    create() {
        this.scene.start('StartScreen');
    }
}
