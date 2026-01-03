import type { Skill } from '../types';

export const SKILL_TREE: Record<string, Skill> = {
    'safety_101': {
        id: 'safety_101',
        name: 'Electrical Safety 101',
        description: 'Master the basics of leakage current. Reduces Safety Check time by 50%.',
        costXP: 100,
        prerequisites: [],
        type: 'efficiency'
    },
    'cbet_candidate': {
        id: 'cbet_candidate',
        name: 'CBET Candidate',
        description: 'Preparing for certification. Unlocks "Medium" difficulty devices.',
        costXP: 300,
        prerequisites: ['safety_101'],
        type: 'access'
    },
    'electronics_1': {
        id: 'electronics_1',
        name: 'Basic Electronics',
        description: 'Understanding circuits permits component-level repair. Chance to save broken parts.',
        costXP: 250,
        prerequisites: [],
        type: 'quality'
    },
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
        description: 'Streamlined workflows. Routine PMs yield 2x XP.',
        costXP: 500,
        prerequisites: ['cbet_candidate'],
        type: 'efficiency'
    }
};
