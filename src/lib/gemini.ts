import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const isEnabled = !!API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (isEnabled) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export interface GeneratedInterruption {
    title: string;
    description: string;
    npcName: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    options: {
        label: string;
        action: 'accept' | 'defer' | 'refuse';
        budgetImpact?: number;
        consequence?: string;
    }[];
}

/**
 * Provides a hard-coded, guaranteed-to-work shift object.
 * Used as a fallback when the AI service fails.
 */
export function getFallbackShift() {
    return {
        scenarioTitle: "Routine Maintenance",
        scenarioDescription: "Just another Tuesday. Keep the lights on.",
        npcMood: "Calm",
        mapConfig: {
            width: 128,
            height: 128,
            flavor: "Standard",
            rooms: [
                { id: "Workshop", type: "workshop", w: 10, h: 8, x: 2, y: 2 },
                { id: "Lobby", type: "lobby", w: 12, h: 10, x: 58, y: 115 },
                { id: "ICU", type: "ward", w: 12, h: 12 },
                { id: "Cafeteria", type: "storage", w: 10, h: 10 },
                { id: "Office_A", type: "office", w: 6, h: 6 },
                { id: "Ward_B", type: "ward", w: 8, h: 8 }
            ]
        }
    };
}

/**
 * Provides a specific shift for when the user is known to be offline.
 */
export function getOfflineShift() {
    const shift = getFallbackShift();
    shift.scenarioTitle = "Offline Mode";
    shift.scenarioDescription = "Network connection unavailable. Using standard hospital layout.";
    return shift;
}

// Helper function to handle the core generation logic
async function generateShiftFromAPI(difficulty: string) {
    if (!genAI) {
        console.warn("Gemini API Key missing. Skipping AI generation.");
        return getOfflineShift();
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `
        Act as a Game Director for a Hospital RPG. Design a "Daily Shift" scenario.
        Difficulty: ${difficulty}.

        Generate a pure JSON object (no markdown) with this structure:
        {
            "scenarioTitle": "String (e.g. 'Monday Morning Rush')",
            "scenarioDescription": "String (Flavor text)",
            "npcMood": "String (e.g. 'Optimistic', 'Irritated')",
            "mapConfig": {
                "width": 128,
                "height": 128,
                "flavor": "String",
                "rooms": [
                    { "id": "Workshop", "type": "workshop", "w": 10, "h": 8, "x": 2, "y": 2 },
                    { "id": "Lobby", "type": "lobby", "w": 12, "h": 10, "x": 60, "y": 110 }
                ]
            }
        }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);

    if (!parsed.mapConfig) parsed.mapConfig = {};
    if (!parsed.mapConfig.width || parsed.mapConfig.width < 50) parsed.mapConfig.width = 128;
    if (!parsed.mapConfig.height || parsed.mapConfig.height < 50) parsed.mapConfig.height = 128;
    if (!parsed.mapConfig.rooms || !Array.isArray(parsed.mapConfig.rooms) || parsed.mapConfig.rooms.length < 3) {
        parsed.mapConfig.rooms = getFallbackShift().mapConfig.rooms;
    }

    return parsed;
}

export const GeminiService = {
    isEnabled,

    async generateDailyShift(difficulty: string): Promise<any | null> {
        try {
            return await generateShiftFromAPI(difficulty);
        } catch (error) {
            console.error("Gemini Shift Gen Failed:", error);
            return getFallbackShift();
        }
    },

    async generateInterruption(context: string): Promise<GeneratedInterruption | null> {
        if (!genAI) {
            console.warn("Gemini API Key missing. Skipping AI generation.");
            return null;
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
                You are the Game Director for "HTM Academy", a hospital simulator where the player is a Biomed Technician.
                Generate a random, short, and realistic interruption event where a hospital staff member approaches the technician.
                
                Context: ${context}
                
                Return ONLY a JSON object with this exact schema:
                {
                    "title": "Short Alert Title",
                    "description": "2-3 sentences of what the NPC says/wants.",
                    "npcName": "Name & Title (e.g., Nurse Joy)",
                    "urgency": "medium",
                    "options": [
                        { "label": "Short Action Name", "action": "accept", "budgetImpact": 0, "consequence": "Outcome description" },
                        { "label": "Short Action Name", "action": "defer", "budgetImpact": 0, "consequence": "Outcome description" }
                    ]
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr) as GeneratedInterruption;
        } catch (error) {
            console.error("Gemini Generation Failed:", error);
            return null;
        }
    }
};
