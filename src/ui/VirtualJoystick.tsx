import { useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { EventBus } from '../game/EventBus';

export const VirtualJoystick = () => {
    const dragTargetRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleDrag = (_event: any, info: any) => {
        const rect = dragTargetRef.current.getBoundingClientRect();
        const offsetX = info.point.x - rect.left - rect.width / 2;
        const offsetY = info.point.y - rect.top - rect.height / 2;

        const maxDistance = 40; // Max distance the knob can move from center
        const distance = Math.min(Math.sqrt(offsetX * offsetX + offsetY * offsetY), maxDistance);
        const angle = Math.atan2(offsetY, offsetX);

        const newX = distance * Math.cos(angle);
        const newY = distance * Math.sin(angle);

        x.set(newX);
        y.set(newY);

        // Emit vector to Phaser
        EventBus.emit('joystick-move', { x: newX / maxDistance, y: newY / maxDistance, angle });
    };

    const handleDragEnd = () => {
        x.set(0);
        y.set(0);
        EventBus.emit('joystick-move', { x: 0, y: 0, angle: 0 });
    };

    return (
        <div className="joystick absolute bottom-12 left-12 z-50 w-32 h-32" ref={dragTargetRef}>
            {/* Base */}
            <div className="absolute inset-0 bg-slate-800/50 rounded-full border-2 border-slate-700/80" />

            {/* Knob */}
            <motion.div
                drag
                dragConstraints={dragTargetRef}
                dragElastic={0.2}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ x, y }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16"
            >
                <div className="w-full h-full bg-blue-500/80 rounded-full border-2 border-blue-400/90 shadow-lg cursor-pointer active:cursor-grabbing" />
            </motion.div>
        </div>
    );
};
