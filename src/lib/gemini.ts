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

    async generateInterruption(context: string): Promise<GeneratedInterruption | null> {
        if (!genAI) {
            console.warn("Gemini API Key missing. Skipping AI generation.");
            return null;
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
