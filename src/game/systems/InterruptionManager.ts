import type { InterruptionEvent, DialogOption } from '../types';
import { EventBus } from '../EventBus';

export class InterruptionManager {
    static generateEvent(difficulty: string): InterruptionEvent {
        // Simple random generator for now
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
                ]
            },
            {
                type: 'phone',
                title: 'Vendor Call',
                npcName: 'Sales Rep (Dave)',
                description: 'Hey! I got those replacement batteries you ordered. Wanna grab lunch?',
                urgency: 'low',
                options: [
                    { label: 'Sure!', action: 'defer', consequence: 'Lunch Break schedule (-1 Hour)' },
                    { label: 'Busy right now', action: 'refuse', consequence: 'No effect' }
                ]
            }
        ];

        // Pick one randomly
        const template = templates[Math.floor(Math.random() * templates.length)];

        return {
            id: crypto.randomUUID(),
            ...template
        } as InterruptionEvent;
    }

    static triggerRandomInterruption(difficulty: string) {
        const event = this.generateEvent(difficulty);
        console.log("Triggering Interruption:", event);
        EventBus.emit('interruption-triggered', event);
    }
}
