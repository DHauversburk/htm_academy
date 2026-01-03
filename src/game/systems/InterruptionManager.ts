import type { InterruptionEvent, WorkOrder } from '../types';
import { EventBus } from '../EventBus';

export class InterruptionManager {
    static generateEvent(): InterruptionEvent {
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
            },
            {
                type: 'email',
                title: 'CAPEX Request: New Infusion Pumps',
                npcName: 'Administration',
                description: 'Please review the attached quote for 10 new infusion pumps and approve the purchase order. The total cost is $5,000.',
                urgency: 'low',
                options: [
                    { label: 'Approve Purchase ($5,000)', action: 'accept', consequence: '-$5,000 Budget, +10 Pumps', budgetImpact: -5000 },
                    { label: 'Request More Info', action: 'defer', consequence: 'Postpones decision, no immediate effect' }
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

    static triggerRandomInterruption() {
        const event = this.generateEvent();
        console.log("Triggering Interruption:", event);

        if (event.type === 'walk-in') {
            EventBus.emit('spawn-interruption-npc', event);
        } else {
            EventBus.emit('interruption-triggered', event);
        }
    }
}
