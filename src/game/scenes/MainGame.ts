import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { useGameStore } from '../store';
import { GridMapManager } from '../systems/GridMapManager';
import { InterruptionManager } from '../systems/InterruptionManager';
import { PathfindingSystem } from '../systems/PathfindingSystem';
import type { InterruptionEvent } from '../types';

export class MainGame extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private wasd!: any;
    private joystickInput = { x: 0, y: 0 };

    private mapManager!: GridMapManager;
    private pathfinding!: PathfindingSystem;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private shiftData: any = null; // Stored shift config

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    init(data: any) {
        this.shiftData = data?.shift || null;
        console.log("MainGame Init with Shift Data:", this.shiftData);
    }

    create() {
        // Background (Slate 950)
        this.cameras.main.setBackgroundColor('#020617');

        // Expose for Debugging
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).game = this.game;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).mainScene = this;
        // console.log("DEBUG: Game and MainScene exposed to window");

        // 1. Map Generation
        this.mapManager = new GridMapManager(this);
        // Use provided config or default
        const mapConfig = this.shiftData?.mapConfig || { width: 64, height: 64 };

        try {
            this.mapManager.createProceduralMap(mapConfig);
            console.log("Map Generated Successfully");
        } catch (e) {
            console.error("Map Generation Failed:", e);
        }

        const layer = this.mapManager.getLayer();

        // 2. Pathfinding Init
        this.pathfinding = new PathfindingSystem();
        this.pathfinding.setGrid(this.mapManager.getCollisionGrid());

        // 3. Player Setup
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

        // CREATE ANIMATIONS (using only frames that exist: 0-3)
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('sprite_technician', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'sprite_technician', frame: 0 }],
                frameRate: 1
            });
        }

        // 4. Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        const targetViewWidth = 16 * 32;
        const zoom = this.scale.width / targetViewWidth;
        // Force a more zoomed-in view, minimum 1.5x up to 3x
        this.cameras.main.setZoom(Math.min(Math.max(zoom, 1.0), 2.0));

        // 5. Input
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

        // 6. Interactions
        this.createInteractionZones();

        // 7. Interruptions
        this.listenForInterruptions();

        EventBus.emit('scene-ready', this);
    }

    update() {
        // Player Movement
        this.handlePlayerMovement();

        // Zone Checking
        this.checkZones();

        // NPC Movement
        this.handleNPCMovement();
    }


    handlePlayerMovement() {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Get Dynamic Speed from Store
        const baseSpeed = useGameStore.getState().calculateSpeed();
        const acceleration = baseSpeed * 12; // Faster acceleration for snappier feel
        const maxSpeed = baseSpeed * 1.2; // Slightly higher max speed

        // Add drag for smoother stopping
        body.setDrag(800);
        body.setMaxVelocity(maxSpeed);

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

        // Apply acceleration-based movement
        if (dx !== 0 || dy !== 0) {
            const angle = Math.atan2(dy, dx);
            const accelX = Math.cos(angle) * acceleration;
            const accelY = Math.sin(angle) * acceleration;

            body.setAcceleration(accelX, accelY);

            // Simple animation
            this.player.play('walk', true);
            this.player.setFlipX(dx < 0); // Face left when moving left
        } else {
            body.setAcceleration(0);
            this.player.play('idle', true);
        }
    }

    // --- Interaction System ---

    createInteractionZones() {
        // UI Prompt
        this.promptText = this.add.text(0, 0, 'Press E', {
            fontFamily: 'Inter', fontSize: '14px', backgroundColor: '#000000', color: '#ffffff', padding: { x: 6, y: 3 }
        }).setVisible(false).setDepth(100);

        // 1. Workshop Zones
        const workshopRoom = this.mapManager.getRoom('Workshop');
        if (workshopRoom) {
            // Main Bench - Represented as a workstation icon
            const benchPos = this.mapManager.tileToWorld(workshopRoom.centerX, workshopRoom.centerY);
            this.addObjectZone(benchPos.x, benchPos.y, 'Workbench', '🔧', 0x3b82f6, () => this.openWorkshop());

            // Supply Cabinet - Represented as a cabinet icon
            const cabinetPos = this.mapManager.tileToWorld(workshopRoom.centerX - 2, workshopRoom.centerY - 2);
            this.addObjectZone(cabinetPos.x, cabinetPos.y, 'Supplies', '📦', 0xf59e0b, () => EventBus.emit('open-supply-cabinet'));
        } else {
            // Fallback if map gen failed (shouldn't happen with fixed rooms)
            this.placeObjectZone('Workbench', '🔧', 0x3b82f6, () => this.openWorkshop());
        }

        // 2. Hospital Departments
        this.placeObjectZone('ICU', '🏥', 0xef4444, () => this.showToast("ICU: All Systems Normal"));
        this.placeObjectZone('Cafeteria', '☕', 0x10b981, () => this.showToast("Cafeteria: Coffee is fresh!"));
    }

    addObjectZone(x: number, y: number, name: string, icon: string, color: number, callback: () => void) {
        // Create a container for the object
        const container = this.add.container(x, y);

        // Background rectangle (represents the object)
        const bg = this.add.rectangle(0, 0, 48, 48, color, 0.8);
        bg.setStrokeStyle(3, 0xffffff, 0.9);
        container.add(bg);

        // Icon (emoji) on top
        const iconText = this.add.text(0, 0, icon, {
            fontSize: '28px'
        }).setOrigin(0.5);
        container.add(iconText);

        // Label below
        const label = this.add.text(0, 32, name, {
            fontSize: '11px',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        container.add(label);

        // Add subtle pulse animation
        this.tweens.add({
            targets: container,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.zones.push({ x, y, name, callback });
    }

    placeObjectZone(name: string, icon: string, color: number, callback: () => void) {
        let pos = { x: 0, y: 0 };

        // Try to find specific room first
        const room = this.mapManager.getRoom(name);
        if (room) {
            pos = this.mapManager.tileToWorld(room.centerX, room.centerY);
        } else {
            pos = this.mapManager.getRandomFloorPosition();
        }

        this.addObjectZone(pos.x, pos.y, name, icon, color, callback);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        EventBus.on('spawn-interruption-npc', (eventAny: any) => {
            const event = eventAny as InterruptionEvent;
            this.spawnNPC(event);
        });
    }

    async spawnNPC(event: InterruptionEvent) {
        // Spawn randomly... but realistically from an entrance?
        // Let's spawn them at the "Lobby" or "Entrance" room if possible.
        let spawnPos = { x: 0, y: 0 };
        const lobby = this.mapManager.getRoom('Lobby');
        if (lobby) {
            spawnPos = this.mapManager.tileToWorld(lobby.centerX, lobby.centerY);
        } else {
            spawnPos = this.mapManager.getRandomFloorPosition();
        }

        const npc = this.physics.add.sprite(spawnPos.x, spawnPos.y, 'sprite_technician', 0);
        npc.setTint(0x4ade80); // Nurse Green
        npc.setScale(1.5);
        npc.setBodySize(24, 24);
        npc.setData('event', event);
        this.npcs.push(npc);

        // Pathfind to Player
        const start = this.mapManager.worldToTile(spawnPos.x, spawnPos.y);
        const end = this.mapManager.worldToTile(this.player.x, this.player.y);

        console.log(`Finding path for NPC from (${start.x},${start.y}) to player (${end.x},${end.y})`);

        try {
            const path = await this.pathfinding.findPath(start.x, start.y, end.x, end.y);
            if (path && path.length > 0) {
                console.log("Path found!", path.length);
                path.shift(); // Remove current pos
                npc.setData('path', path);
            } else {
                console.warn("No path found for NPC");
            }
        } catch (err) {
            console.error("Pathfinding error", err);
        }
    }

    handleNPCMovement() {
        this.npcs.forEach(npc => {
            if (npc.getData('triggered')) {
                npc.setVelocity(0);
                return;
            }

            const path = npc.getData('path');
            if (path && path.length > 0) {
                const nextTile = path[0];
                const nextWorld = this.mapManager.tileToWorld(nextTile.x, nextTile.y);

                // Move towards next tile
                this.physics.moveTo(npc, nextWorld.x, nextWorld.y, 130); // Speed 130

                // Distance check
                if (Phaser.Math.Distance.Between(npc.x, npc.y, nextWorld.x, nextWorld.y) < 10) {
                    path.shift(); // Reached tile
                }
            } else {
                npc.setVelocity(0);

                // If close to player, trigger dialogue
                if (Phaser.Math.Distance.Between(npc.x, npc.y, this.player.x, this.player.y) < 60) {
                    const event = npc.getData('event');
                    if (event && !npc.getData('triggered')) {
                        npc.setData('triggered', true);
                        EventBus.emit('interruption-triggered', event);
                        // Make NPC face player
                        npc.setFlipX(this.player.x < npc.x);

                        // Despawn after a while?
                        this.time.delayedCall(10000, () => {
                            npc.destroy();
                            this.npcs = this.npcs.filter(n => n !== npc);
                        });
                    }
                }
            }
        });
    }
}
