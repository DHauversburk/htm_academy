import { GeminiService, getFallbackShift } from '../../lib/gemini';
import type { DailyShift } from '../types';

export class AIDirector {
    /**
     * Called when the player starts a new shift (Day loop).
     * Generates context from the Gemini service, but provides a
     * robust fallback if the API call fails for any reason.
     * This ensures the game can always start, even offline.
     */
    static async generateDailyContext(difficulty: string): Promise<DailyShift> {
        console.log("AIDirector: Generating Daily Context...");

        try {
            const shiftData = await GeminiService.generateDailyShift(difficulty);
            console.log("AIDirector: Context Generated", shiftData);

            // The service returns a fallback on error, but we can double-check
            if (!shiftData) {
                console.warn("AIDirector: Gemini service returned null, using fallback.");
                return getFallbackShift();
            }

            return shiftData;

        } catch (error) {
            console.error("AIDirector: Critical failure in generateDailyContext", error);
            // Return a safe fallback if the promise itself rejects
            return getFallbackShift();
        }
    }
}
