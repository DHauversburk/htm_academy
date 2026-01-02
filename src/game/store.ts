import { create } from 'zustand';
import type { Part, WorkOrder } from './types';
import { supabase } from '../lib/supabase';

// Function to find the difference between two arrays of objects
const difference = <T>(arr1: T[], arr2: T[], key: keyof T) => arr1.filter(a => !arr2.some(b => a[key] === b[key]));


interface GameState {
    // Core Profile
    profileId: string | null;
    playerName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    authMode: 'guest' | 'authenticated';
    isSetupComplete: boolean;
    avatarColor: number;

    // In-Game State
    workOrders: WorkOrder[];
    activeOrderId: string | null;
    budget: number;
    inventory: Part[];


    // Core Actions
    setPlayerName: (name: string) => void;
    setDifficulty: (level: 'easy' | 'medium' | 'hard') => void;
    setAuthMode: (mode: 'guest' | 'authenticated') => void;
    setAvatarColor: (color: number) => void;
    completeSetup: (profileId?: string) => void;

    // Game Actions
    setWorkOrders: (orders: WorkOrder[]) => void;
    setActiveOrder: (id: string | null) => void;
    completeWorkOrder: (orderId: string, partsUsed: Part[]) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    // Core Profile
    profileId: null,
    playerName: '',
    difficulty: 'easy',
    authMode: 'guest',
    avatarColor: 0xffffff,
    isSetupComplete: false,

    // In-Game State
    workOrders: [],
    activeOrderId: null,
    budget: 1000,
    inventory: [
        { id: 'part-battery', name: 'Li-Ion Battery', cost: 120, quantity: 2 },
        { id: 'part-cord', name: 'AC Power Cord', cost: 25, quantity: 5 },
        { id: 'part-inlet', name: 'AC Inlet Fuse', cost: 8, quantity: 10 },
    ],


    // Core Actions
    setPlayerName: (name) => set({ playerName: name }),
    setDifficulty: (level) => set({ difficulty: level }),
    setAuthMode: (mode) => set({ authMode: mode }),
    setAvatarColor: (color) => set({ avatarColor: color }),
    completeSetup: (profileId?: string) => set({ isSetupComplete: true, profileId: profileId }),


    // Game Actions
    setWorkOrders: (orders) => set({ workOrders: orders }),
    setActiveOrder: (id) => set({ activeOrderId: id }),
    completeWorkOrder: (orderId, partsUsed) => {
        const { budget, inventory, workOrders } = get();

        // 1. Calculate Cost & Update Budget
        const totalCost = partsUsed.reduce((sum, part) => sum + part.cost, 0);
        const newBudget = budget - totalCost;

        // 2. Update Inventory
        const newInventory = inventory.map(item => {
            const partToDeduct = partsUsed.find(p => p.id === item.id);
            if (partToDeduct) {
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        }).filter(item => item.quantity > 0); // Optional: remove items with 0 quantity

        // 3. Mark Order as Complete
        const newWorkOrders = workOrders.map(order =>
            order.id === orderId ? { ...order, status: 'completed' } : order
        );

        set({
            budget: newBudget,
            inventory: newInventory,
            workOrders: newWorkOrders,
            activeOrderId: null // Clear active order
        });
    }
}));


// Subscribe to the store's changes
useGameStore.subscribe(
    (state, prevState) => {
        // Check if the setup is complete and auth mode is authenticated
        if (state.isSetupComplete && state.authMode === 'authenticated' && state.profileId) {

            // Check what's changed in the profile
            const profileChanges: Partial<typeof state> = {};
            if (state.playerName !== prevState.playerName) profileChanges.playerName = state.playerName;
            if (state.difficulty !== prevState.difficulty) profileChanges.difficulty = state.difficulty;
            if (state.avatarColor !== prevState.avatarColor) profileChanges.avatarColor = state.avatarColor;
            if (state.budget !== prevState.budget) profileChanges.budget = state.budget;


            // Check for inventory changes (more complex)
            const inventoryAdded = difference(state.inventory, prevState.inventory, 'id');
            const inventoryRemoved = difference(prevState.inventory, state.inventory, 'id');
            const inventoryUpdated = state.inventory.filter(s =>
                prevState.inventory.some(p => p.id === s.id && p.quantity !== s.quantity)
            );

            if (inventoryAdded.length > 0 || inventoryRemoved.length > 0 || inventoryUpdated.length > 0) {
                profileChanges.inventory = state.inventory;
            }

            // If there are any changes, update Supabase
            if (Object.keys(profileChanges).length > 0) {
                updateSupabaseProfile(state.profileId, profileChanges);
            }
        }
    }
);


const updateSupabaseProfile = async (profileId: string, changes: Partial<GameState>) => {
    console.log(`Syncing profile ${profileId} with changes:`, changes);

    const { error } = await supabase
        .from('profiles')
        .update(changes)
        .eq('id', profileId);

    if (error) {
        console.error('Error updating profile:', error);
    }
};
