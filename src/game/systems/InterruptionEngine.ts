import { useGameStore } from '../store';
import { GameDifficulty } from '../types';

// TODO: Move to a dedicated data file
const interruptions = [
  {
    type: 'phone',
    title: 'Incoming Call',
    sender: 'Dr. Anya Sharma',
    message:
      "Hi, it's Dr. Sharma. I'm having trouble with the new infusion pump in room 302. It's not accepting the programming. Can you come take a look?",
    choices: [
      { text: 'Accept', action: 'accept' },
      { text: 'Ignore', action: 'ignore' },
    ],
  },
  {
    type: 'email',
    title: 'New Email',
    sender: 'IT Department',
    message:
      'ACTION REQUIRED: All staff must complete the mandatory cybersecurity training by 5:00 PM today. Failure to comply will result in account suspension.',
    choices: [
      { text: 'Read', action: 'read' },
      { text: 'Delete', action: 'delete' },
    ],
  },
  {
    type: 'person',
    title: 'A nurse approaches you',
    sender: 'Nurse David Chen',
    message:
      "Excuse me, the central monitoring station is showing a 'no signal' error for patient in room 412. Can you check it out?",
    choices: [
      { text: 'Agree', action: 'agree' },
      { text: 'Dismiss', action: 'dismiss' },
    ],
  },
];

export class InterruptionEngine {
  private static instance: InterruptionEngine;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): InterruptionEngine {
    if (!InterruptionEngine.instance) {
      InterruptionEngine.instance = new InterruptionEngine();
    }
    return InterruptionEngine.instance;
  }

  public start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.scheduleNextInterruption();
    console.log('InterruptionEngine started.');
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log('InterruptionEngine stopped.');
  }

  private scheduleNextInterruption(): void {
    if (!this.isRunning) {
      return;
    }

    const difficulty = useGameStore.getState().difficulty;
    const delay = this.getDelayForDifficulty(difficulty);

    this.timer = setTimeout(() => {
      this.triggerInterruption();
      this.scheduleNextInterruption();
    }, delay);
  }

  private getDelayForDifficulty(difficulty: GameDifficulty): number {
    switch (difficulty) {
      case 'easy':
        return 60 * 1000; // 60 seconds
      case 'medium':
        return 45 * 1000; // 45 seconds
      case 'hard':
        return 30 * 1000; // 30 seconds
      default:
        return 60 * 1000;
    }
  }

  public triggerInterruption(): void {
    //
    if (useGameStore.getState().activeInterruption) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * interruptions.length);
    const interruption = interruptions[randomIndex];
    useGameStore.getState().setActiveInterruption(interruption);
    console.log('Interruption triggered:', interruption.title);
  }
}
