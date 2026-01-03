// src/game/systems/InterruptionEngine.ts

import { useGameStore } from '../store';
import type { Difficulty } from '../types';

export interface Interruption {
    type: 'phone' | 'email' | 'in-person';
    title: string;
    message: string;
    sender: string;
}

const INTERRUPTION_POOL = {
    phone: [
        { title: 'Caller ID: Dr. Smith', sender: 'Dr. Smith', message: 'That infusion pump I called about... is it fixed yet? The patient needs it.' },
        { title: 'Caller ID: Unknown', sender: 'Anonymous', message: 'Hi, I was told to call you about a broken bed? It won\'t go up or down.' },
    ],
    email: [
        { title: 'Subject: Urgent!', sender: 'Compliance Dept.', message: 'Please complete your annual safety training by EOD.' },
    ],
    'in-person': [
        { title: 'A nurse approaches you...', sender: 'Nurse Jackie', message: 'Hey! Sorry to bother you, but the telemetry monitor in Room 3 is acting up again.' }
    ]
};

const DIFFICULTY_CONFIG = {
    easy: { minInterval: 60000, maxInterval: 120000 }, // 1-2 minutes
    medium: { minInterval: 30000, maxInterval: 90000 }, // 30-90 seconds
    hard: { minInterval: 15000, maxInterval: 45000 },  // 15-45 seconds
};

export class InterruptionEngine {
    private timer: ReturnType<typeof setTimeout> | null = null;
    private difficulty: Difficulty;

    constructor(difficulty: Difficulty) {
        this.difficulty = difficulty;
    }

    public start() {
        this.scheduleNextInterruption();
        console.log('Interruption Engine STARTED');
    }

    public stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        console.log('Interruption Engine STOPPED');
    }

    private scheduleNextInterruption() {
        const config = DIFFICULTY_CONFIG[this.difficulty];
        const interval = Math.random() * (config.maxInterval - config.minInterval) + config.minInterval;

        this.timer = setTimeout(() => {
            this.triggerRandomInterruption();
            this.scheduleNextInterruption();
        }, interval);
    }

    private triggerRandomInterruption() {
        const types = Object.keys(INTERRUPTION_POOL) as (keyof typeof INTERRUPTION_POOL)[];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const pool = INTERRUPTION_POOL[randomType];
        const randomInterruption = { ...pool[Math.floor(Math.random() * pool.length)] };

        const interruption: Interruption = {
            ...randomInterruption,
            type: randomType,
        };

        console.log('TRIGGERING INTERRUPTION:', interruption);
        useGameStore.getState().setActiveInterruption(interruption);
    }
}
