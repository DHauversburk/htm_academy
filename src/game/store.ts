import { create } from 'zustand';
import type { WorkOrder } from './types';
import { supabase } from '../lib/supabase';
import { SKILL_TREE } from './data/skills';
import { ACHIEVEMENTS } from './data/achievements';
import type { Achievement, PerformanceMetrics } from './data/achievements';

// Basic catalogue for v1
export const PARTS_CATALOGUE: Record<string, { name: string, cost: number, desc: string, weight: number }> = {
    'fuse_5a': { name: '5A Fuse', cost: 5, desc: 'Standard glass fuse', weight: 0.1 },
    'power_cord': { name: 'Power Cord (Medical Grade)', cost: 25, desc: 'Grounded AC cable', weight: 1.0 },
    'battery_li': { name: 'Li-Ion Battery Pack', cost: 150, desc: 'Main backup battery', weight: 2.5 },
    'capacitor_hv': { name: 'HV Capacitor', cost: 45, desc: 'High voltage cap for Defib', weight: 0.5 },
    'pm_kit_basic': { name: 'PM Kit (Basic)', cost: 50, desc: 'Filters, O-rings, Stickers', weight: 1.5 }
};

interface GameState {
    playerName: string;
    jobTitle: string;
    difficulty: 'easy' | 'medium' | 'hard';
    authMode: 'guest' | 'authenticated';
    isSetupComplete: boolean;
    isTutorialActive: boolean;
    workOrders: WorkOrder[];
    avatarColor: number;
    activeOrderId: string | null;

    // RPG Stats
    stats: {
        level: number;
        strength: number;
        speed: number;
        xp: number;
        unlockedSkills: string[];
        currentXP: number;
        maxXP: number;
    };
    container: 'hands' | 'fanny_pack' | 'backpack' | 'cart' | 'auto_cart';

    // Efficiency / Economy
    budget: number;
    inventory: Record<string, number>; // itemId -> quantity

    // Achievements & Performance
    achievements: Record<string, Achievement>;
    metrics: PerformanceMetrics;

    setPlayerName: (name: string) => void;
    setJobTitle: (title: string) => void;
    setDifficulty: (level: 'easy' | 'medium' | 'hard') => void;
    setAuthMode: (mode: 'guest' | 'authenticated') => void;
    setAvatarColor: (color: number) => void;
    setWorkOrders: (orders: WorkOrder[]) => void;
    addWorkOrder: (order: WorkOrder) => void;
    setActiveOrder: (id: string | null) => void;
    setTutorialStatus: (isActive: boolean) => void;
    completeSetup: () => void;

    // Actions
    addToInventory: (itemId: string, qty: number) => void;
    consumeItem: (itemId: string) => boolean; // returns true if successful
    updateBudget: (delta: number) => void;

    // Getters / Helpers
    calculateSpeed: () => number;

    saveProfile: () => Promise<void>;
    loadProfile: () => Promise<void>;
    syncInventory: () => Promise<void>;
    logTicketCompletion: (ticket: WorkOrder, fault: string, xp: number) => Promise<void>;
    unlockSkill: (skillId: string) => boolean;

    // Performance Tracking
    trackMetric: (metric: keyof PerformanceMetrics, value: number) => void;
    checkAchievements: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    playerName: '',
    jobTitle: 'BMET I',
    difficulty: 'easy',
    authMode: 'guest',
    avatarColor: 0xffffff,
    isSetupComplete: false,
    isTutorialActive: false,
    workOrders: [],
    activeOrderId: null,
    budget: 1000,
    inventory: {},

    // Initialize achievements from registry
    achievements: Object.fromEntries(
        Object.entries(ACHIEVEMENTS).map(([id, data]) => [
            id,
            { ...data, progress: 0 }
        ])
    ),

    // Initialize metrics
    metrics: {
        totalRepairs: 0,
        perfectRepairs: 0,
        failedRepairs: 0,
        emergencyCallsCompleted: 0,
        afterHoursRepairs: 0,
        averageRepairTime: 0,
        npcInteractions: 0,
        difficultNpcsDiffused: 0,
        complaintsFiled: 0,
        totalBudgetSpent: 0,
        totalBudgetSaved: 0,
        partsImprovised: 0,
        componentLevelRepairs: 0,
        diagnosticAccuracy: 100,
        pmsCompleted: 0,
        pmScoreAverage: 0
    },

