import type { InterruptionEvent, DialogOption, WorkOrder } from '../types';
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
                ],
                associatedTicket: {
                    id: `wo-${Date.now()}`,
                    deviceId: 'defib-001',
                    reportedIssue: 'Error Code 303: Battery Fail',
                    actualDefectId: 'defib_battery_dead', // Assumes this exists in DEFECTS or handled
                    priority: 'emergency',
                    customer: 'ER - Trauma 1',
                    dateCreated: new Date().toISOString(),
                    status: 'open',
                    isSafetyCheckRequired: true,
                    type: 'Defibrillator' // Adding type field to match UI usage
                } as unknown as WorkOrder
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

        if (event.type === 'walk-in') {
            EventBus.emit('spawn-interruption-npc', event);
        } else {
            EventBus.emit('interruption-triggered', event);
        }
    }
}
