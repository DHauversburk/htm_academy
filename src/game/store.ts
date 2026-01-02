import { create } from 'zustand';
import type { WorkOrder } from './types';
import { supabase } from '../lib/supabase';

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

    // Actions
    setPlayerName: (name) => set({ playerName: name }),
    setDifficulty: (level) => set({ difficulty: level }),
    setAuthMode: (mode) => set({ authMode: mode }),
    setAvatarColor: (color) => set({ avatarColor: color }),
    setWorkOrders: (orders) => set({ workOrders: orders }),
    setActiveOrder: (id) => set({ activeOrderId: id }),
    completeSetup: () => {
        set({ isSetupComplete: true });
        const { authMode, saveProfile } = get();
        if (authMode === 'authenticated') {
            saveProfile();
        }
    },

    // Cloud Sync Actions
    saveProfile: async () => {
        const { playerName, difficulty, avatarColor } = get();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: playerName,
                    difficulty,
                    xp: 0, // Default for now
                    // avatar_color: avatarColor // Note: need to add this column to DB later if we want it saved
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
                    // Restore other fields as needed
                });
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    }
}));
