import type { Scenario } from '../../types';

export const TUTORIAL_SCENARIO: Scenario = {
    id: 'day_one_orientation',
    title: 'Module 1: Visual Inspection',
    description: 'Welcome to HTM. Your first task is to identify physical safety hazards before applying power.',
    orders: [
        {
            id: 'WO-2025-001',
            deviceId: 'PUMP01',
            customer: 'Oncology Floor',
            priority: 'routine',
            dateCreated: '2025-10-12',
            reportedIssue: 'Device keeps alarming "Check AC Code"',
            actualDefectId: 'frayed_cord',
            status: 'open',
            isSafetyCheckRequired: true,
            reward: 75,
            difficulty: 1,
            ticketType: 'CM',
            locationDetails: {
                department: 'Oncology',
                room: 'Room 402',
                bed: 'Bed A'
            }
        }
    ]
};
