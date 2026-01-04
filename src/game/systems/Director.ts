import type { WorkOrder, Priority } from '../types';
import { DEVICES, DEFECTS } from '../data/scenarios/tutorial'; // In real app, this comes from Supabase/LocalDB

// Weighted Probability Tables
const DIFFICULTY_CONFIG = {
    'easy': {
        ticketCount: 3,
        safetyCheckChance: 0.3, // 30% chance needing electrical safety
        priorities: ['routine'] as Priority[],
        rootCauseObscurity: 0.1 // 10% chance the reported issue is wrong
    },
    'medium': {
        ticketCount: 5,
        safetyCheckChance: 0.6,
        priorities: ['routine', 'urgent'] as Priority[],
        rootCauseObscurity: 0.4
    },
    'hard': {
        ticketCount: 8,
        safetyCheckChance: 1.0, // Everything needs checking
        priorities: ['urgent', 'emergency'] as Priority[],
        rootCauseObscurity: 0.8 // 80% chance the nurse reported the wrong thing!
    }
};

export class GameDirector {

    /**
     * The "Director" logic - procedurally generates a shift based on player level.
     * This mimics a "Dungeon Master" creating a balanced encounter.
     */
    static generateShift(difficulty: 'easy' | 'medium' | 'hard'): WorkOrder[] {
        const config = DIFFICULTY_CONFIG[difficulty];
        const orders: WorkOrder[] = [];

        for (let i = 0; i < config.ticketCount; i++) {
            orders.push(this.rollWorkOrder(config, i));
        }

        return orders;
    }

    private static rollWorkOrder(config: typeof DIFFICULTY_CONFIG['easy'], index: number): WorkOrder {
        // 1. Roll for Device
        const deviceKeys = Object.keys(DEVICES);
        const randomDeviceKey = deviceKeys[Math.floor(Math.random() * deviceKeys.length)];
        const device = DEVICES[randomDeviceKey];

        // 2. Roll for Defect
        const defectKeys = Object.keys(DEFECTS);
        const randomDefectKey = defectKeys[Math.floor(Math.random() * defectKeys.length)];
        const defect = DEFECTS[randomDefectKey];

        // 3. Generate "Reported Issue" (The Nurse's Description)
        // If obscurity is high, the nurse description might be vague or wrong compared to the actual defect
        const isObscure = Math.random() < config.rootCauseObscurity;
        const reportedIssue = isObscure
            ? "It's just not working right" // Vague
            : defect.description; // Accurate

        // 4. Roll for Priority
        const priority = config.priorities[Math.floor(Math.random() * config.priorities.length)];

        // 5. Calculate Reward & Difficulty
        let baseReward = 50 + Math.floor(Math.random() * 50); // $50-100 base
        let diffRating = 1;

        if (priority === 'urgent') {
            baseReward *= 1.5;
            diffRating += 1;
        }
        if (priority === 'emergency') {
            baseReward *= 2.5;
            diffRating += 2;
        }
        if (isObscure) {
            baseReward += 50;
            diffRating += 1;
        }

        return {
            id: `WO-${new Date().getFullYear()}-${1000 + index}`,
            deviceId: device.id,
            customer: this.getRandomDepartment(),
            priority: priority,
            dateCreated: new Date().toISOString(),
            reportedIssue: reportedIssue,
            actualDefectId: defect.id,
            status: 'open',
            isSafetyCheckRequired: Math.random() < config.safetyCheckChance,
            reward: Math.floor(baseReward),
            difficulty: diffRating
        };
    }

    private static getRandomDepartment(): string {
        const depts = ['ICU', 'ER', 'OR', 'Med-Surg', 'Radiology', 'PACU'];
        return depts[Math.floor(Math.random() * depts.length)];
    }
}
