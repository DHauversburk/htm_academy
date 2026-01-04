import { Scene } from 'phaser';
import { GridMapManager } from './GridMapManager';

export class MinimapSystem {
    private scene: Scene;
    private mapManager: GridMapManager;
    private minimapContainer!: Phaser.GameObjects.Container;
    private minimapGraphics!: Phaser.GameObjects.Graphics;
    private playerDot!: Phaser.GameObjects.Graphics;

    private readonly MINIMAP_SIZE = 120;
    private readonly MINIMAP_SCALE = 2; // How many tiles per pixel

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
        const tileSize = this.mapManager.TILE_SIZE;

        this.minimapGraphics.clear();

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const worldX = x * tileSize;
                const worldY = y * tileSize;

                // Convert to minimap coordinates
                const minimapX = (worldX / tileSize) / this.MINIMAP_SCALE;
                const minimapY = (worldY / tileSize) / this.MINIMAP_SCALE;

                if (grid[y][x] === 0) {
                    // Floor - light color
                    this.minimapGraphics.fillStyle(0xf1f5f9, 0.8);
                } else {
                    // Wall - dark color
                    this.minimapGraphics.fillStyle(0x334155, 1);
                }

                this.minimapGraphics.fillRect(
                    minimapX,
                    minimapY,
                    1 / this.MINIMAP_SCALE,
                    1 / this.MINIMAP_SCALE
                );
            }
        }
    }

    update(playerX: number, playerY: number) {
        const tileSize = this.mapManager.TILE_SIZE;

        // Convert player world position to minimap position
        const minimapX = (playerX / tileSize) / this.MINIMAP_SCALE;
        const minimapY = (playerY / tileSize) / this.MINIMAP_SCALE;

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
