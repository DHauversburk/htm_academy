import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { useGameStore } from '../store';
import { GridMapManager } from '../systems/GridMapManager';
import { InterruptionManager } from '../systems/InterruptionManager';
import { PathfindingSystem } from '../systems/PathfindingSystem';
import { MinimapSystem } from '../systems/MinimapSystem';
import { TutorialSystem } from '../systems/TutorialSystem';
import type { InterruptionEvent } from '../types';

export class MainGame extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private wasd!: any;
    private joystickInput = { x: 0, y: 0 };

    private mapManager!: GridMapManager;
    private pathfinding!: PathfindingSystem;
    private minimap!: MinimapSystem;
    private tutorial!: TutorialSystem;

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
        // Generate a simple sprite procedurally instead of loading an image
        // This guarantees it will work
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

        // 1. Map Generation
        this.mapManager = new GridMapManager(this);
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

        // 3. Create Professional Character Sprite
        const spawn = this.mapManager.getSpawnPoint();

        const graphics = this.add.graphics();

        // Shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillEllipse(16, 28, 20, 10);

        // Legs
        graphics.fillStyle(0x2563eb, 1);
        graphics.fillRect(10, 22, 5, 8);
        graphics.fillRect(17, 22, 5, 8);

        // Lab Coat
        graphics.fillStyle(0xe0e7ff, 1);
        graphics.fillRect(8, 14, 16, 12);

        // Arms
        graphics.fillStyle(0xfbbf24, 1);
        graphics.fillRect(5, 16, 3, 8);
        graphics.fillRect(24, 16, 3, 8);

        // Shoulders
        graphics.fillStyle(0xdbeafe, 1);
        graphics.fillRect(8, 14, 16, 3);

        // Head
        graphics.fillStyle(0xfbbf24, 1);
        graphics.fillCircle(16, 10, 6);

        // Hair
        graphics.fillStyle(0x78350f, 1);
        graphics.fillCircle(16, 8, 5);

        // Glasses
        graphics.lineStyle(1, 0x000000, 0.8);
        graphics.strokeCircle(13, 10, 2);
        graphics.strokeCircle(19, 10, 2);
        graphics.lineBetween(15, 10, 17, 10);

        // Stethoscope (direction indicator)
        graphics.lineStyle(2, 0x1e293b, 1);
        graphics.lineBetween(16, 13, 16, 5);
        graphics.fillStyle(0x334155, 1);
        graphics.fillCircle(16, 4, 2);

        graphics.generateTexture('player', 32, 32);
        graphics.destroy();

        this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player');
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.body!.setCircle(10);
        this.player.body!.setOffset(6, 6);

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

            this.input.keyboard.on('keydown-F1', (event: KeyboardEvent) => {
                event.preventDefault();
                EventBus.emit('open-career-dashboard');
            });

            this.input.keyboard.on('keydown-F5', (event: KeyboardEvent) => {
                event.preventDefault();
                EventBus.emit('reset-game');
            });
        }

        EventBus.on('joystick-move', (data: { x: number, y: number }) => {
            this.joystickInput = data;
        });

        // Cleanup
        this.events.on('shutdown', () => {
            EventBus.removeListener('joystick-move');
            if (this.tutorial) this.tutorial.destroy();
        });

        // 6. Interactions
        this.createInteractionZones();

        // 7. Minimap
        this.minimap = new MinimapSystem(this, this.mapManager);
        this.minimap.create();

        // 8. Interruptions
        this.listenForInterruptions();

        // 9. Tutorial
        this.tutorial = new TutorialSystem(this);
        this.tutorial.create();
        this.tutorial.start();

        EventBus.emit('scene-ready', this);
    }

    update() {
        // Player Movement
        this.handlePlayerMovement();

        // Minimap Update
        if (this.minimap && this.player) {
            this.minimap.update(this.player.x, this.player.y);
        }

        // Tutorial Update
        if (this.tutorial) {
            this.tutorial.update();
        }

        // Zone Checking
        this.checkZones();

        // NPC Movement
        this.handleNPCMovement();
    }


    handlePlayerMovement() {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // Get Dynamic Speed from Store - Use direct velocity for responsive feel
        const moveSpeed = useGameStore.getState().calculateSpeed();

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

        // Direct velocity for instant response
        if (dx !== 0 || dy !== 0) {
            const angle = Math.atan2(dy, dx);
            const velocityX = Math.cos(angle) * moveSpeed;
            const velocityY = Math.sin(angle) * moveSpeed;

            body.setVelocity(velocityX, velocityY);

            // Rotate sprite to face direction (subtract 90deg because sprite faces up by default)
            this.player.setRotation(angle - Math.PI / 2);
        } else {
            body.setVelocity(0, 0);
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

        // No animation - keep it simple and professional
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
        EventBus.emit('open-workbench');
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
                this.physics.moveTo(npc, nextWorld.x, nextWorld.y, 130);

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

                        // Despawn after a while
                        this.time.delayedCall(10000, () => {
                            npc.destroy();
                            this.npcs = this.npcs.filter(n => n !== npc);
                        });
                    }
                }
            }
        });
    }

    public getZone(name: string) {
        return this.zones.find(z => z.name === name);
    }
}
