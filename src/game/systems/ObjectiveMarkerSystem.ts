import { Scene } from 'phaser';

export interface Objective {
    id: string;
    x: number;
    y: number;
    label: string;
    icon?: string;
}

export class ObjectiveMarkerSystem {
    private scene: Scene;
    private markers: Map<string, Phaser.GameObjects.Container> = new Map();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    addObjective(objective: Objective) {
        // Create marker container
        const container = this.scene.add.container(objective.x, objective.y);
        container.setDepth(500);

        // Pulsing arrow pointing down
        const arrow = this.scene.add.graphics();
        arrow.fillStyle(0x3b82f6, 1);
        arrow.fillTriangle(-8, -20, 8, -20, 0, -10);
        container.add(arrow);

        // Icon background circle
        const iconBg = this.scene.add.circle(0, 0, 16, 0x1e40af, 1);
        container.add(iconBg);

        // Icon (emoji or default)
        const iconText = this.scene.add.text(0, 0, objective.icon || '📍', {
            fontSize: '20px',
        });
        iconText.setOrigin(0.5);
        container.add(iconText);

        // Label below
        const label = this.scene.add.text(0, 24, objective.label, {
            fontFamily: 'Inter',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        });
        label.setOrigin(0.5, 0);
        container.add(label);

        // Pulse animation
        this.scene.tweens.add({
            targets: container,
            y: objective.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.markers.set(objective.id, container);
    }

    removeObjective(id: string) {
        const marker = this.markers.get(id);
        if (marker) {
            marker.destroy();
            this.markers.delete(id);
        }
    }

    clearAll() {
        this.markers.forEach(marker => marker.destroy());
        this.markers.clear();
    }

    update() {
        // Could add distance-based scaling or off-screen indicators here
    }
}
