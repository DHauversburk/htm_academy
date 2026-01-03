import { useState } from 'react';
import { useGameStore } from '../game/store';
import { SKILL_TREE } from '../game/data/skills';
import { motion, AnimatePresence } from 'framer-motion';

interface CareerDashboardProps {
    onClose: () => void;
}

type TabType = 'skills' | 'achievements' | 'log' | 'stats';

export const CareerDashboard = ({ onClose }: CareerDashboardProps) => {
    const { stats, achievements, metrics, unlockSkill } = useGameStore();
    const [activeTab, setActiveTab] = useState<TabType>('skills');
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    const handleUnlockSkill = (skillId: string) => {
        const success = unlockSkill(skillId);
        if (success) {
            setSelectedSkill(null);
        }
    };

    const getSkillState = (skillId: string): 'locked' | 'available' | 'unlocked' => {
        if (stats.unlockedSkills.includes(skillId)) return 'unlocked';
        const skill = SKILL_TREE[skillId];
        if (!skill) return 'locked';

        const hasPrereqs = skill.prerequisites.every(p => stats.unlockedSkills.includes(p));
        const hasXP = stats.xp >= skill.costXP;

        if (hasPrereqs && hasXP && skill.costXP > 0) return 'available';
        return 'locked';
    };

    // Group skills by category
    const skillsByPath = {
        foundation: ['safety_101', 'basic_troubleshooting', 'customer_service'],
        technical: ['electronics_1', 'electronics_2', 'biomedical_specialization'],
        certification: ['cbet_candidate', 'cbet_certified'],
        efficiency: ['rapid_response', 'preventive_mastery', 'inventory_optimization', 'lean_principles'],
        social: ['active_listening', 'clinical_liaison', 'team_leadership'],
        business: ['budget_basics', 'cost_benefit_analysis', 'vendor_negotiation', 'capital_equipment_planning'],
        achievements: ['night_owl', 'mcgyver', 'peacemaker', 'perfectionist']
    };

    const pathColors = {
        foundation: 'from-slate-500 to-slate-700',
        technical: 'from-blue-500 to-blue-700',
        certification: 'from-purple-500 to-purple-700',
        efficiency: 'from-green-500 to-green-700',
        social: 'from-yellow-500 to-yellow-700',
        business: 'from-orange-500 to-orange-700',
        achievements: 'from-pink-500 to-pink-700'
    };

    const renderSkillNode = (skillId: string, pathType: keyof typeof skillsByPath) => {
        const skill = SKILL_TREE[skillId];
        if (!skill) return null;

        const state = getSkillState(skillId);
        const isSelected = selectedSkill === skillId;

        return (
            <motion.div
                key={skillId}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedSkill(skillId)}
                className={`
                    relative p-3 rounded-lg cursor-pointer border-2 transition-all
                    ${state === 'unlocked' ? `bg-gradient-to-br ${pathColors[pathType]} text-white border-transparent shadow-lg` : ''}
                    ${state === 'available' ? 'bg-white border-green-400 shadow-md' : ''}
                    ${state === 'locked' ? 'bg-gray-100 border-gray-300 opacity-60' : ''}
                    ${isSelected ? 'ring-4 ring-blue-400' : ''}
                `}
            >
                <div className="text-sm font-bold">{skill.name}</div>
                <div className="text-xs mt-1 opacity-90">
                    {skill.costXP === 0 ? '🏆 Achievement' : `${skill.costXP} XP`}
                </div>
                {state === 'unlocked' && (
                    <div className="absolute top-1 right-1 text-xs">✓</div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">Career Development</h1>
                            <p className="text-blue-100 mt-1">Professional Portfolio & Skill Progression</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-2xl font-bold px-3 py-1 rounded hover:bg-white/10 transition"
                        >
                            ×
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-6 grid grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                            <div className="text-xs text-blue-200">Level</div>
                            <div className="text-2xl font-bold">{stats.level}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                            <div className="text-xs text-blue-200">Available XP</div>
                            <div className="text-2xl font-bold">{stats.xp}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                            <div className="text-xs text-blue-200">Skills Unlocked</div>
                            <div className="text-2xl font-bold">{stats.unlockedSkills.length}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                            <div className="text-xs text-blue-200">Total Repairs</div>
                            <div className="text-2xl font-bold">{metrics.totalRepairs}</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-700 bg-slate-800/50">
                    {[
                        { id: 'skills', label: '🎓 Skill Tree' },
                        { id: 'achievements', label: '🏆 Achievements' },
                        { id: 'stats', label: '📊 Performance' },
                        { id: 'log', label: '📋 Career Log' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`
                                px-6 py-3 font-semibold transition-all
                                ${activeTab === tab.id
                                    ? 'text-white bg-slate-900 border-b-2 border-blue-500'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'skills' && (
                            <motion.div
                                key="skills"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {Object.entries(skillsByPath).map(([path, skillIds]) => (
                                    <div key={path}>
                                        <h3 className={`text-lg font-bold mb-3 bg-gradient-to-r ${pathColors[path as keyof typeof pathColors]} bg-clip-text text-transparent capitalize`}>
                                            {path} Path
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {skillIds.map(id => renderSkillNode(id, path as keyof typeof skillsByPath))}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'achievements' && (
                            <motion.div
                                key="achievements"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {Object.values(achievements).map(achievement => (
                                    <div key={achievement.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-white">{achievement.name}</h4>
                                                <p className="text-sm text-slate-400 mt-1">{achievement.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl">
                                                    {achievement.progress >= achievement.target ? '🏆' : '⏳'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>Progress</span>
                                                <span>{achievement.progress} / {achievement.target}</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'stats' && (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                {Object.entries(metrics).map(([key, value]) => (
                                    <div key={key} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                        <div className="text-xs text-slate-400 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div className="text-2xl font-bold text-white mt-1">
                                            {typeof value === 'number' ? value.toFixed(0) : value}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'log' && (
                            <motion.div
                                key="log"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center text-slate-400 py-12"
                            >
                                <div className="text-4xl mb-4">📋</div>
                                <p>Career log coming soon!</p>
                                <p className="text-sm mt-2">Your completed work orders will appear here.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Skill Detail Panel */}
                {selectedSkill && (
                    <div className="border-t border-slate-700 bg-slate-900 p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{SKILL_TREE[selectedSkill].name}</h3>
                                <p className="text-slate-300 mt-2">{SKILL_TREE[selectedSkill].description}</p>
                                <div className="mt-3 flex gap-4 text-sm">
                                    <span className="text-slate-400">
                                        Cost: <span className="text-white font-bold">{SKILL_TREE[selectedSkill].costXP} XP</span>
                                    </span>
                                    {SKILL_TREE[selectedSkill].prerequisites.length > 0 && (
                                        <span className="text-slate-400">
                                            Requires: {SKILL_TREE[selectedSkill].prerequisites.map(p => SKILL_TREE[p]?.name).join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {getSkillState(selectedSkill) === 'available' && (
                                    <button
                                        onClick={() => handleUnlockSkill(selectedSkill)}
                                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg shadow-lg transition"
                                    >
                                        Unlock Now
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedSkill(null)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
