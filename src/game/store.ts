import { create } from 'zustand';
import type { WorkOrder } from './types';

interface GameState {
    playerName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    authMode: 'guest' | 'authenticated';
    isSetupComplete: boolean;
    workOrders: WorkOrder[];
    avatarColor: number;
    activeOrderId: string | null;

    setPlayerName: (name: string) => void;
    setDifficulty: (level: 'easy' | 'medium' | 'hard') => void;
    setAuthMode: (mode: 'guest' | 'authenticated') => void;
    setAvatarColor: (color: number) => void;
    setWorkOrders: (orders: WorkOrder[]) => void;
    setActiveOrder: (id: string | null) => void;
    completeSetup: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    playerName: '',
    difficulty: 'easy',
    authMode: 'guest',
    avatarColor: 0xffffff,
    isSetupComplete: false,
    workOrders: [],
    activeOrderId: null,

    setPlayerName: (name) => set({ playerName: name }),
    setDifficulty: (level) => set({ difficulty: level }),
    setAuthMode: (mode) => set({ authMode: mode }),
    setAvatarColor: (color) => set({ avatarColor: color }),
    setWorkOrders: (orders) => set({ workOrders: orders }),
    setActiveOrder: (id) => set({ activeOrderId: id }),
    completeSetup: () => set({ isSetupComplete: true }),
}));
