import type { Device, Scenario, Defect } from '../../types';

export const DEVICES: Record<string, Device> = {
    'pump_alaris': {
        id: 'pump_alaris',
        name: 'Alaris 8100',
        type: 'Infusion Pump Module',
        riskLevel: 'high',
        imageKey: 'device_pump'
    },
    'defib_zoll': {
        id: 'defib_zoll',
        name: 'Zoll R Series',
        type: 'Defibrillator',
        riskLevel: 'high',
        imageKey: 'device_defib'
    }
};

export const DEFECTS: Record<string, Defect> = {
    'frayed_cord': {
        id: 'frayed_cord',
        name: 'Damaged Power Cord',
        description: 'Insulation on the AC power cord is retracted, exposing inner conductors.',
        isSafetyHazard: true,
        fixAction: 'replace_cord'
    }
};

export const TUTORIAL_SCENARIO: Scenario = {
    id: 'day_one_orientation',
    title: 'Module 1: Visual Inspection',
    description: 'Welcome to HTM. Your first task is to identify physical safety hazards before applying power.',
    orders: [
        {
            id: 'WO-2025-001',
            deviceId: 'pump_alaris',
            customer: 'Oncology Floor',
            priority: 'routine',
            dateCreated: '2025-10-12',
            reportedIssue: 'Device keeps alarming "Check AC Code"',
            actualDefectId: 'frayed_cord',
            status: 'open',
            isSafetyCheckRequired: true,
            reward: 75,
            difficulty: 1
        }
    ]
};
