import { useState, useEffect, useRef } from 'react';

interface CircuitCalibrationProps {
    onSuccess: (score: number) => void;
    onCancel: () => void;
}

interface Node {
    id: number;
    status: 'pending' | 'calibrating' | 'success';
    value: number; // 0-100
    target: number; // Random 70-90
    speed: number;
}

const generateNodes = (): Node[] => {
    const createNode = (id: number, minSpeed: number, maxSpeed: number): Node => ({
        id,
        status: 'pending',
        value: 0,
        target: Math.floor(Math.random() * 31) + 60, // Target between 60 and 90
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
    });

    return [
        createNode(1, 1.2, 1.8),
        createNode(2, 1.7, 2.4),
        createNode(3, 2.2, 2.9),
    ];
};

export function CircuitCalibration({ onSuccess, onCancel }: CircuitCalibrationProps) {
    const [nodes, setNodes] = useState<Node[]>(generateNodes());
    const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
    const requestRef = useRef<number>(0);

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

    const handleNodeClick = (id: number) => {
        const node = nodes.find(n => n.id === id);
        if (!node) return;

        if (node.status === 'pending') {
            // Start calibrating
            setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'calibrating' } : n));
            setActiveNodeId(id);
        } else if (node.status === 'calibrating') {
            // Stop and Check
            setActiveNodeId(null);
            const diff = Math.abs(node.value - node.target);
            const isSuccess = diff < 10; // 10% margin

            if (isSuccess) {
                const newNodes = nodes.map(n => (n.id === id ? { ...n, status: 'success' as const } : n));
                setNodes(newNodes);

                if (newNodes.every(n => n.status === 'success')) {
                    setTimeout(() => onSuccess(100), 500);
                }
            } else {
                // Failure, reset all nodes
                setNodes(generateNodes());
            }
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
                                left: `${node.target - 10}%`,
                                width: '20%',
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
                                className={`h-full transition-none ${node.status === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${node.value}%` }}
                            />

                            {/* Label Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="font-mono font-bold text-white drop-shadow-md">
                                    {node.status === 'pending' && "TAP TO START"}
                                    {node.status === 'calibrating' && `${Math.round(node.value)}%`}
                                    {node.status === 'success' && "LOCKED"}
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
