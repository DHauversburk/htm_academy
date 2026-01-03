import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class StartScreen extends Scene {
    constructor() {
        super('StartScreen');
    }

    create() {
        EventBus.emit('scene-ready', this);

        // Background (Just a dark clean slate, React handles the UI)
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x020617).setOrigin(0) // Slate-950
            .setName('bg')
            .setScrollFactor(0);

        // Handle Resize
        this.scale.on('resize', this.resize, this);
    }

    resize(gameSize: Phaser.Structs.Size) {
        const width = gameSize.width;
        const height = gameSize.height;

        const bg = this.children.getByName('bg') as Phaser.GameObjects.Rectangle;
        if (bg) {
            bg.setPosition(0, 0);
            bg.setSize(width, height);
        }
    }
}
