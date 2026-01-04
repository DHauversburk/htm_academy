import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { CircuitCalibration } from './minigames/CircuitCalibration';

interface RepairMenuProps {
    onClose: () => void;
    onComplete: (actionId: string, notes: string) => void;
}

const REPAIR_ACTIONS = [
    { id: 'replace_cord', label: 'Replace Power Cord', icon: '🔌' },
    { id: 'replace_battery', label: 'Replace Battery', icon: '🔋' },
    { id: 'replace_display', label: 'Replace Display Assembly', icon: '🖥️' },
    { id: 'calibration', label: 'Perform Calibration', icon: '⚖️' },
    { id: 'clean_device', label: 'Clean & Decontaminate', icon: '✨' },
    { id: 'no_fault_found', label: 'No Fault Found (NFF)', icon: '🤷' },
];

export const RepairMenu = ({ onClose, onComplete }: RepairMenuProps) => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMinigame, setShowMinigame] = useState(false);

    const handleStartRepair = () => {
        if (!selectedAction) return;
        setShowMinigame(true);
    };

    const handleMinigameSuccess = () => {
        setShowMinigame(false);
        setIsSubmitting(true);
        // Add score bonuses here later
        setTimeout(() => {
            onComplete(selectedAction!, notes);
            setIsSubmitting(false);
        }, 500);
    };

    if (showMinigame) {
        return (
            <CircuitCalibration
                onSuccess={handleMinigameSuccess}
                onCancel={() => setShowMinigame(false)}
            />
        );
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-600 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 bg-slate-900 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Service Repair</h2>
                    <p className="text-slate-400 text-sm">Select action to begin repairs.</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Action Selection */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Corrective Action</label>
                        <div className="grid grid-cols-2 gap-3">
                            {REPAIR_ACTIONS.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => setSelectedAction(action.id)}
                                    className={clsx(
                                        "p-3 rounded-xl border text-left transition-all flex items-center space-x-2",
                                        selectedAction === action.id
                                            ? "bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                            : "bg-slate-700/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                                    )}
                                >
                                    <span className="text-xl">{action.icon}</span>
                                    <span className="text-sm font-medium leading-tight">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes Field */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Technician Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe your findings..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-600 resize-none h-24"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStartRepair}
                        disabled={!selectedAction || isSubmitting}
                        className={clsx(
                            "px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center space-x-2",
                            !selectedAction || isSubmitting
                                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-400 text-white hover:shadow-blue-500/25 active:scale-95"
                        )}
                    >
                        <span>Start Calibration</span>
                        <span>🔧</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
