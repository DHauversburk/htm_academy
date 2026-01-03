import type { InterruptionEvent, WorkOrder } from '../types';
import { EventBus } from '../EventBus';
import { GeminiService } from '../../lib/gemini';

export class InterruptionManager {
    static async triggerRandomInterruption(difficulty: string) {
        const type = Math.random() > 0.5 ? 'walk-in' : 'phone';

        // 1. Try AI Generation
        if (GeminiService.isEnabled) {
            console.log("Generating AI Interruption...");
            // Await the AI generation
            const aiEvent = await this.generateAIInterruption(type, difficulty);
            if (aiEvent) {
                this.emitEvent(aiEvent);
                return;
            }
        }

        // 2. Fallback to Static Template
        const event = this.generateStaticEvent(type);
        this.emitEvent(event);
    }

    private static emitEvent(event: InterruptionEvent) {
        console.log("Triggering Interruption:", event);
        if (event.type === 'walk-in') {
            EventBus.emit('spawn-interruption-npc', event);
        } else {
            EventBus.emit('interruption-triggered', event);
        }
    }

    private static async generateAIInterruption(type: 'walk-in' | 'phone', difficulty: string): Promise<InterruptionEvent | null> {
        const context = `Player Difficulty: ${difficulty}. Event Type: ${type}. The player is a Biomed Technician in a busy hospital.`;

        try {
            const data = await GeminiService.generateInterruption(context);
            if (!data) return null;

            return {
                id: crypto.randomUUID(),
                type,
                title: data.title,
                description: data.description,
                urgency: data.urgency,
                npcName: data.npcName,
                options: data.options,
                timestamp: Date.now()
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    private static generateStaticEvent(type: 'walk-in' | 'phone'): InterruptionEvent {
        // Fallback templates
        const templates = [
            {
                type: 'walk-in',
                title: 'Nurse Alert',
                npcName: 'Nurse Jackie',
                description: 'We have a Code Blue starting and the defibrillator is showing an error!',
                urgency: 'critical',
                options: [
                    { label: 'Panic & Run', action: 'accept', consequence: 'Start Emergency Repair (+50 Stress)' },
                    { label: 'Check Error Code', action: 'defer', consequence: 'Add to queue (Normal Priority)' }
                ],
                associatedTicket: {
                    id: `wo-${Date.now()}`,
                    deviceId: 'defib_01',
                    reportedIssue: 'Error Code 303: Battery Fail',
                    status: 'open',
                    priority: 'emergency',
                    actualDefectId: 'defib_battery_dead'
                } as WorkOrder
            },
            {
                type: 'phone',
                title: 'Supply Chain Issue',
                npcName: 'Vendor (Dave)',
                description: 'We have those Li-Ion batteries available now, but only if you pay for expedited shipping.',
                urgency: 'medium',
                options: [
                    { label: 'Buy Updates ($200)', action: 'accept', consequence: '-$200 Budget, +5 Batteries', budgetImpact: -200 },
                    { label: 'Wait for Ground', action: 'defer', consequence: 'No cost, arrival next week' }
                ]
            }
        ];

        // Filter by requested type if possible, or just pick random matching type
        const matching = templates.filter(t => t.type === type);
        const template = matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : templates[0];

        // Explicitly cast to InterruptionEvent to match structure
        return {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...template
        } as InterruptionEvent;
    }
}
