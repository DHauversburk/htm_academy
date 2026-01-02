import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { useGameStore } from '../store';

export class MainGame extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private interactKey!: Phaser.Input.Keyboard.Key;

    // Zones
    private zones: { x: number, name: string, callback: () => void }[] = [];
    private activeZone: string | null = null;
    private promptText!: Phaser.GameObjects.Text;

    constructor() {
        super('MainGame');
    }

    preload() {
        // Load as spritesheet to handle animation frames
        // Assuming the generator made a standard 64x64 grid based on the prompt "small scale"
        this.load.spritesheet('sprite_technician', 'assets/sprite_technician_chonk.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        // 1. World Bounds (Long Hallway)
        const worldWidth = 2000;
        const worldHeight = this.scale.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // 2. Environment "Art"
        this.add.rectangle(0, 0, worldWidth, 100, 0xe2e8f0).setOrigin(0);
        this.add.rectangle(0, 100, worldWidth, 400, 0xf8fafc).setOrigin(0);
        this.add.rectangle(0, 500, worldWidth, worldHeight - 500, 0x94a3b8).setOrigin(0);
        this.add.rectangle(0, 500, worldWidth, 10, 0x334155).setOrigin(0);

        // 3. Doors / Locations
        this.createLocation(300, 'Workshop', 0x3b82f6, () => this.openWorkshop());
        this.createLocation(1000, 'ICU', 0xef4444, () => this.showToast('No active tickets in ICU.'));
        this.createLocation(1600, 'Cafeteria', 0x10b981, () => this.showToast('Lunch break is at 12:00!'));

        // 4. Player Setup
        this.player = this.physics.add.sprite(300, 450, 'sprite_technician', 0);
        this.player.setScale(2.5);
        this.player.setCollideWorldBounds(true);
        this.player.setBodySize(32, 32); // Hitbox adjustment
        this.player.setOffset(16, 16); // Center the hitbox

        // Apply Selected Tint from Store
        const { avatarColor } = useGameStore.getState();
        this.player.setTint(avatarColor);

        // Animations
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('sprite_technician', { start: 0, end: 3 }), // Guessing first 4 frames are walk
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'sprite_technician', frame: 0 }],
                frameRate: 20
            });
        }

        // Start idle
        this.player.play('idle');
        // Constrain to "floor" area
        // We'll just let him walk left/right for now 

        // 5. Camera
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // 6. UI Prompt
        this.promptText = this.add.text(0, 0, 'Press E to Enter', {
            fontFamily: 'Inter',
            fontSize: '16px',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            color: '#ffffff'
        }).setVisible(false).setScrollFactor(0); // HUD style? Or floating? 
        // Actually let's make it floating above player
        this.promptText.setScrollFactor(1);

        // 7. Inputs
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,A,S,D');
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

            // Interaction Listener
            this.interactKey.on('down', () => {
                if (this.activeZone) {
                    const zone = this.zones.find(z => z.name === this.activeZone);
                    if (zone) zone.callback();
                }
            });
        }

        EventBus.emit('scene-ready', this);
    }

    update() {
        const speed = 300;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        if (!body) return;

        // Reset Velocity
        body.setVelocityX(0);

        // Movement
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            body.setVelocityX(-speed);
            this.player.setFlipX(true);
            this.player.play('walk', true);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            body.setVelocityX(speed);
            this.player.setFlipX(false);
            this.player.play('walk', true);
        } else {
            this.player.play('idle', true);
        }

        // Zone Checking
        this.checkZones();

        // Prompt Positioning
        if (this.activeZone) {
            this.promptText.setVisible(true);
            this.promptText.setPosition(this.player.x - 40, this.player.y - 80);
            this.promptText.setText(`Press E: ${this.activeZone}`);
        } else {
            this.promptText.setVisible(false);
        }
    }

    createLocation(x: number, name: string, color: number, callback: () => void) {
        // Door Visual
        const door = this.add.rectangle(x, 350, 120, 200, color);
        door.setStrokeStyle(4, 0x1e293b);

        // Door Frame
        this.add.rectangle(x, 350, 130, 210, 0x000000, 0).setStrokeStyle(2, 0xcbd5e1);

        // Label
        this.add.text(x, 240, name, {
            fontFamily: 'Inter', fontSize: '18px', color: '#1e293b', align: 'center', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Register Zone logic
        this.zones.push({ x, name, callback });
    }

    checkZones() {
        const playerX = this.player.x;
        let found = null;

        // Simple distance check
        for (const zone of this.zones) {
            if (Math.abs(playerX - zone.x) < 80) { // Within range
                found = zone.name;
                break;
            }
        }

        this.activeZone = found;
    }

    openWorkshop() {
        // Trigger the Work Order UI we built earlier
        // We'll fetch the first active order just to open the list
        // Actually, we just want to OPEN the list, not a specific order.
        // For now, let's just trigger the 'open-work-order' with a dummy or modify app to handle 'open-menu'
        // But better yet: Use the existing flow.

        // Let's just emit a custom event to App.tsx to show the queue if it's hidden?
        // App.tsx logic: "isSetupComplete && !isWorkOrderOpen && !isRepairMenuOpen && <WorkOrderList />"
        // The list is ALWAYS visible on the screen in valid state.

        // Feedback:
        // "You are in the workshop. Access the terminal to see jobs."
        this.showToast("Accessing Workshop Terminal...");
        // In the future, we could hide the list until you enter the room.
    }

    showToast(message: string) {
        // Quick hack to reuse the toast from App.tsx??
        // We can emit a valid event? 
        // Simulating a game alert via Phaser text for now
        const toast = this.add.text(this.player.x, this.player.y - 120, message, {
            backgroundColor: '#000000', color: '#ffffff', padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: toast,
            y: toast.y - 50,
            alpha: 0,
            duration: 2000,
            onComplete: () => toast.destroy()
        });
    }
}
