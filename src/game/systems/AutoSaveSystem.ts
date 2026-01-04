import { useGameStore } from '../store';
import type { Achievement, PerformanceMetrics } from '../data/achievements';

const AUTO_SAVE_KEY = 'htm_academy_autosave';
const AUTO_SAVE_INTERVAL = 60000; // 1 minute

export interface SaveData {
    timestamp: number;
    playerName: string;
    jobTitle: string;
    inventory: Record<string, number>;
    currency: number;
    xp: number;
    level: number;
    unlockedSkills: string[];
    achievements: Record<string, Achievement>;
    metrics: PerformanceMetrics;
    currentDay: number;
    totalPlayTime: number;
}

class AutoSaveManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private intervalId: any = null;
    private startTime: number = Date.now();
    private accumulatedTime: number = 0;

    start() {
        if (this.intervalId) return;

        // Load existing play time
        const saveData = this.load();
        if (saveData) {
            this.accumulatedTime = saveData.totalPlayTime || 0;
        }

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
                jobTitle: state.jobTitle,
                inventory: state.inventory,
                currency: state.budget,
                xp: state.stats.xp,
                level: state.stats.level,
                unlockedSkills: state.stats.unlockedSkills,
                achievements: state.achievements,
                metrics: state.metrics,
                currentDay: 1, // TODO: Track actual days
                totalPlayTime: this.accumulatedTime + (Date.now() - this.startTime),
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

    loadInGame() {
        const data = this.load();
        if (!data) return false;

        useGameStore.setState({
            playerName: data.playerName,
            jobTitle: data.jobTitle,
            inventory: data.inventory,
            budget: data.currency,
            stats: {
                ...useGameStore.getState().stats,
                level: data.level,
                xp: data.xp,
                unlockedSkills: data.unlockedSkills,
            },
            achievements: data.achievements,
            metrics: data.metrics,
            isSetupComplete: true,
        });

        console.log('[AutoSave] Game state loaded into store.');
        return true;
    }
}

export const autoSave = new AutoSaveManager();
