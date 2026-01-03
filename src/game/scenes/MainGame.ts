import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { useGameStore } from '../store';
import { GridMapManager } from '../systems/GridMapManager';
import { InterruptionManager } from '../systems/InterruptionManager';
import type { InterruptionEvent } from '../types';

export class MainGame extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private joystickInput = { x: 0, y: 0 };

    private mapManager!: GridMapManager;

    // Interactions
    private zones: { x: number, y: number, name: string, callback: () => void }[] = [];
    private activeZone: string | null = null;
    private promptText!: Phaser.GameObjects.Text;

    // NPCs
    private npcs: Phaser.Physics.Arcade.Sprite[] = [];

    constructor() {
        super('MainGame');
    }

    preload() {
        this.load.spritesheet('sprite_technician', 'assets/sprite_technician_chonk.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        // 1. Map Generation
        this.mapManager = new GridMapManager(this);
        // Small clinic: 128x128
        this.mapManager.createProceduralMap(128, 128);
        const layer = this.mapManager.getLayer();

        // 2. Player Setup
        const spawn = this.mapManager.getSpawnPoint();
        this.player = this.physics.add.sprite(spawn.x, spawn.y, 'sprite_technician', 0);
        this.player.setScale(1.5); // Slightly smaller for top-down
        this.player.setBodySize(24, 24);
        this.player.setOffset(20, 32); // Lower body hitbox
        this.player.setCollideWorldBounds(true);

        // Collision with Walls
        this.physics.add.collider(this.player, layer);

        // Apply Tint
        const { avatarColor } = useGameStore.getState();
        this.player.setTint(avatarColor);

        // 3. Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        const targetViewWidth = 16 * 32;
        const zoom = this.scale.width / targetViewWidth;
        this.cameras.main.setZoom(Math.min(Math.max(zoom, 0.5), 2));

        // 4. Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,A,S,D');

            // DEBUG
            this.input.keyboard.on('keydown-I', () => {
                InterruptionManager.triggerRandomInterruption('medium');
            });
        }

        EventBus.on('joystick-move', (data: { x: number, y: number }) => {
            this.joystickInput = data;
        });

        // Cleanup
        this.events.on('shutdown', () => {
            EventBus.removeListener('joystick-move');
        });

        // 5. Interactions
        this.createInteractionZones();

        // 6. Interruptions
        this.listenForInterruptions();

        EventBus.emit('scene-ready', this);
    }

    update() {
        // Player Movement
        this.handlePlayerMovement();

        // Zone Checking
        this.checkZones();
    }

    handlePlayerMovement() {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Get Dynamic Speed from Store
        const moveSpeed = useGameStore.getState().calculateSpeed();

        body.setVelocity(0);

        // Input Vector
        let dx = 0;
        let dy = 0;

        // Keyboard
        if (this.cursors?.left.isDown || this.wasd?.A.isDown) dx = -1;
        else if (this.cursors?.right.isDown || this.wasd?.D.isDown) dx = 1;

        if (this.cursors?.up.isDown || this.wasd?.W.isDown) dy = -1;
        else if (this.cursors?.down.isDown || this.wasd?.S.isDown) dy = 1;

        // Joystick Override
        if (Math.abs(this.joystickInput.x) > 0.1 || Math.abs(this.joystickInput.y) > 0.1) {
            dx = this.joystickInput.x;
            dy = this.joystickInput.y;
        }

        // Normalize & Apply
        if (dx !== 0 || dy !== 0) {
            const angle = Math.atan2(dy, dx);
            const speedX = Math.cos(angle) * moveSpeed;
            const speedY = Math.sin(angle) * moveSpeed;

            body.setVelocity(speedX, speedY);

            // Animations
            this.player.play('walk', true);
            this.player.setFlipX(dx < 0);
        } else {
            this.player.play('idle', true);
        }
    }

    // --- Interaction System ---

    createInteractionZones() {
        // UI Prompt
        this.promptText = this.add.text(0, 0, 'Press E', {
            fontFamily: 'Inter', fontSize: '14px', backgroundColor: '#000000', color: '#ffffff', padding: { x: 6, y: 3 }
        }).setVisible(false).setDepth(100);

        // Place Locations in their generated rooms
        this.placeZone('Workshop', 0x3b82f6, () => this.openWorkshop());
        this.placeZone('ICU', 0xef4444, () => this.showToast("ICU: All Systems Normal"));
        this.placeZone('Cafeteria', 0x10b981, () => this.showToast("Cafeteria: Coffee is fresh!"));
    }

    placeZone(name: string, color: number, callback: () => void) {
        let pos = { x: 0, y: 0 };

        // Try to find specific room first
        const room = this.mapManager.getRoom(name);
        if (room) {
            pos = this.mapManager.tileToWorld(room.centerX, room.centerY);
        } else {
            pos = this.mapManager.getRandomFloorPosition();
        }

        // Visual Marker
        this.add.circle(pos.x, pos.y, 16, color, 0.5);
        this.add.text(pos.x, pos.y - 24, name, {
            fontSize: '12px', color: '#ffffff', backgroundColor: '#00000080'
        }).setOrigin(0.5);

        this.zones.push({ x: pos.x, y: pos.y, name, callback });
    }

    checkZones() {
        const playerX = this.player.x;
        const playerY = this.player.y;
        let found = null;

        for (const zone of this.zones) {
            const dist = Phaser.Math.Distance.Between(playerX, playerY, zone.x, zone.y);
            if (dist < 40) { // Interaction Radius
                found = zone.name;
                break;
            }
        }

        this.activeZone = found;

        if (this.activeZone) {
            this.promptText.setVisible(true);
            this.promptText.setPosition(this.player.x, this.player.y - 40);
            this.promptText.setText(`E: ${this.activeZone}`);

            // Interaction Input
            if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('E'), 500)) {
                const zone = this.zones.find(z => z.name === this.activeZone);
                if (zone) zone.callback();
            }
        } else {
            this.promptText.setVisible(false);
        }
    }

    openWorkshop() {
        this.showToast("Accessing Workshop Terminal...");
        // TODO: Trigger actual workshop logic
    }

    showToast(msg: string) {
        EventBus.emit('show-toast', msg);
    }

    // --- NPC System ---

    listenForInterruptions() {
        EventBus.on('spawn-interruption-npc', (eventAny: any) => {
            const event = eventAny as InterruptionEvent;
            this.spawnNPC(event);
        });
    }

    spawnNPC(event: InterruptionEvent) {
        // Spawn randomly
        const pos = this.mapManager.getRandomFloorPosition();

        const npc = this.physics.add.sprite(pos.x, pos.y, 'sprite_technician', 0);
        npc.setTint(0x4ade80); // Nurse Green
        npc.setScale(1.5);
        npc.setBodySize(24, 24);

        npc.setData('event', event);
        this.npcs.push(npc);
    }
}
