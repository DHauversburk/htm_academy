import EasyStar from 'easystarjs';

export class PathfindingSystem {
    private easystar: js;

    constructor() {
        this.easystar = new EasyStar.js();
        // 0 is walkable (floor), 1 is wall
        this.easystar.setAcceptableTiles([0]);
        this.easystar.enableDiagonals();
        this.easystar.disableCornerCutting();
    }

    public setGrid(grid: number[][]) {
        this.easystar.setGrid(grid);
    }

    public async findPath(startX: number, startY: number, endX: number, endY: number): Promise<{ x: number, y: number }[] | null> {
        return new Promise((resolve) => {
            this.easystar.findPath(startX, startY, endX, endY, (path: { x: number, y: number }[]) => {
                if (path === null) {
                    resolve(null);
                } else {
                    resolve(path);
                }
            });
            this.easystar.calculate();
        });
    }
}
