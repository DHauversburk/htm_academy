import type { Skill } from '../types';

export const SKILL_TREE: Record<string, Skill> = {
    // === FOUNDATIONAL SKILLS ===
    'safety_101': {
        id: 'safety_101',
        name: 'Electrical Safety 101',
        description: 'Master the basics of leakage current. Reduces Safety Check time by 50%.',
        costXP: 100,
        prerequisites: [],
        type: 'efficiency'
    },
    'basic_troubleshooting': {
        id: 'basic_troubleshooting',
        name: 'Basic Troubleshooting',
        description: 'Systematic approach to fault-finding. +5% chance to identify root cause faster.',
        costXP: 150,
        prerequisites: [],
        type: 'quality'
    },
    'customer_service': {
        id: 'customer_service',
        name: 'Customer Service Basics',
        description: 'Learn to de-escalate tense situations. NPCs start with +10% satisfaction.',
        costXP: 100,
        prerequisites: [],
        type: 'quality'
    },

    // === TECHNICAL PATH ===
    'electronics_1': {
        id: 'electronics_1',
        name: 'Basic Electronics',
        description: 'Understanding circuits permits component-level repair. 15% chance to save broken parts.',
        costXP: 250,
        prerequisites: ['basic_troubleshooting'],
        type: 'quality'
    },
    'electronics_2': {
        id: 'electronics_2',
        name: 'Advanced Electronics',
        description: 'Microelectronics and PCB repair. Unlock high-complexity device repairs.',
        costXP: 500,
        prerequisites: ['electronics_1'],
        type: 'access'
    },
    'biomedical_specialization': {
        id: 'biomedical_specialization',
        name: 'Biomedical Specialization',
        description: 'Deep knowledge of patient-critical systems. +20% XP on life-support device repairs.',
        costXP: 800,
        prerequisites: ['electronics_2', 'cbet_candidate'],
        type: 'efficiency'
    },

    // === CERTIFICATION PATH ===
    'cbet_candidate': {
        id: 'cbet_candidate',
        name: 'CBET Candidate',
        description: 'Preparing for certification. Unlocks "Medium" difficulty devices.',
        costXP: 300,
        prerequisites: ['safety_101'],
        type: 'access'
    },
    'cbet_certified': {
        id: 'cbet_certified',
        name: 'CBET Certified',
        description: 'Official Biomedical Equipment Technician. Unlocks "Hard" difficulty and specialist roles.',
        costXP: 1000,
        prerequisites: ['cbet_candidate', 'electronics_1', 'preventive_mastery'],
        type: 'access'
    },

    // === EFFICIENCY PATH ===
    'rapid_response': {
        id: 'rapid_response',
        name: 'Rapid Response',
        description: 'Triage experts move faster. +10% Movement Speed.',
        costXP: 150,
        prerequisites: [],
        type: 'speed'
    },
    'preventive_mastery': {
        id: 'preventive_mastery',
        name: 'PM Mastery',
        description: 'Streamlined PM workflows. Routine PMs yield 2x XP.',
        costXP: 500,
        prerequisites: ['cbet_candidate'],
        type: 'efficiency'
    },
    'inventory_optimization': {
        id: 'inventory_optimization',
        name: 'Inventory Optimization',
        description: 'Organized tool management. Carry capacity +25%.',
        costXP: 400,
        prerequisites: ['rapid_response'],
        type: 'efficiency'
    },
    'lean_principles': {
        id: 'lean_principles',
        name: 'Lean Principles',
        description: 'Eliminate waste in every action. -10% part costs at vendor.',
        costXP: 600,
        prerequisites: ['inventory_optimization'],
        type: 'efficiency'
    },

    // === SOCIAL/MANAGEMENT PATH ===
    'active_listening': {
        id: 'active_listening',
        name: 'Active Listening',
        description: 'Truly hear staff concerns. NPCs provide more accurate fault descriptions.',
        costXP: 200,
        prerequisites: ['customer_service'],
        type: 'quality'
    },
    'clinical_liaison': {
        id: 'clinical_liaison',
        name: 'Clinical Liaison',
        description: 'Build trust with clinical staff. Unlock priority access to critical zones.',
        costXP: 450,
        prerequisites: ['active_listening'],
        type: 'access'
    },
    'team_leadership': {
        id: 'team_leadership',
        name: 'Team Leadership',
        description: 'Mentor junior techs. Gain +15% XP when helping others (future multiplayer feature).',
        costXP: 700,
        prerequisites: ['clinical_liaison', 'cbet_certified'],
        type: 'efficiency'
    },

    // === BUDGET/BUSINESS PATH ===
    'budget_basics': {
        id: 'budget_basics',
        name: 'Budget Awareness',
        description: 'Understand fiscal responsibility. View real-time repair cost tracking.',
        costXP: 150,
        prerequisites: [],
        type: 'access'
    },
    'cost_benefit_analysis': {
        id: 'cost_benefit_analysis',
        name: 'Cost-Benefit Analysis',
        description: 'Smart repair vs. replace decisions. Unlock "economic repair" options.',
        costXP: 400,
        prerequisites: ['budget_basics'],
        type: 'quality'
    },
    'vendor_negotiation': {
        id: 'vendor_negotiation',
        name: 'Vendor Negotiation',
        description: 'Leverage bulk purchasing power. Parts cost -5% (stacks with Lean).',
        costXP: 350,
        prerequisites: ['budget_basics'],
        type: 'efficiency'
    },
    'capital_equipment_planning': {
        id: 'capital_equipment_planning',
        name: 'Capital Equipment Planning',
        description: 'Justify major purchases to admin. Unlock equipment replacement requests.',
        costXP: 900,
        prerequisites: ['cost_benefit_analysis', 'team_leadership'],
        type: 'access'
    },

    // === HIDDEN/ACHIEVEMENT SKILLS === (Unlocked by specific actions, not XP)
    // These would have costXP: 0 and unlock via achievements
    'night_owl': {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete 10 emergency calls after hours. +20% XP on urgent tickets.',
        costXP: 0,
        prerequisites: [],
        type: 'efficiency'
    },
    'mcgyver': {
        id: 'mcgyver',
        name: 'MacGyver',
        description: 'Complete 5 repairs with improvised parts. Unlock "creative repair" options.',
        costXP: 0,
        prerequisites: [],
        type: 'quality'
    },
    'peacemaker': {
        id: 'peacemaker',
        name: 'Peacemaker',
        description: 'Successfully de-escalate 20 difficult NPC interactions. NPCs start "friendly".',
        costXP: 0,
        prerequisites: [],
        type: 'quality'
    },
    'perfectionist': {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete 50 work orders with zero defects. Quality inspection pass rate: 100%.',
        costXP: 0,
        prerequisites: [],
        type: 'quality'
    }
};
