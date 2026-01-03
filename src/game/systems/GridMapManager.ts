import { Scene } from 'phaser';

export class GridMapManager {
    private scene: Scene;
    private map!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private layer!: Phaser.Tilemaps.TilemapLayer;

    public readonly TILE_SIZE = 32;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    createProceduralMap(width: number, height: number) {
        // 1. Generate Texture for Tiles (since we have no assets)
        this.generatePlaceholderTextures();

        // 2. Create Tilemap
        this.map = this.scene.make.tilemap({
            tileWidth: this.TILE_SIZE,
            tileHeight: this.TILE_SIZE,
            width: width,
            height: height
        });

        // 3. Add Tileset
        // 'tiles' refers to the key of the texture we generated
        const tileset = this.map.addTilesetImage('tiles', undefined, this.TILE_SIZE, this.TILE_SIZE, 1, 2);
        if (!tileset) throw new Error("Failed to create tileset");
        this.tileset = tileset;

        // 4. Generate Level Data (Walls, Floors)
        const levelData = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                // Outer Walls
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    row.push(1); // Wall ID
                }
                // Random internal walls (sparser)
                else if (Math.random() < 0.1 && x > 5 && y > 5) {
                    row.push(1);
                }
                else {
                    row.push(0); // Floor ID
                }
            }
            levelData.push(row);
        }

        // 5. Create Layer
        // 0 = Floor, 1 = Wall
        this.layer = this.map.createBlankLayer('Ground', this.tileset)!;

        // Fill based on data
        levelData.forEach((row, y) => {
            row.forEach((tileId, x) => {
                this.layer.putTileAt(tileId, x, y);
            });
        });

        // 6. Collision
        this.map.setCollision(1); // Wall is collidable
    }

    private generatePlaceholderTextures() {
        if (this.scene.textures.exists('tiles')) return;

        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Tile 0: Floor (Light Gray/Blue)
        graphics.fillStyle(0xf1f5f9); // Slate-100
        graphics.fillRect(0, 0, 32, 32);

        // Tile 1: Wall (Dark Blue)
        graphics.fillStyle(0x334155); // Slate-700
        graphics.fillRect(34, 0, 32, 32);
        // Note: spacing of 2px for margin/spacing in tileset logic if needed, 
        // but here we just draw side-by-side. 
        // Phaser tileset usually expects exact packing. 
        // Let's stick to 32x32 blocks.

        graphics.generateTexture('tiles', 68, 32);
    }

    public getLayer() {
        return this.layer;
    }

    public getSpawnPoint(): { x: number, y: number } {
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
                return {
                    x: x * this.TILE_SIZE + this.TILE_SIZE / 2,
                    y: y * this.TILE_SIZE + this.TILE_SIZE / 2
                };
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
}
