import { GeminiService, getFallbackShift } from '../../lib/gemini';
import type { DailyShift } from '../types';

export class AIDirector {
    /**
     * Called when the player starts a new shift.
     * This function is designed to be resilient and ALWAYS return a valid shift.
     * It relies on `GeminiService.generateDailyShift` which has its own internal
     * error handling and fallback mechanism.
     */
    static async generateDailyContext(difficulty: string): Promise<DailyShift> {
        console.log("AIDirector: Generating Daily Context...");

        const shiftData = await GeminiService.generateDailyShift(difficulty);

        // The service should always return a valid shift, but as a final safeguard,
        // we check for null/undefined and return the hard-coded fallback.
        if (!shiftData) {
            console.warn("AIDirector: Gemini service returned a falsy value, using fallback.");
            return getFallbackShift();
        }

        console.log("AIDirector: Context Generated", shiftData);
        return shiftData;
    }
}
