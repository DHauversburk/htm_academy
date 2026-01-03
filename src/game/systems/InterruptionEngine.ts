import { Game, Scene } from 'phaser';
import { useGameStore } from '../store';
import type { Interruption } from '../types';
import { sample } from 'lodash';

// Basic Interruption Catalogue for v1
const INTERRUPTION_CATALOGUE: Interruption[] = [
    {
        id: 'phone_call_1',
        type: 'phone',
        title: 'Incoming Call',
        sender: 'Dr. Anya Sharma',
        body: "Hey, just checking on the status of that infusion pump in room 302. The nurse mentioned it was still down. Any ETA?",
        choices: [
            { text: 'Give a rough estimate (15 mins)', action: 'reply_estimate' },
            { text: 'Say you\'re working on it', action: 'reply_working' },
            { text: 'Ignore the call', action: 'ignore' }
        ]
    },
    {
        id: 'email_1',
        type: 'email',
        title: 'URGENT: Supply Room Access',
        sender: 'Facilities Dept.',
        body: "The electronic lock on the main supply room is malfunctioning. We need to reset the breaker, which will cut power to your workshop for ~5 minutes. Is now a good time?",
        choices: [
            { text: '"Yes, do it now"', action: 'power_down_confirm' },
            { text: '"No, I need the power!"', action: 'power_down_deny' },
            { text: 'Send to Junk Mail', action: 'ignore' }
        ]
    }
];


export class InterruptionEngine {
    private static instance: InterruptionEngine;
    private game: Game | null = null;
    private scene: Scene | null = null;
    private timer: ReturnType<typeof setTimeout> | null = null;
    private isRunning = false;

    private constructor() { }

    public static getInstance(): InterruptionEngine {
        if (!InterruptionEngine.instance) {
            InterruptionEngine.instance = new InterruptionEngine();
        }
        return InterruptionEngine.instance;
    }

    public init(game: Game, scene: Scene) {
        this.game = game;
        this.scene = scene;
    }

    public start() {
        if (this.isRunning) {
            console.log("InterruptionEngine already running.");
            return;
        }
        console.log("Starting InterruptionEngine...");
        this.isRunning = true;
        this.scheduleNextInterruption();
    }

    public stop() {
        if (!this.isRunning) return;
        console.log("Stopping InterruptionEngine...");
        this.isRunning = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    private scheduleNextInterruption() {
        if (!this.isRunning) return;

        const { difficulty } = useGameStore.getState();
        const baseInterval = 30000; // 30 seconds
        const randomFactor = Math.random() * 10000; // +/- 10 seconds

        let interval;
        switch (difficulty) {
            case 'hard':
                interval = baseInterval - 15000 + randomFactor; // 15-25s
                break;
            case 'medium':
                interval = baseInterval + randomFactor; // 30-40s
                break;
            case 'easy':
            default:
                interval = baseInterval + 15000 + randomFactor; // 45-55s
                break;
        }

        this.timer = setTimeout(() => {
            this.triggerRandomInterruption();
            this.scheduleNextInterruption();
        }, interval);
    }

    private triggerRandomInterruption() {
        const randomEvent = sample(INTERRUPTION_CATALOGUE);
        if (randomEvent) {
            useGameStore.getState().setActiveInterruption(randomEvent);
        }
    }
}
