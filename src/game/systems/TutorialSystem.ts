import { EventBus } from '../EventBus';
import { MainGame } from '../scenes/MainGame';

export type TutorialStep = {
    id: string;
    message: string;
    target?: { x: number, y: number }; // Target location for arrow
    action?: 'move' | 'interact_workbench' | 'interact_supplies' | 'complete_repair';
    trigger?: (scene: MainGame) => boolean;
};

export class TutorialSystem {
    private scene: MainGame;
    private currentStepIndex: number = 0;
    private isActive: boolean = false;
    private arrow!: Phaser.GameObjects.Graphics;
    private highlight!: Phaser.GameObjects.Graphics;

    // Tutorial Steps Definition
    private steps: TutorialStep[] = [
        {
            id: 'welcome',
            message: "Welcome, Technician! Use WASD or Joystick to move.",
            action: 'move',
            trigger: (scene: MainGame) => {
                // Check if player has moved significantly
                const player = scene.player;
                return player && (Math.abs(player.body.velocity.x) > 10 || Math.abs(player.body.velocity.y) > 10);
            }
        },
        {
            id: 'find_workbench',
            message: "Head to the WORKBENCH to see your tasks.",
            target: { x: 0, y: 0 }, // Will set dynamically
            action: 'interact_workbench'
        },
        {
            id: 'get_supplies',
            message: "You need parts! go to the SUPPLY CABINET.",
            target: { x: 0, y: 0 }, // Will set dynamically
            action: 'interact_supplies'
        },
        {
            id: 'repair',
            message: "Return to the workbench and fix the device!",
            target: { x: 0, y: 0 },
            action: 'complete_repair'
        }
    ];

    constructor(scene: MainGame) {
        this.scene = scene;
    }

    create() {
        // Create Visual Aids
        this.arrow = this.scene.add.graphics();
        this.arrow.setDepth(1000);
        this.arrow.setVisible(false);

        this.highlight = this.scene.add.graphics();
        this.highlight.setDepth(999);
        this.highlight.setVisible(false);

        // Listen for game events to progress tutorial
        EventBus.on('zone-enter', this.handleZoneEnter);
        EventBus.on('work-order-complete', this.handleWorkOrderComplete);
    }

    start() {
        this.isActive = true;
        this.currentStepIndex = 0;
        this.showStep(this.currentStepIndex);
        console.log('[Tutorial] Started');
    }

    update() {
        if (!this.isActive) return;

        const currentStep = this.steps[this.currentStepIndex];

        // Handle Movement Trigger
        if (currentStep.action === 'move' && currentStep.trigger) {
            if (currentStep.trigger(this.scene)) {
                this.nextStep();
            }
        }

        // Pulse the arrow
        if (this.arrow.visible) {
            this.arrow.y += Math.sin(this.scene.time.now / 100) * 0.5;
        }
    }

    private showStep(index: number) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[index];
        console.log(`[Tutorial] Step ${index}: ${step.message}`);

        // Emitting event for UI to display message
        EventBus.emit('tutorial-message', step.message);

        // Set targets dynamically if needed
        if (step.id === 'find_workbench') {
            const workbench = this.scene.getZone('Workbench');
            if (workbench) this.drawArrow(workbench.x, workbench.y);
        } else if (step.id === 'get_supplies') {
            const supplies = this.scene.getZone('Supplies');
            if (supplies) this.drawArrow(supplies.x, supplies.y);
        } else if (step.id === 'repair') {
            const workbench = this.scene.getZone('Workbench');
            if (workbench) this.drawArrow(workbench.x, workbench.y);
        } else {
            this.hideArrow();
        }
    }

    private nextStep() {
        this.currentStepIndex++;
        this.showStep(this.currentStepIndex);
    }

    private handleZoneEnter = (data: { name: string }) => {
        if (!this.isActive) return;
        const currentStep = this.steps[this.currentStepIndex];

        if (currentStep.id === 'find_workbench' && data.name === 'Workbench') {
            this.nextStep();
        } else if (currentStep.id === 'get_supplies' && data.name === 'Supplies') {
            this.nextStep();
        }
    };

    private handleWorkOrderComplete = () => {
        if (!this.isActive) return;
        const currentStep = this.steps[this.currentStepIndex];

        if (currentStep.id === 'repair') {
            this.nextStep();
        }
    };

    private drawArrow(x: number, y: number) {
        this.arrow.clear();
        this.arrow.fillStyle(0xffff00, 1);
        this.arrow.lineStyle(2, 0x000000, 1);

        // Draw downward arrow
        this.arrow.beginPath();
        this.arrow.moveTo(x, y - 40);
        this.arrow.lineTo(x, y - 20);
        this.arrow.lineTo(x - 10, y - 20);
        this.arrow.lineTo(x, y - 10); // Tip
        this.arrow.lineTo(x + 10, y - 20);
        this.arrow.lineTo(x, y - 20);
        this.arrow.fillPath();
        this.arrow.strokePath();

        this.arrow.setVisible(true);
    }

    private hideArrow() {
        this.arrow.setVisible(false);
    }

    private complete() {
        this.isActive = false;
        this.hideArrow();
        EventBus.emit('tutorial-complete');
        console.log('[Tutorial] Completed');
    }

    destroy() {
        EventBus.removeListener('zone-enter', this.handleZoneEnter);
        EventBus.removeListener('work-order-complete', this.handleWorkOrderComplete);
        this.arrow.destroy();
        this.highlight.destroy();
    }
}
