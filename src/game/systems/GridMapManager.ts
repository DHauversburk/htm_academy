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
    private grid: number[][] = [];

    public readonly TILE_SIZE = 32;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    createProceduralMap(config?: { width: number, height: number, rooms: any[] }) {
        const width = config?.width && config.width > 20 ? config.width : 50;
        const height = config?.height && config.height > 20 ? config.height : 40;

        this.generatePlaceholderTextures();

        this.map = this.scene.make.tilemap({
            tileWidth: this.TILE_SIZE,
            tileHeight: this.TILE_SIZE,
            width: width,
            height: height
        });

        // addTilesetImage(tilesetName, key, tileWidth, tileHeight, tileMargin, tileSpacing)
        // SIMPLIFIED: No margin/spacing to ensure robust rendering
        const tileset = this.map.addTilesetImage('tiles', 'tiles', this.TILE_SIZE, this.TILE_SIZE, 0, 0);
        if (!tileset) throw new Error("Failed to create tileset");
        this.tileset = tileset;

        this.layer = this.map.createBlankLayer('Ground', this.tileset)!;

        // Initialize with Walls
        this.layer.fill(1); // 1 = Wall

        // Initialize Grid Data (Rows = y, Cols = x)
        this.grid = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push(1); // Wall
            }
            this.grid.push(row);
        }

        // FORCE PROCEDURAL LAYOUT (AI Geometry is too unreliable)
        // If config exists, we validted width/height, but we ignore the specific room coords 
        // to prevent "tiny islands" or overlapping rooms.
        this.generateHospitalLayout(width, height);

        this.map.setCollision(1);
    }



    private generateHospitalLayout(mapWidth: number, mapHeight: number) {
        this.rooms = [];

        // 1. Fixed: The Biomed Workshop (Top Left for now)
        this.createRoom('Workshop', 2, 2, 10, 8);

        // 2. Fixed: Lobby / Main Entrance (Center Bottom)
        this.createRoom('Lobby', Math.floor(mapWidth / 2) - 6, mapHeight - 15, 12, 10);

        // 3. Departments (ICU, Cafeteria)
        this.createRoom('ICU', 25, 5, 12, 12);
        this.createRoom('Cafeteria', mapWidth - 15, mapHeight - 15, 10, 10);

        // 4. Generate some random filler rooms (Patient Rooms)
        for (let i = 0; i < 15; i++) {
            const w = 4 + Math.floor(Math.random() * 4); // 4-8 width
            const h = 4 + Math.floor(Math.random() * 4); // 4-8 height
            const x = Math.floor(Math.random() * (mapWidth - w - 4)) + 2;
            const y = Math.floor(Math.random() * (mapHeight - h - 4)) + 2;

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
                    if (this.grid[y + dy]) this.grid[y + dy][x + dx] = 0;
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

        const dig = (gx: number, gy: number) => {
            if (gx >= 0 && gx < this.map.width && gy >= 0 && gy < this.map.height) {
                this.layer.putTileAt(0, gx, gy);
                if (this.grid[gy]) this.grid[gy][gx] = 0;
            }
        };

        // Move Horizontally
        while (x !== targetX) {
            dig(x, y);
            dig(x, y + 1); // Wide corridor
            x += (x < targetX) ? 1 : -1;
        }

        // Move Vertically
        while (y !== targetY) {
            dig(x, y);
            dig(x + 1, y); // Wide corridor
            y += (y < targetY) ? 1 : -1;
        }
    }

    private generatePlaceholderTextures() {
        if (this.scene.textures.exists('tiles')) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Simple 64x32 Texture (2 tiles side-by-side)

        // Tile 0: Floor (Light Gray/Blue)
        graphics.fillStyle(0xf1f5f9); // Slate-100
        graphics.fillRect(0, 0, 32, 32);

        // Tile 1: Wall (Dark Blue)
        graphics.fillStyle(0x334155); // Slate-700
        graphics.fillRect(32, 0, 32, 32);

        // Generate with Exact Dimensions
        graphics.generateTexture('tiles', 64, 32);
    }

    public getLayer() {
        return this.layer;
    }

    public getMapDimensions() {
        return {
            width: this.map.widthInPixels,
            height: this.map.heightInPixels,
        };
    }

    public getRoom(id: string): Room | undefined {
        return this.rooms.find(r => r.id === id);
    }

    public getCollisionGrid() {
        return this.grid;
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
            // Tile index 0 is Floor
            if (tile && tile.index === 0) {
                return this.tileToWorld(x, y);
            }
            attempts++;
        }
        return { x: 0, y: 0 }; // Fallback
    }

    public tileToWorld(tileX: number, tileY: number) {
        return {
            x: tileX * this.TILE_SIZE + this.TILE_SIZE / 2,
            y: tileY * this.TILE_SIZE + this.TILE_SIZE / 2
        };
    }

    public worldToTile(worldX: number, worldY: number) {
        return {
            x: Math.floor(worldX / this.TILE_SIZE),
            y: Math.floor(worldY / this.TILE_SIZE)
        };
    }
}
