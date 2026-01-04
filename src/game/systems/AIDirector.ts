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

        if (!shiftData) {
            throw new Error("Failed to generate shift data");
        }

        // Validate map dimensions to prevent crashes from "tiny" maps
        if (shiftData.mapConfig) {
            const { width, height } = shiftData.mapConfig;
            if (!width || !height || width < 20 || height < 20) {
                console.warn("AIDirector: Invalid map dimensions received. Overriding to 64x64.");
                shiftData.mapConfig.width = 64;
                shiftData.mapConfig.height = 64;
            }
        }

        console.log("AIDirector: Context Generated & Validated", shiftData);

        this.currentShift = shiftData;
        return shiftData;
    }

    static getCurrentShift() {
        return this.currentShift;
    }
}
