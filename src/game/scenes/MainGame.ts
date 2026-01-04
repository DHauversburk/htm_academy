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

    private shiftData: any = null;

    init(data: any) {
        this.shiftData = data?.shift || null;
        console.log("MainGame Init with Shift Data:", this.shiftData);
    }

    create() {
        // Debug Background
        this.cameras.main.setBackgroundColor('#1e293b'); // Late Slate

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
        this.player.setDepth(1); // Ensure player is above the map layer

        // Collision with Walls
        this.physics.add.collider(this.player, layer);

        // Apply Tint
        const { avatarColor } = useGameStore.getState();
        this.player.setTint(avatarColor);

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

        // 1. Workshop Zones
        const workshopRoom = this.mapManager.getRoom('Workshop');
        if (workshopRoom) {
            // Main Bench
            const benchPos = this.mapManager.tileToWorld(workshopRoom.centerX, workshopRoom.centerY);
            this.addZoneAt(benchPos.x, benchPos.y, 'Workbench', 0x3b82f6, () => this.openWorkshop());

            // Supply Cabinet (Offset from center)
            const cabinetPos = this.mapManager.tileToWorld(workshopRoom.centerX - 2, workshopRoom.centerY - 2);
            this.addZoneAt(cabinetPos.x, cabinetPos.y, 'Supplies', 0xf59e0b, () => EventBus.emit('open-supply-cabinet'));
        } else {
            // Fallback if map gen failed (shouldn't happen with fixed rooms)
            this.placeZone('Workbench', 0x3b82f6, () => this.openWorkshop());
        }

        // 2. Hospital Departments
        this.placeZone('ICU', 0xef4444, () => this.showToast("ICU: All Systems Normal"));
        this.placeZone('Cafeteria', 0x10b981, () => this.showToast("Cafeteria: Coffee is fresh!"));
    }

    addZoneAt(x: number, y: number, name: string, color: number, callback: () => void) {
        // Visual Marker
        this.add.circle(x, y, 16, color, 0.5);
        this.add.text(x, y - 24, name, {
            fontSize: '12px', color: '#ffffff', backgroundColor: '#00000080'
        }).setOrigin(0.5);

        this.zones.push({ x, y, name, callback });
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

        this.addZoneAt(pos.x, pos.y, name, color, callback);
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
