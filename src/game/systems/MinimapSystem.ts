import { Scene } from 'phaser';
import { GridMapManager } from './GridMapManager';

export class MinimapSystem {
    private scene: Scene;
    private mapManager: GridMapManager;
    private minimapContainer!: Phaser.GameObjects.Container;
    private minimapGraphics!: Phaser.GameObjects.Graphics;
    private playerDot!: Phaser.GameObjects.Graphics;

    private readonly MINIMAP_SIZE = 120;
    private minimapScale = 1;

    constructor(scene: Scene, mapManager: GridMapManager) {
        this.scene = scene;
        this.mapManager = mapManager;
    }

    create() {
        const cam = this.scene.cameras.main;

        // Container positioned in top-right corner
        this.minimapContainer = this.scene.add.container(
            cam.width - this.MINIMAP_SIZE - 10,
            10
        );
        this.minimapContainer.setScrollFactor(0); // Fixed to camera
        this.minimapContainer.setDepth(1000);

        // Background
        const bg = this.scene.add.rectangle(
            this.MINIMAP_SIZE / 2,
            this.MINIMAP_SIZE / 2,
            this.MINIMAP_SIZE,
            this.MINIMAP_SIZE,
            0x000000,
            0.7
        );
        this.minimapContainer.add(bg);

        // Border
        const border = this.scene.add.rectangle(
            this.MINIMAP_SIZE / 2,
            this.MINIMAP_SIZE / 2,
            this.MINIMAP_SIZE,
            this.MINIMAP_SIZE
        );
        border.setStrokeStyle(2, 0x60a5fa, 1);
        this.minimapContainer.add(border);

        // Minimap graphics (the actual map)
        this.minimapGraphics = this.scene.add.graphics();
        this.minimapContainer.add(this.minimapGraphics);

        // Player dot
        this.playerDot = this.scene.add.graphics();
        this.minimapContainer.add(this.playerDot);

        this.renderMap();
    }

    private renderMap() {
        const grid = this.mapManager.getCollisionGrid();
        if (!grid || grid.length === 0) return;

        // Calculate scale to fit grid into minimap size
        const mapWidth = grid[0].length;
        const mapHeight = grid.length;
        this.minimapScale = this.MINIMAP_SIZE / Math.max(mapWidth, mapHeight);


        this.minimapGraphics.clear();

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const minimapX = Math.floor(x * this.minimapScale);
                const minimapY = Math.floor(y * this.minimapScale);

                if (grid[y][x] === 0) {
                    // Floor - light color
                    this.minimapGraphics.fillStyle(0xf1f5f9, 0.8);
                } else {
                    // Wall - dark color
                    this.minimapGraphics.fillStyle(0x334155, 1);
                }

                // Ensure integers for pixel-perfect drawing
                this.minimapGraphics.fillRect(
                    minimapX,
                    minimapY,
                    Math.ceil(this.minimapScale),
                    Math.ceil(this.minimapScale)
                );
            }
        }
    }

    update(playerX: number, playerY: number) {
        // Convert player world position to tile position
        const tile = this.mapManager.worldToTile(playerX, playerY);

        // Convert tile position to minimap position
        const minimapX = Math.floor(tile.x * this.minimapScale);
        const minimapY = Math.floor(tile.y * this.minimapScale);

        // Draw player dot
        this.playerDot.clear();
        this.playerDot.fillStyle(0x3b82f6, 1); // Blue dot
        this.playerDot.fillCircle(minimapX, minimapY, 2);

        // Pulse effect
        this.playerDot.lineStyle(1, 0x60a5fa, 0.5);
        this.playerDot.strokeCircle(minimapX, minimapY, 3);
    }

    setVisible(visible: boolean) {
        this.minimapContainer.setVisible(visible);
    }
}
