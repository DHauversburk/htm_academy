import { GeminiService } from '../../lib/gemini';
import type { DailyShift } from '../types';

export class AIDirector {
    private static currentShift: DailyShift | null = null;

    /**
     * Called when the player starts a new shift (Day loop).
     * Returns a promise that resolves with the shift configuration.
     */
    static async generateDailyContext(difficulty: string): Promise<DailyShift> {
        console.log("AIDirector: Generating Daily Context...");

        // 1. Generate Context from Gemini
        const shiftData = await GeminiService.generateDailyShift(difficulty);
        console.log("AIDirector: Context Generated", shiftData);

        if (!shiftData) throw new Error("Failed to generate shift data");

        // --- VALIDATION ---
        // If the AI provides a map config, ensure it's valid, otherwise fallback.
        if (shiftData.mapConfig) {
            if (shiftData.mapConfig.width < 20 || shiftData.mapConfig.height < 20) {
                console.warn("AI returned an invalid map size. Falling back to default.");
                shiftData.mapConfig.width = 64;
                shiftData.mapConfig.height = 64;
            }
        } else {
            shiftData.mapConfig = { width: 64, height: 64, rooms: [] };
        }


        this.currentShift = shiftData;
        return shiftData;
    }

    static getCurrentShift() {
        return this.currentShift;
    }
}
