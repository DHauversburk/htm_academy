import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Bench extends Scene {
    private multimeter!: Phaser.GameObjects.Container;
    private multimeterText!: Phaser.GameObjects.Text;
    private probeConnections: { red: string | null, black: string | null } = { red: null, black: null };

    // Hotspots on the device (pump)
    private hotspots: Phaser.GameObjects.Zone[] = [];

    private isTutorial = false;
    private tutorialStep = 0;
    private instructionText!: Phaser.GameObjects.Text;

    constructor() {
        super('BenchScene');
    }

    init(data: { mode: 'tutorial' | 'repair' }) {
        // data.mode can be 'tutorial' or 'repair'
        this.isTutorial = data.mode === 'tutorial';
    }

    private cables!: Phaser.GameObjects.Graphics;
    private probes: Phaser.GameObjects.Image[] = [];

    preload() {
        this.load.image('device_pump', 'assets/device_pump.png');
        this.load.image('tool_multimeter', 'assets/tool_multimeter.png');
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // Red Probe Visual
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(20, 20, 15); // Larger circle
        graphics.generateTexture('probe_red_tip', 40, 40);

        graphics.clear();

        // Black Probe Visual
        graphics.fillStyle(0x000000);
        graphics.fillCircle(20, 20, 15); // Larger circle
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeCircle(20, 20, 15); // White border for visibility
        graphics.generateTexture('probe_black_tip', 40, 40);
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x334155).setOrigin(0);

        // Device placement
        const device = this.add.image(this.scale.width / 2, this.scale.height / 2 - 50, 'device_pump');
        device.setScale(0.8);

        // Hotspots (Larger size)
        this.createHotspot(device.x - 100, device.y + 50, 'ground_lug');
        this.createHotspot(device.x + 80, device.y + 60, 'power_neutral');
        this.createHotspot(device.x + 100, device.y + 60, 'power_live');

        // Cable Graphics Layer (Behind Multimeter)
        this.cables = this.add.graphics();

        // Multimeter
        this.createMultimeter(this.scale.width - 150, this.scale.height - 150);

        // UI Layer
        if (this.isTutorial) {
            this.createTutorialUI();
        } else {
            this.createStandardUI();
        }

        EventBus.emit('scene-ready', this);
    }

    update() {
        // Redraw cables
        this.cables.clear();
        if (this.multimeter && this.probes.length === 2) {
            const redProbe = this.probes[0];
            const blackProbe = this.probes[1];

            // Red Cable
            this.cables.lineStyle(4, 0xef4444);
            this.cables.beginPath();
            this.cables.moveTo(this.multimeter.x + 20, this.multimeter.y + 50);
            this.cables.lineTo(redProbe.x, redProbe.y);
            this.cables.strokePath();

            // Black Cable
            this.cables.lineStyle(4, 0x1e293b);
            this.cables.beginPath();
            this.cables.moveTo(this.multimeter.x - 20, this.multimeter.y + 50);
            this.cables.lineTo(blackProbe.x, blackProbe.y);
            this.cables.strokePath();
        }
    }

    // ... (UI Methods remain mostly same, simplified for brevity in this replacement chunk)

    createStandardUI() {
        this.add.text(20, 20, '← Back to Workshop', {
            fontFamily: 'Inter', fontSize: '20px', color: '#ffffff', backgroundColor: '#0f172a', padding: { x: 10, y: 5 }
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MainGame');
                EventBus.emit('ui-closed');
            });

        this.add.text(this.scale.width - 20, 20, '🛠️ Perform Repairs', {
            fontFamily: 'Inter', fontSize: '20px', color: '#ffffff', backgroundColor: '#2563eb', padding: { x: 15, y: 8 }
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                EventBus.emit('open-repair-menu');
            });
    }

    createTutorialUI() {
        const banner = this.add.rectangle(this.scale.width / 2, 60, this.scale.width * 0.9, 100, 0x0f172a, 0.95);
        banner.setStrokeStyle(2, 0x3b82f6);

        this.instructionText = this.add.text(this.scale.width / 2, 60,
            "TASK: Check Voltage\nOscillate probes to find 120V.", {
            fontFamily: 'Inter', fontSize: '22px', color: '#ffffff', align: 'center', wordWrap: { width: this.scale.width * 0.8 }
        }).setOrigin(0.5);

        this.add.text(this.scale.width - 20, 130, 'SKIP >>', {
            fontFamily: 'Inter', fontSize: '16px', color: '#94a3b8', backgroundColor: '#1e293b', padding: { x: 12, y: 8 }
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // event.stopPropagation();
                EventBus.emit('tutorial-complete');
                this.add.text(this.scale.width / 2, this.scale.height / 2, "Loading Shift Parameters...", { fontSize: '32px', backgroundColor: '#000' }).setOrigin(0.5);
            });
    }

    validateTutorial(redSpot: string | null, blackSpot: string | null) {
        if (!this.isTutorial) return;

        // Step 1: Measure Voltage
        if (this.tutorialStep === 0) {
            if ((redSpot === 'power_live' && blackSpot === 'power_neutral') ||
                (redSpot === 'power_neutral' && blackSpot === 'power_live')) {

                this.tutorialStep++;
                this.instructionText.setText("SUCCESS! Reading confirmed: ~120V.\nNow, tap 'Complete Training' to start your first shift.");
                this.instructionText.setColor('#4ade80');

                // Show completion button
                const btn = this.add.text(this.scale.width / 2, this.scale.height - 100, 'COMPLETE TRAINING', {
                    fontFamily: 'Inter', fontSize: '24px', color: '#000000', backgroundColor: '#4ade80', padding: { x: 20, y: 10 }
                })
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        EventBus.emit('tutorial-complete');
                        btn.disableInteractive().setText("INITIALIZING SHIFT...");
                    });
            }
        }
    }

    createHotspot(x: number, y: number, id: string) {
        const zone = this.add.zone(x, y, 60, 60).setRectangleDropZone(60, 60); // Increased drop zone size for mobile
        zone.setData('id', id);
        this.hotspots.push(zone);

        // Debug visual (toggle comment to hide) - Helpful for testing touch areas
        // const gfx = this.add.graphics();
        // gfx.lineStyle(2, 0xffff00);
        // gfx.strokeRect(x - 30, y - 30, 60, 60);
    }

    createMultimeter(x: number, y: number) {
        this.multimeter = this.add.container(x, y);

        const meterBody = this.add.image(0, 0, 'tool_multimeter').setScale(0.5);
        this.multimeter.add(meterBody);

        this.multimeterText = this.add.text(-35, -50, '0.00 V', {
            fontFamily: 'monospace', fontSize: '24px', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.multimeter.add(this.multimeterText);

        const r = this.createProbe(50, 100, 'probe_red_tip', 'red');
        const b = this.createProbe(-50, 100, 'probe_black_tip', 'black');
        this.probes = [r, b]; // Track for cable drawing
    }

    createProbe(offsetX: number, offsetY: number, texture: string, colorId: 'red' | 'black') {
        // Start relative to multimeter but become independent in world space for cleaner dragging
        const startX = this.multimeter.x + offsetX;
        const startY = this.multimeter.y + offsetY;

        const probe = this.add.image(startX, startY, texture)
            .setInteractive({ draggable: true, cursor: 'pointer' });

        // Embiggen hit area!
        probe.input!.hitArea.setTo(-20, -20, 80, 80); // Massive usage area

        probe.setData('color', colorId);

        probe.on('dragstart', () => {
            // Unplug logic
            if (colorId === 'red') this.probeConnections.red = null;
            if (colorId === 'black') this.probeConnections.black = null;
            this.calculateReading();

            // Visual feedback
            this.tweens.add({ targets: probe, scale: 1.5, duration: 100 });
            probe.setDepth(100); // Bring to front
        });

        probe.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            probe.x = dragX;
            probe.y = dragY - 40; // Offset y so finger doesn't hide it!
        });

        probe.on('dragend', () => {
            this.tweens.add({ targets: probe, scale: 1.0, duration: 100 });
            probe.setDepth(10);
        });

        probe.on('drop', (_pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.Zone) => {
            probe.x = target.x;
            probe.y = target.y;

            const spotId = target.getData('id');
            if (colorId === 'red') this.probeConnections.red = spotId;
            if (colorId === 'black') this.probeConnections.black = spotId;

            this.calculateReading();
        });

        return probe;
    }

    calculateReading() {
        const r = this.probeConnections.red;
        const b = this.probeConnections.black;

        // Logic: Measuring AC Voltage (simulated)
        if ((r === 'power_live' && b === 'power_neutral') || (r === 'power_neutral' && b === 'power_live')) {
            this.multimeterText.setText('120.1 V');
        } else if ((r === 'power_live' && b === 'ground_lug') || (r === 'ground_lug' && b === 'power_live')) {
            this.multimeterText.setText('119.8 V'); // Slightly different to feel real
        } else if (r && b) {
            // Connected to random meaningless things
            this.multimeterText.setText('0.00 V');
        } else {
            // Floating
            this.multimeterText.setText('---');
        }

        this.validateTutorial(r, b);
    }
}
