import { GeminiService } from '../../lib/gemini';
import { useGameStore } from '../store';
import { EventBus } from '../EventBus';
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

        this.currentShift = shiftData;
        return shiftData;
    }

    static getCurrentShift() {
        return this.currentShift;
    }
}
