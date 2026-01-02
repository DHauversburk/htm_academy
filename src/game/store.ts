import { create } from 'zustand';
import type { WorkOrder } from './types';
import { supabase } from '../lib/supabase';

// Basic catalogue for v1
export const PARTS_CATALOGUE: Record<string, { name: string, cost: number, desc: string }> = {
    'fuse_5a': { name: '5A Fuse', cost: 5, desc: 'Standard glass fuse' },
    'power_cord': { name: 'Power Cord (Medical Grade)', cost: 25, desc: 'Grounded AC cable' },
    'battery_li': { name: 'Li-Ion Battery Pack', cost: 150, desc: 'Main backup battery' },
    'capacitor_hv': { name: 'HV Capacitor', cost: 45, desc: 'High voltage cap for Defib' }
};

interface GameState {
    playerName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    authMode: 'guest' | 'authenticated';
    isSetupComplete: boolean;
    workOrders: WorkOrder[];
    avatarColor: number;
    activeOrderId: string | null;

    // Efficiency / Economy
    budget: number;
    inventory: Record<string, number>; // itemId -> quantity

    setPlayerName: (name: string) => void;
    setDifficulty: (level: 'easy' | 'medium' | 'hard') => void;
    setAuthMode: (mode: 'guest' | 'authenticated') => void;
    setAvatarColor: (color: number) => void;
    setWorkOrders: (orders: WorkOrder[]) => void;
    setActiveOrder: (id: string | null) => void;
    completeSetup: () => void;

    // Economy Actions
    addToInventory: (itemId: string, qty: number) => void;
    consumeItem: (itemId: string) => boolean; // returns true if successful
    updateBudget: (delta: number) => void;

    saveProfile: () => Promise<void>;
    loadProfile: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
    playerName: '',
    difficulty: 'easy',
    authMode: 'guest',
    avatarColor: 0xffffff,
    isSetupComplete: false,
    workOrders: [],
    activeOrderId: null,
    budget: 1000,
    inventory: {},

    // Actions
    setPlayerName: (name) => set({ playerName: name }),
    setDifficulty: (level) => set({ difficulty: level }),
    setAuthMode: (mode) => set({ authMode: mode }),
    setAvatarColor: (color) => set({ avatarColor: color }),
    setWorkOrders: (orders) => set({ workOrders: orders }),
    setActiveOrder: (id) => set({ activeOrderId: id }),

    addToInventory: (itemId, qty) => set((state) => {
        const current = state.inventory[itemId] || 0;
        return { inventory: { ...state.inventory, [itemId]: current + qty } };
    }),

    consumeItem: (itemId) => {
        const state = get();
        const current = state.inventory[itemId] || 0;
        if (current > 0) {
            set({ inventory: { ...state.inventory, [itemId]: current - 1 } });
            return true;
        }
        return false;
    },

    updateBudget: (delta) => set((state) => ({ budget: state.budget + delta })),

    completeSetup: () => {
        set({ isSetupComplete: true });
        const { authMode, saveProfile } = get();
        if (authMode === 'authenticated') {
            saveProfile();
        }
    },

    // Cloud Sync Actions
    saveProfile: async () => {
        const { playerName, difficulty, avatarColor, budget } = get();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: playerName,
                    difficulty,
                    budget,
                    xp: 0, // Default for now
                    // avatar_color: avatarColor 
                });

            if (error) console.error('Error saving profile:', error);
        } catch (err) {
            console.error('Failed to save profile:', err);
        }
    },

    loadProfile: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                set({
                    playerName: data.username || '',
                    difficulty: (data.difficulty as 'easy' | 'medium' | 'hard') || 'easy',
                    budget: data.budget || 1000,
                });
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    }
}));
