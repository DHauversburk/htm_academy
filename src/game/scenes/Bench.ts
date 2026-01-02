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

    init(data: any) {
        // data.mode can be 'tutorial' or 'repair'
        this.isTutorial = data.mode === 'tutorial';
    }

    preload() {
        this.load.image('device_pump', 'assets/device_pump.png');
        this.load.image('tool_multimeter', 'assets/tool_multimeter.png');
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('probe_red_tip', 20, 20);

        graphics.clear();
        graphics.fillStyle(0x000000);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('probe_black_tip', 20, 20);
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x334155).setOrigin(0);

        // Device placement
        const device = this.add.image(this.scale.width / 2, this.scale.height / 2 - 50, 'device_pump');
        device.setScale(0.8);

        // Hotspots
        this.createHotspot(device.x - 100, device.y + 50, 'ground_lug');
        this.createHotspot(device.x + 80, device.y + 60, 'power_neutral');
        this.createHotspot(device.x + 100, device.y + 60, 'power_live');

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

    createStandardUI() {
        // Back Button
        this.add.text(20, 20, '← Back to Workshop', {
            fontFamily: 'Inter', fontSize: '20px', color: '#ffffff', backgroundColor: '#0f172a', padding: { x: 10, y: 5 }
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MainGame');
                EventBus.emit('ui-closed');
            });

        // Repair Button
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
        // Instruction Banner
        const banner = this.add.rectangle(this.scale.width / 2, 60, this.scale.width * 0.8, 80, 0x0f172a, 0.9);
        banner.setStrokeStyle(2, 0x3b82f6);

        this.instructionText = this.add.text(this.scale.width / 2, 60,
            "ORIENTATION TASK: Verify Outlet Voltage\nDrag the RED probe to the LIVE pin (Right) and BLACK to NEUTRAL (Left).", {
            fontFamily: 'Inter', fontSize: '18px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        // Skip Button
        this.add.text(this.scale.width - 20, 110, 'SKIP TRAINING >>', {
            fontFamily: 'Inter', fontSize: '14px', color: '#94a3b8', backgroundColor: '#1e293b', padding: { x: 8, y: 4 }
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MainGame');
                EventBus.emit('tutorial-complete');
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
                this.add.text(this.scale.width / 2, this.scale.height - 100, 'COMPLETE TRAINING', {
                    fontFamily: 'Inter', fontSize: '24px', color: '#000000', backgroundColor: '#4ade80', padding: { x: 20, y: 10 }
                })
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        this.scene.start('MainGame');
                        // Signal App to enable Work Orders now
                        EventBus.emit('tutorial-complete');
                    });
            }
        }
    }

    createHotspot(x: number, y: number, id: string) {
        const zone = this.add.zone(x, y, 40, 40).setRectangleDropZone(40, 40);
        zone.setData('id', id);
        this.hotspots.push(zone);

        // Debug visual (toggle comment to hide)
        // const gfx = this.add.graphics();
        // gfx.lineStyle(2, 0xffff00);
        // gfx.strokeRect(x - 20, y - 20, 40, 40);
    }

    createMultimeter(x: number, y: number) {
        this.multimeter = this.add.container(x, y);

        // Body
        const meterBody = this.add.image(0, 0, 'tool_multimeter').setScale(0.5);
        this.multimeter.add(meterBody);

        // Digital Display Text
        this.multimeterText = this.add.text(-35, -50, '0.00 V', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.multimeter.add(this.multimeterText);

        // Probes (Draggable)
        this.createProbe(50, 100, 'probe_red_tip', 'red');
        this.createProbe(-50, 100, 'probe_black_tip', 'black');

        // Add lines connecting probes to meter (simplified visualization)
        // In a polished version, we'd use Phaser.GameObjects.Rope or dynamic Graphics lines
    }

    createProbe(offsetX: number, offsetY: number, texture: string, colorId: 'red' | 'black') {
        const probe = this.add.image(this.multimeter.x + offsetX, this.multimeter.y + offsetY, texture)
            .setInteractive({ draggable: true });

        probe.setData('color', colorId);

        probe.on('drag', (_pointer: any, dragX: number, dragY: number) => {
            probe.x = dragX;
            probe.y = dragY;
        });

        probe.on('drop', (_pointer: any, target: Phaser.GameObjects.Zone) => {
            // Snap to target
            probe.x = target.x;
            probe.y = target.y;

            // Record connection
            const spotId = target.getData('id');
            if (colorId === 'red') this.probeConnections.red = spotId;
            if (colorId === 'black') this.probeConnections.black = spotId;

            this.calculateReading();
        });

        probe.on('dragstart', () => {
            // Disconnect
            if (colorId === 'red') this.probeConnections.red = null;
            if (colorId === 'black') this.probeConnections.black = null;
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
