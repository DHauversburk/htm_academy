import { Scene } from 'phaser';

export interface Zone {
    id: string;
    type: string;
    x: number;
    y: number;
}

export class GridMapManager {
    private scene: Scene;
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private layer!: Phaser.Tilemaps.TilemapLayer;

    private grid: number[][] = [];
    private zones: Zone[] = [];

    public readonly TILE_SIZE = 32;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public createMapFromAscii(asciiMap: string) {
        const mapData = asciiMap.trim().split('\n').map(row => row.split(''));
        const height = mapData.length;
        const width = mapData[0].length;

        this.generatePlaceholderTextures();

        this.map = this.scene.make.tilemap({
            tileWidth: this.TILE_SIZE,
            tileHeight: this.TILE_SIZE,
            width: width,
            height: height
        });

        const tileset = this.map.addTilesetImage('tiles', 'tiles', this.TILE_SIZE, this.TILE_SIZE, 0, 0);
        if (!tileset) throw new Error("Failed to create tileset");
        this.tileset = tileset;

        this.layer = this.map.createBlankLayer('Ground', this.tileset)!;
        this.grid = [];
        this.zones = [];

        for (let y = 0; y < height; y++) {
            const row: number[] = [];
            for (let x = 0; x < width; x++) {
                const char = mapData[y][x];
                let tileIndex = 0; // Floor
                let collision = 0; // Walkable

                switch (char) {
                    case '#':
                        tileIndex = 1; // Wall
                        collision = 1;
                        break;
                    case '.':
                        tileIndex = 0;
                        break;
                    case 'B':
                        this.zones.push({ id: `workbench_${x}_${y}`, type: 'Workbench', x, y });
                        break;
                    case 'S':
                        this.zones.push({ id: `supplies_${x}_${y}`, type: 'Supplies', x, y });
                        break;
                    default:
                        // Treat letters and other symbols as floor for now
                        tileIndex = 0;
                        break;
                }

                this.layer.putTileAt(tileIndex, x, y);
                row.push(collision);
            }
            this.grid.push(row);
        }

        this.map.setCollision(1);
    }

    private generatePlaceholderTextures() {
        if (this.scene.textures.exists('tiles')) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Tile 0: Hospital Floor (White linoleum with subtle grid pattern)
        graphics.fillStyle(0xf1f5f9, 1); // Light grey-white floor
        graphics.fillRect(0, 0, 32, 32);

        // Grid lines
        graphics.lineStyle(1, 0xdbeafe, 0.5);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.lineBetween(16, 0, 16, 32); // Vertical center line
        graphics.lineBetween(0, 16, 32, 16); // Horizontal center line

        // Subtle speckle pattern
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            graphics.fillStyle(0xe2e8f0, 0.3);
            graphics.fillCircle(x, y, 1);
        }

        // Tile 1: Wall (Dark blue-grey with depth)
        graphics.fillStyle(0x334155, 1); // Dark slate
        graphics.fillRect(32, 0, 32, 32);

        // Top highlight (lighter edge)
        graphics.fillStyle(0x475569, 1);
        graphics.fillRect(32, 0, 32, 4);

        // Bottom shadow
        graphics.fillStyle(0x1e293b, 1);
        graphics.fillRect(32, 28, 32, 4);

        graphics.generateTexture('tiles', 64, 32);
    }

    public getLayer() {
        return this.layer;
    }

    public getZoneLocations(type: string): Zone[] {
        return this.zones.filter(z => z.type === type);
    }

    public getCollisionGrid() {
        return this.grid;
    }

    public getSpawnPoint(): { x: number, y: number } {
        // Spawn at the first workbench found, or a random spot.
        const workbenches = this.getZoneLocations('Workbench');
        if (workbenches.length > 0) {
            return this.tileToWorld(workbenches[0].x, workbenches[0].y);
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
