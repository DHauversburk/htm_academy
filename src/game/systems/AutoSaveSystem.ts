import { useGameStore } from '../store';

const AUTO_SAVE_KEY = 'htm_academy_autosave';
const AUTO_SAVE_INTERVAL = 60000; // 1 minute

export interface SaveData {
    timestamp: number;
    playerName: string;
    inventory: Record<string, number>;
    currency: number;
    xp: number;
    level: number;
    currentDay: number;
    totalPlayTime: number;
}

class AutoSaveManager {
    private intervalId: NodeJS.Timeout | null = null;
    private startTime: number = Date.now();

    start() {
        if (this.intervalId) return;

        this.startTime = Date.now();
        this.intervalId = setInterval(() => {
            this.save();
        }, AUTO_SAVE_INTERVAL);

        // Also save on page unload
        window.addEventListener('beforeunload', this.handleUnload);

        console.log('[AutoSave] Started');
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        window.removeEventListener('beforeunload', this.handleUnload);
        console.log('[AutoSave] Stopped');
    }

    private handleUnload = () => {
        this.save();
    };

    save() {
        try {
            const state = useGameStore.getState();

            const saveData: SaveData = {
                timestamp: Date.now(),
                playerName: state.playerName,
                inventory: state.inventory,
                currency: state.budget,
                xp: state.stats.xp,
                level: state.stats.level,
                currentDay: 1, // TODO: Track actual days
                totalPlayTime: Date.now() - this.startTime,
            };

            localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
            console.log('[AutoSave] Game saved at', new Date().toLocaleTimeString());

            return true;
        } catch (error) {
            console.error('[AutoSave] Failed to save:', error);
            return false;
        }
    }

    load(): SaveData | null {
        try {
            const data = localStorage.getItem(AUTO_SAVE_KEY);
            if (!data) return null;

            const saveData = JSON.parse(data) as SaveData;
            console.log('[AutoSave] Loaded save from', new Date(saveData.timestamp).toLocaleString());

            return saveData;
        } catch (error) {
            console.error('[AutoSave] Failed to load:', error);
            return null;
        }
    }

    hasSave(): boolean {
        return localStorage.getItem(AUTO_SAVE_KEY) !== null;
    }

    deleteSave() {
        localStorage.removeItem(AUTO_SAVE_KEY);
        console.log('[AutoSave] Save deleted');
    }

    getLastSaveTime(): Date | null {
        const save = this.load();
        return save ? new Date(save.timestamp) : null;
    }
}

export const autoSave = new AutoSaveManager();
