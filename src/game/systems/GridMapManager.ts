import { Scene } from 'phaser';

export interface Room {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
}

export class GridMapManager {
    private scene: Scene;
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private layer!: Phaser.Tilemaps.TilemapLayer;

    private rooms: Room[] = [];

    public readonly TILE_SIZE = 32;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    createProceduralMap(width: number, height: number) {
        this.generatePlaceholderTextures();

        this.map = this.scene.make.tilemap({
            tileWidth: this.TILE_SIZE,
            tileHeight: this.TILE_SIZE,
            width: width,
            height: height
        });

        const tileset = this.map.addTilesetImage('tiles', undefined, this.TILE_SIZE, this.TILE_SIZE, 1, 2);
        if (!tileset) throw new Error("Failed to create tileset");
        this.tileset = tileset;

        this.layer = this.map.createBlankLayer('Ground', this.tileset)!;

        // Initialize with Walls
        this.layer.fill(1); // 1 = Wall

        this.generateHospitalLayout(width, height);

        this.map.setCollision(1);
    }

    private generateHospitalLayout(mapWidth: number, mapHeight: number) {
        this.rooms = [];

        // 1. Fixed: The Biomed Workshop (Top Left for now)
        const workshop = this.createRoom('Workshop', 2, 2, 10, 8);

        // 2. Fixed: Lobby / Main Entrance (Center Bottom)
        const lobby = this.createRoom('Lobby', Math.floor(mapWidth / 2) - 6, mapHeight - 15, 12, 10);

        // 3. Departments (ICU, Cafeteria)
        this.createRoom('ICU', 25, 5, 12, 12);
        this.createRoom('Cafeteria', mapWidth - 15, mapHeight - 15, 10, 10);

        // 4. Generate some random filler rooms (Patient Rooms)
        for (let i = 0; i < 15; i++) {
            const w = 4 + Math.floor(Math.random() * 4); // 4-8 width
            const h = 4 + Math.floor(Math.random() * 4); // 4-8 height
            const x = Math.floor(Math.random() * (mapWidth - w - 4)) + 2;
            const y = Math.floor(Math.random() * (mapHeight - h - 4)) + 2;

            // Rename to differentiate
            this.createRoom(`Room_${i}`, x, y, w, h);
        }

        // 5. Connect Rooms with Corridors (Simple sequential connection)
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.createCorridor(this.rooms[i], this.rooms[i + 1]);
        }
    }

    private createRoom(id: string, x: number, y: number, w: number, h: number): Room {
        // Dig out the floor (0)
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                // Ensure bounds
                if (x + dx < this.map.width && y + dy < this.map.height) {
                    this.layer.putTileAt(0, x + dx, y + dy);
                }
            }
        }

        const room: Room = {
            id, x, y, width: w, height: h,
            centerX: x + Math.floor(w / 2),
            centerY: y + Math.floor(h / 2)
        };
        this.rooms.push(room);
        return room;
    }

    private createCorridor(roomA: Room, roomB: Room) {
        let x = roomA.centerX;
        let y = roomA.centerY;

        const targetX = roomB.centerX;
        const targetY = roomB.centerY;

        // Move Horizontally
        while (x !== targetX) {
            this.layer.putTileAt(0, x, y);
            this.layer.putTileAt(0, x, y + 1); // Wide corridor
            x += (x < targetX) ? 1 : -1;
        }

        // Move Vertically
        while (y !== targetY) {
            this.layer.putTileAt(0, x, y);
            this.layer.putTileAt(0, x + 1, y); // Wide corridor
            y += (y < targetY) ? 1 : -1;
        }
    }

    private generatePlaceholderTextures() {
        if (this.scene.textures.exists('tiles')) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Tile 0: Floor (Light Gray)
        graphics.fillStyle(0xf1f5f9);
        graphics.fillRect(0, 0, 32, 32);

        // Tile 1: Wall (Dark Blue)
        graphics.fillStyle(0x334155);
        graphics.fillRect(34, 0, 32, 32);

        graphics.generateTexture('tiles', 68, 32);
    }

    public getLayer() {
        return this.layer;
    }

    public getRoom(id: string): Room | undefined {
        return this.rooms.find(r => r.id === id);
    }

    public getSpawnPoint(): { x: number, y: number } {
        // Spawn in the Workshop or Lobby?
        const workshop = this.getRoom('Workshop');
        if (workshop) {
            return this.tileToWorld(workshop.centerX, workshop.centerY);
        }
        return this.getRandomFloorPosition();
    }

    public getRandomFloorPosition(): { x: number, y: number } {
        let attempts = 0;
        while (attempts < 1000) {
            const x = Math.floor(Math.random() * this.map.width);
            const y = Math.floor(Math.random() * this.map.height);

            const tile = this.layer.getTileAt(x, y);
            if (tile && tile.index === 0) {
                return this.tileToWorld(x, y);
            }
            attempts++;
        }
        return { x: 0, y: 0 };
    }

    public tileToWorld(tileX: number, tileY: number) {
        return {
            x: tileX * this.TILE_SIZE + this.TILE_SIZE / 2,
            y: tileY * this.TILE_SIZE + this.TILE_SIZE / 2
        };
    }
}
