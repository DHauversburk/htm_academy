import type { WorkOrder, Priority } from '../types';

// --- MOCK DATABASE ---
const MOCK_DEVICES = {
    'pump_alaris': { id: 'pump_alaris', name: 'Alaris 8100', type: 'Infusion Pump', imageKey: 'device_pump' },
    'defib_zoll': { id: 'defib_zoll', name: 'Zoll R Series', type: 'Defibrillator', imageKey: 'device_defib' },
    'monitor_philips': { id: 'monitor_philips', name: 'IntelliVue MX400', type: 'Patient Monitor', imageKey: 'device_monitor' },
    'ekg_ge': { id: 'ekg_ge', name: 'MAC 5500', type: 'EKG Machine', imageKey: 'device_ekg' },
    'vent_drager': { id: 'vent_drager', name: 'Evita Infinity V500', type: 'Ventilator', imageKey: 'device_vent' }
};

const PM_TASKS = [
    { id: 'pm_annual', description: 'Annual Safety Inspection due', baseReward: 60, difficulty: 1 },
    { id: 'pm_batt', description: 'Scheduled Battery Replacement', baseReward: 80, difficulty: 1 },
    { id: 'pm_cal', description: 'Calibration Verification required', baseReward: 100, difficulty: 2 },
    { id: 'pm_sw', description: 'Software Update Available (v2.4)', baseReward: 70, difficulty: 1 }
];

const REPAIR_TASKS = [
    { id: 'broken_case', description: 'Outer casing cracked/damaged', baseReward: 120, difficulty: 2 },
    { id: 'bad_screen', description: 'Touchscreen unresponsive', baseReward: 150, difficulty: 3 },
    { id: 'power_fail', description: 'Device fails to power on', baseReward: 200, difficulty: 3 },
    { id: 'air_in_line', description: 'Persistent "Air in Line" error', baseReward: 180, difficulty: 4 },
    { id: 'ecg_noise', description: 'ECG signal noisy/artifact', baseReward: 140, difficulty: 2 },
    { id: 'alarm_speaker', description: 'Audio alarm volume low/muffled', baseReward: 110, difficulty: 2 },
    { id: 'connector_dmg', description: 'SpO2 connector port damaged', baseReward: 160, difficulty: 3 }
];

const DEPARTMENTS = [
    { id: 'ICU', name: 'ICU', rooms: ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Central Station'] },
    { id: 'ER', name: 'Emergency', rooms: ['Trauma 1', 'Trauma 2', 'Triage A', 'Triage B', 'Exam 4'] },
    { id: 'OR', name: 'Operating Room', rooms: ['OR 1', 'OR 2', 'OR 3', 'PACU Bay 1', 'Anesthesia Workroom'] },
    { id: 'MEDSURG', name: 'Med-Surg', rooms: ['Room 304', 'Room 305', 'Room 306', 'Nurse Station'] },
    { id: 'RAD', name: 'Radiology', rooms: ['X-Ray 1', 'CT Control', 'MRI Prep', 'Ultrasound 2'] }
];

// Weighted Probability Tables
const DIFFICULTY_CONFIG = {
    'easy': {
        ticketCount: 3,
        pmChance: 0.8, // 80% PMs (Easy)
        priorities: ['routine'] as Priority[],
        rootCauseObscurity: 0.1
    },
    'medium': {
        ticketCount: 5,
        pmChance: 0.4, // 40% PMs
        priorities: ['routine', 'urgent'] as Priority[],
        rootCauseObscurity: 0.3
    },
    'hard': {
        ticketCount: 8,
        pmChance: 0.1, // 10% PMs (Mostly broken stuff)
        priorities: ['urgent', 'emergency'] as Priority[],
        rootCauseObscurity: 0.7
    }
};

export class GameDirector {

    /**
     * The "Director" logic - procedurally generates a shift based on player level.
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
        const deviceKeys = Object.keys(MOCK_DEVICES);
        const randomDeviceKey = deviceKeys[Math.floor(Math.random() * deviceKeys.length)];
        const device = MOCK_DEVICES[randomDeviceKey as keyof typeof MOCK_DEVICES];

        // 2. Roll for Type (PM vs CM)
        const isPM = Math.random() < config.pmChance;
        const ticketType = isPM ? 'PM' : 'CM';

        // 3. Roll for Defect/Task
        const taskPool = isPM ? PM_TASKS : REPAIR_TASKS;
        const task = taskPool[Math.floor(Math.random() * taskPool.length)];

        // 4. Generate Location
        const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
        const room = dept.rooms[Math.floor(Math.random() * dept.rooms.length)];
        const bed = Math.random() > 0.5 ? `Bed ${Math.floor(Math.random() * 4) + 1}` : undefined;

        // 5. Generate Description
        let reportedIssue = task.description;
        if (!isPM && Math.random() < config.rootCauseObscurity) {
            const vagueissues = ["It's not working", "Beeping loudly", "Nurse says it smells funny", "Screen is weird"];
            reportedIssue = vagueissues[Math.floor(Math.random() * vagueissues.length)];
        }

        // 6. Roll for Priority
        let priority = config.priorities[Math.floor(Math.random() * config.priorities.length)];
        // PMs are almost always routine
        if (isPM) priority = 'routine';

        // 7. Calculate Money
        let reward = task.baseReward;
        if (priority === 'urgent') reward *= 1.5;
        if (priority === 'emergency') reward *= 2.5;

        return {
            id: `WO-${new Date().getFullYear()}-${1000 + index}`,
            deviceId: device.id,
            customer: dept.name, // Legacy field fallback
            locationDetails: {
                department: dept.name,
                room: room,
                bed: bed
            },
            priority: priority,
            ticketType: ticketType,
            dateCreated: new Date().toISOString(),
            reportedIssue: reportedIssue,
            actualDefectId: task.id,
            status: 'open',
            isSafetyCheckRequired: isPM || Math.random() < 0.3,
            reward: Math.floor(reward),
            difficulty: task.difficulty
        };
    }

    // Helper to get device details by ID for the UI
    static getDeviceDetails(id: string) {
        return MOCK_DEVICES[id as keyof typeof MOCK_DEVICES];
    }
}
