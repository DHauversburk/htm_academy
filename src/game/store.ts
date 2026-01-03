import { create } from 'zustand';
import type { WorkOrder } from './types';
import { supabase } from '../lib/supabase';
import { devtools, persist } from 'zustand/middleware';

interface GameState {
    playerName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    authMode: 'guest' | 'authenticated';
    isSetupComplete: boolean;
    workOrders: WorkOrder[];
    avatarColor: number;
    activeOrderId: string | null;
    userId: string | null; // To hold the authenticated user's ID
    lastSynced: Date | null;

    setPlayerName: (name: string) => void;
    setDifficulty: (level: 'easy' | 'medium' | 'hard') => void;
    setAuthMode: (mode: 'guest' | 'authenticated') => void;
    setAvatarColor: (color: number) => void;
    setWorkOrders: (orders: WorkOrder[]) => void;
    setActiveOrder: (id: string | null) => void;
    completeSetup: () => void;
    syncProfile: () => void;
    fetchProfile: () => void;
    resetGame: () => void;
    setUserId: (id: string | null) => void;
}

const useGameStore = create<GameState>()(
    devtools(
        persist(
            (set, get) => ({
                playerName: '',
                difficulty: 'easy',
                authMode: 'guest',
                avatarColor: 0xffffff,
                isSetupComplete: false,
                workOrders: [],
                activeOrderId: null,
                userId: null, // Placeholder for now
                lastSynced: null,

                setPlayerName: (name) => {
                    set({ playerName: name });
                    get().syncProfile();
                },
                setDifficulty: (level) => {
                    set({ difficulty: level });
                    get().syncProfile();
                },
                setAuthMode: (mode) => set({ authMode: mode }),
                setAvatarColor: (color) => {
                    set({ avatarColor: color });
                    get().syncProfile();
                },
                setWorkOrders: (orders) => set({ workOrders: orders }),
                setActiveOrder: (id) => set({ activeOrderId: id }),
                completeSetup: () => {
                    set({ isSetupComplete: true });
                    get().syncProfile();
                },

                syncProfile: async () => {
                    const { authMode, playerName, difficulty, avatarColor, userId } = get();

                    // Only sync if in authenticated mode and we have a user ID.
                    if (authMode !== 'authenticated' || !userId) return;

                    console.log('Attempting to sync profile for user ID:', userId);

                    const { error } = await supabase
                        .from('profiles')
                        .upsert({
                            id: userId,
                            updated_at: new Date().toISOString(),
                            username: playerName,
                            difficulty: difficulty,
                            avatar_color: avatarColor,
                        }, {
                            onConflict: 'id',
                        });

                    if (error) {
                        console.error('Supabase sync error:', error);
                    } else {
                        set({ lastSynced: new Date() });
                        console.log('Profile synced successfully!');
                    }
                },

                fetchProfile: async () => {
                    const { userId } = get();
                    if (!userId) return;

                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (error) {
                        console.error('Error fetching profile:', error);
                    } else if (data) {
                        set({
                            playerName: data.username,
                            difficulty: data.difficulty,
                            avatarColor: data.avatar_color,
                            isSetupComplete: true,
                        });
                    }
                },

                resetGame: () => {
                    set({
                        playerName: '',
                        difficulty: 'easy',
                        authMode: 'guest',
                        avatarColor: 0xffffff,
                        isSetupComplete: false,
                        workOrders: [],
                        activeOrderId: null,
                        userId: null,
                        lastSynced: null,
                    });
                },

                setUserId: (userId) => set({ userId }),
            }),
            {
                name: 'htm-academy-storage', // name of the item in the storage (must be unique)
            }
        )
    )
);

// Subscribe to auth changes to link Supabase auth with Zustand state
supabase.auth.onAuthStateChange((event, session) => {
    const { setUserId, fetchProfile, resetGame, setAuthMode } = useGameStore.getState();

    if (session) {
        setUserId(session.user.id);
        setAuthMode('authenticated');
        fetchProfile();
    } else {
        resetGame();
    }
});

export { useGameStore };
