// Achievement tracking system for unlocking hidden skills

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocks: string; // Skill ID
    progress: number;
    target: number;
    category: 'technical' | 'social' | 'efficiency' | 'quality';
}

export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'progress'>> = {
    'night_shift_veteran': {
        id: 'night_shift_veteran',
        name: 'Night Shift Veteran',
        description: 'Complete 10 emergency calls after hours',
        unlocks: 'night_owl',
        target: 10,
        category: 'efficiency'
    },
    'improvisational_genius': {
        id: 'improvisational_genius',
        name: 'Improvisational Genius',
        description: 'Complete 5 repairs with improvised/alternative parts',
        unlocks: 'mcgyver',
        target: 5,
        category: 'technical'
    },
    'conflict_resolution_expert': {
        id: 'conflict_resolution_expert',
        name: 'Conflict Resolution Expert',
        description: 'De-escalate 20 difficult NPC interactions',
        unlocks: 'peacemaker',
        target: 20,
        category: 'social'
    },
    'zero_defect_master': {
        id: 'zero_defect_master',
        name: 'Zero Defect Master',
        description: 'Complete 50 work orders with perfect quality',
        unlocks: 'perfectionist',
        target: 50,
        category: 'quality'
    }
};

// Track various player performance metrics
export interface PerformanceMetrics {
    // Repair Quality
    totalRepairs: number;
    perfectRepairs: number;
    failedRepairs: number;

    // Time Efficiency
    emergencyCallsCompleted: number;
    afterHoursRepairs: number;
    averageRepairTime: number;

    // Social
    npcInteractions: number;
    difficultNpcsDiffused: number;
    complaintsFiled: number;

    // Budget/Business
    totalBudgetSpent: number;
    totalBudgetSaved: number;
    partsImprovised: number;

    // Technical
    componentLevelRepairs: number;
    diagnosticAccuracy: number; // Percentage

    // PM Work
    pmsCompleted: number;
    pmScoreAverage: number;
}
