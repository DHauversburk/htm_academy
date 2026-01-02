import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class StartScreen extends Scene {
    constructor() {
        super('StartScreen');
    }

    create() {
        EventBus.emit('scene-ready', this);

        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x0f172a).setOrigin(0);

        // Title Text
        this.add.text(this.scale.width / 2, this.scale.height / 3, 'HTM ACADEMY', {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '64px',
            color: '#e2e8f0',
            fontStyle: 'bold',
            stroke: '#0ea5e9',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Subtitle/Flavor Text
        this.add.text(this.scale.width / 2, this.scale.height / 3 + 60, 'Biomedical Simulation Training', {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '24px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        // Start Button Container
        const button = this.add.container(this.scale.width / 2, this.scale.height / 2 + 100);

        // Button Background
        const bg = this.add.rectangle(0, 0, 280, 80, 0x0ea5e9)
            .setInteractive({ useHandCursor: true });

        // Button Text
        const btnText = this.add.text(0, 0, 'START SHIFT', {
            fontFamily: 'Inter, system-ui',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, btnText]);

        // Hover Effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x0284c7); // Darker blue
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Sine.easeInOut'
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x0ea5e9); // Original blue
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Sine.easeInOut'
            });
        });

        // Click Action
        bg.on('pointerdown', () => {
            EventBus.emit('start-setup');
        });
    }
}
