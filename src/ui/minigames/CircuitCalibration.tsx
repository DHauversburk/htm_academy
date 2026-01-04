import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CircuitCalibrationProps {
    onSuccess: (score: number) => void;
    onCancel: () => void;
}

interface Node {
    id: number;
    status: 'pending' | 'calibrating' | 'success' | 'fail';
    value: number; // 0-100
    target: number; // Random 70-90
    speed: number;
}

// --- Constants ---
const SUCCESS_MARGIN = 10; // e.g., target is 80, success is 70-90
const TARGET_ZONE_WIDTH = SUCCESS_MARGIN * 2;

const INITIAL_NODES: Node[] = [
    { id: 1, status: 'pending', value: 0, target: 80, speed: 1.5 },
    { id: 2, status: 'pending', value: 0, target: 75, speed: 2.0 },
    { id: 3, status: 'pending', value: 0, target: 85, speed: 2.5 },
];
// ---

export function CircuitCalibration({ onSuccess, onCancel }: CircuitCalibrationProps) {
    const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
    const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
    const requestRef = useRef<number>();

    // Game Loop
    useEffect(() => {
        const animate = () => {
            if (activeNodeId) {
                setNodes(prev => prev.map(node => {
                    if (node.id === activeNodeId && node.status === 'calibrating') {
                        let newValue = node.value + node.speed;
                        if (newValue > 100) {
                            newValue = 0; // Wrap around or bounce? Wrap for now
                        }
                        return { ...node, value: newValue };
                    }
                    return node;
                }));
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [activeNodeId]);

    // Win Condition Check
    useEffect(() => {
        const allSuccessful = nodes.every(node => node.status === 'success');
        if (allSuccessful) {
            // Add a small delay to allow the final "LOCKED" state to be visible
            setTimeout(() => onSuccess(100), 500);
        }
    }, [nodes, onSuccess]);

    const handleNodeClick = (id: number) => {
        const node = nodes.find(n => n.id === id);
        if (!node) return;

        // If a node is already active, only allow interaction with that specific node.
        if (activeNodeId && activeNodeId !== id) {
            return;
        }

        if (node.status === 'pending') {
            // Start calibrating
            setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'calibrating' } : n));
            setActiveNodeId(id);
        } else if (node.status === 'calibrating') {
            // Stop and Check
            const diff = Math.abs(node.value - node.target);
            const isSuccess = diff < SUCCESS_MARGIN;

            setNodes(prev => prev.map(n => n.id === id ? { ...n, status: isSuccess ? 'success' : 'fail' } : n));
            setActiveNodeId(null);
        } else if (node.status === 'fail') {
            // Retry
            setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'calibrating', value: 0 } : n));
            setActiveNodeId(id);
        }
    };

    return (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900 flex flex-col items-center justify-center p-6 z-50">
            <h2 className="text-white font-bold text-xl mb-8 tracking-widest uppercase">
                Circuit Calibration
            </h2>

            <div className="w-full max-w-sm space-y-6">
                {nodes.map(node => (
                    <div key={node.id} className="relative">
                        {/* Target Zone Indicator */}
                        <div
                            className="absolute h-8 bg-green-500/20 border-x-2 border-green-400/50 rounded pointer-events-none z-0"
                            style={{
                                left: `${node.target - SUCCESS_MARGIN}%`,
                                width: `${TARGET_ZONE_WIDTH}%`,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: '120%'
                            }}
                        />

                        {/* Progress Bar Track */}
                        <div
                            className="h-12 bg-slate-800 rounded-xl overflow-hidden cursor-pointer relative border-2 border-slate-700 active:scale-95 transition-transform"
                            onClick={() => handleNodeClick(node.id)}
                        >
                            {/* Fill */}
                            <div
                                className={`h-full transition-none ${node.status === 'success' ? 'bg-green-500' :
                                        node.status === 'fail' ? 'bg-red-500' :
                                            'bg-blue-500'
                                    }`}
                                style={{ width: `${node.value}%` }}
                            />

                            {/* Label Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="font-mono font-bold text-white drop-shadow-md">
                                    {node.status === 'pending' && "TAP TO START"}
                                    {node.status === 'calibrating' && `${Math.round(node.value)}%`}
                                    {node.status === 'success' && "LOCKED"}
                                    {node.status === 'fail' && "RETRY"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onCancel}
                className="mt-12 text-slate-500 underline hover:text-white"
            >
                Cancel Repair
            </button>
        </div>
    );
}
