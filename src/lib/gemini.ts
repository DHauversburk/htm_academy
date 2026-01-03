import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Fallback if no key is present to prevent hard crashing
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
        budgetImpact?: number; // Cost (negative) or Gain (positive)
        consequence?: string; // Short flavor text of what happens
    }[];
}

export const GeminiService = {
    isEnabled,

    async generateDailyShift(difficulty: string): Promise<any | null> {
        if (!genAI) {
            // Fallback for when AI is off
            return this.getFallbackShift();
        }

        try {
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
                            { "id": "Lobby", "type": "lobby", "w": 12, "h": 10, "x": 60, "y": 110 },
                            ... (add 5-8 more random rooms like 'ward', 'office', 'storage' with random sizes and logical positions if possible, or leave x/y null for procedural placement)
                        ]
                    }
                }
                Mask rules: 
                - Workshop MUST exist.
                - Lobby MUST exist.
                - Add a mix of clinical and admin rooms.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Shift Gen Failed:", error);
            return this.getFallbackShift();
        }
    },

    getFallbackShift() {
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
                
                "urgency" can be low, medium, high, critical.
                "action" must be one of: accept, defer, refuse.
                "budgetImpact" is a number (negative for cost, positive for income).
                Keep descriptions pithy and immersive.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Basic cleanup to ensure JSON parsing (remove markdown code blocks if present)
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(jsonStr) as GeneratedInterruption;
        } catch (error) {
            console.error("Gemini Generation Failed:", error);
            return null;
        }
    }
};