    stats: {
        level: 1,
        strength: 5, // Base strength
        speed: 200, // Base pixels per second
        xp: 0,
        unlockedSkills: [],
        currentXP: 0,
        maxXP: 1000
    },
    container: 'hands',

    // Actions
    setPlayerName: (name) => set({ playerName: name }),
    setJobTitle: (title) => set({ jobTitle: title }),
    setDifficulty: (level) => set({ difficulty: level }),
    setAuthMode: (mode) => set({ authMode: mode }),
    setAvatarColor: (color) => set({ avatarColor: color }),
    setWorkOrders: (orders) => set({ workOrders: orders }),
    addWorkOrder: (order: WorkOrder) => set((state) => ({ workOrders: [...state.workOrders, order] })),
    setActiveOrder: (id) => set({ activeOrderId: id }),
    setTutorialStatus: (isActive) => set({ isTutorialActive: isActive }),

    // Cloud Sync Stats
    saveProfile: async () => {
        const { playerName, difficulty, budget, syncInventory } = get();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Save Profile Meta
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: playerName,
                    difficulty,
                    budget
                });
            if (error) console.error('Save Profile Error:', error);

            // 2. Save Inventory
            requestAnimationFrame(() => syncInventory());

        } catch (err) {
            console.error('Failed to save profile:', err);
        }
    },

    loadProfile: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Load Profile Meta
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                set({
                    playerName: profile.username || '',
                    difficulty: (profile.difficulty as 'easy' | 'medium' | 'hard') || 'easy',
                    budget: profile.budget || 1000,
                });
            }

            // 2. Load Inventory
            const { data: invItems } = await supabase
                .from('inventory_items')
                .select('item_id, quantity')
                .eq('player_id', user.id); // Note: Schema uses player_id

            if (invItems) {
                const loadedInv: Record<string, number> = {};
                invItems.forEach(row => {
                    if (row.quantity > 0) loadedInv[row.item_id] = row.quantity;
                });
                set({ inventory: loadedInv });
            }

        } catch (err) {
            console.error('Error loading profile:', err);
        }
    },

    syncInventory: async () => {
        const { inventory, authMode } = get();
        if (authMode !== 'authenticated') return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const upserts = Object.entries(inventory).map(([itemId, qty]) => ({
                player_id: user.id, // Using existing schema column 'player_id'
                item_id: itemId,
                quantity: qty
            }));

            if (upserts.length === 0) return;

            const { error } = await supabase
                .from('inventory_items')
                .upsert(upserts, { onConflict: 'player_id, item_id' });

            if (error) console.error("Inventory Sync Failed:", error);

        } catch (err) {
            console.error("Sync Exception:", err);
        }
    },

    addToInventory: (itemId, qty) => {
        set((state) => {
            const current = state.inventory[itemId] || 0;
            const newInv = { ...state.inventory, [itemId]: current + qty };
            return { inventory: newInv };
        });
        get().syncInventory();
    },

    consumeItem: (itemId) => {
        const state = get();
        const current = state.inventory[itemId] || 0;
        if (current > 0) {
            set({ inventory: { ...state.inventory, [itemId]: current - 1 } });
            get().syncInventory();
            return true;
        }
        return false;
    },

    updateBudget: (delta) => set((state) => ({ budget: state.budget + delta })),

    calculateSpeed: () => {
        const state = get();
        // Calculate total weight
        let totalWeight = 0;
        Object.entries(state.inventory).forEach(([id, qty]) => {
            const item = PARTS_CATALOGUE[id];
            if (item) totalWeight += item.weight * qty;
        });

        // Capacity Limits
        const limits = {
            'hands': 5,
            'fanny_pack': 15,
            'backpack': 40,
            'cart': 100,
            'auto_cart': 200
        };
        const maxLoad = limits[state.container] + state.stats.strength; // Strength bonus

        // Penalty Curve
        let speed = state.stats.speed;
        if (totalWeight > maxLoad * 0.75) {
            // Over 75% capacity -> start slowing down
            const penaltyRatio = (totalWeight - (maxLoad * 0.75)) / (maxLoad * 0.25);
            // Max penalty 60% slow
            speed = speed * (1 - (penaltyRatio * 0.6));
        }

        return Math.max(50, speed); // Minimum speed 50
    },

    completeSetup: () => {
        set({ isSetupComplete: true });
        const { authMode, saveProfile } = get();
        if (authMode === 'authenticated') {
            saveProfile();
        }
    },

    logTicketCompletion: async (ticket, fault, xp) => {
        const { authMode, stats } = get();

        // 1. Update Local Stats
        set({ stats: { ...stats, xp: stats.xp + xp } });

        // 2. Cloud Sync
        if (authMode !== 'authenticated') return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('career_log')
                .insert({
                    user_id: user.id,
                    ticket_id: ticket.id,
                    device_name: ticket.deviceId, // Using deviceId as name for now, or fetch actual name
                    fault_found: fault,
                    xp_earned: xp
                });

            if (error) console.error("Career Log Failed:", error);
        } catch (err) {
            console.error("Log Exception:", err);
        }
    },
    unlockSkill: (skillId) => {
        const { stats } = get();
        const skill = SKILL_TREE[skillId];

        if (!skill) return false;
        if (stats.unlockedSkills.includes(skillId)) return true; // Already unlocked
        if (stats.xp < skill.costXP) return false; // Not enough XP

        // Check prerequisites
        const hasPrereqs = skill.prerequisites.every(p => stats.unlockedSkills.includes(p));
        if (!hasPrereqs) return false;

        set({
            stats: {
                ...stats,
                xp: stats.xp - skill.costXP,
                unlockedSkills: [...stats.unlockedSkills, skillId]
            }
        });

        // TODO: Sync this unlock to server (e.g., in profile metadata or new table)
        get().saveProfile();

        return true;
    },

    trackMetric: (metric, value) => {
        const { metrics, checkAchievements } = get();
        set({
            metrics: {
                ...metrics,
                [metric]: typeof value === 'number' ? value : metrics[metric] + 1
            }
        });

        // Check if this triggered any achievements
        requestAnimationFrame(() => checkAchievements());
    },

    checkAchievements: () => {
        const { achievements, metrics, stats } = get();
        let unlocked = false;

        // Night Owl check
        if (achievements.night_shift_veteran.progress < achievements.night_shift_veteran.target) {
            const newProgress = metrics.afterHoursRepairs;
            if (newProgress >= achievements.night_shift_veteran.target) {
                set({
                    achievements: {
                        ...achievements,
                        night_shift_veteran: { ...achievements.night_shift_veteran, progress: newProgress }
                    },
                    stats: {
                        ...stats,
                        unlockedSkills: [...stats.unlockedSkills, 'night_owl']
                    }
                });
                unlocked = true;
            }
        }

        // MacGyver check
        if (achievements.improvisational_genius.progress < achievements.improvisational_genius.target) {
            const newProgress = metrics.partsImprovised;
            if (newProgress >= achievements.improvisational_genius.target) {
                set({
                    achievements: {
                        ...achievements,
                        improvisational_genius: { ...achievements.improvisational_genius, progress: newProgress }
                    },
                    stats: {
                        ...stats,
                        unlockedSkills: [...stats.unlockedSkills, 'mcgyver']
                    }
                });
                unlocked = true;
            }
        }

        // Peacemaker check
        if (achievements.conflict_resolution_expert.progress < achievements.conflict_resolution_expert.target) {
            const newProgress = metrics.difficultNpcsDiffused;
            if (newProgress >= achievements.conflict_resolution_expert.target) {
                set({
                    achievements: {
                        ...achievements,
                        conflict_resolution_expert: { ...achievements.conflict_resolution_expert, progress: newProgress }
                    },
                    stats: {
                        ...stats,
                        unlockedSkills: [...stats.unlockedSkills, 'peacemaker']
                    }
                });
                unlocked = true;
            }
        }

        // Perfectionist check
        if (achievements.zero_defect_master.progress < achievements.zero_defect_master.target) {
            const newProgress = metrics.perfectRepairs;
            if (newProgress >= achievements.zero_defect_master.target) {
                set({
                    achievements: {
                        ...achievements,
                        zero_defect_master: { ...achievements.zero_defect_master, progress: newProgress }
                    },
                    stats: {
                        ...stats,
                        unlockedSkills: [...stats.unlockedSkills, 'perfectionist']
                    }
                });
                unlocked = true;
            }
        }

        if (unlocked) {
            // Save to cloud if authenticated
            get().saveProfile();
        }
    }
}));
