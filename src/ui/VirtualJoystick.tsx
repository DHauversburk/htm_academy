import { useRef, useEffect, useState } from 'react';
import { EventBus } from '../game/EventBus';

export const VirtualJoystick = () => {
    const knobRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleEnd = () => {
            setActive(false);
            setPosition({ x: 0, y: 0 });
            EventBus.emit('joystick-move', { x: 0, y: 0 });
        };

        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, []);

    const handleStart = (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        setActive(true);
        updatePosition(clientX, clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!active || !containerRef.current) return;
        updatePosition(clientX, clientY);
    };

    const updatePosition = (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const maxRadius = rect.width / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxRadius) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxRadius;
            dy = Math.sin(angle) * maxRadius;
        }

        setPosition({ x: dx, y: dy });

        // Normalize for game input (-1 to 1)
        EventBus.emit('joystick-move', {
            x: dx / maxRadius,
            y: dy / maxRadius
        });
    };

    return (
        <div className="fixed bottom-8 left-8 w-32 h-32 z-40 touch-none select-none">
            <div
                ref={containerRef}
                className="w-full h-full rounded-full border-2 border-slate-500/30 bg-slate-900/40 backdrop-blur-sm relative"
                onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            >
                <div
                    ref={knobRef}
                    className="absolute w-12 h-12 bg-blue-500/80 rounded-full shadow-lg pointer-events-none transition-transform duration-75"
                    style={{
                        left: '50%',
                        top: '50%',
                        marginTop: '-1.5rem',
                        marginLeft: '-1.5rem',
                        transform: `translate(${position.x}px, ${position.y}px)`
                    }}
                />
            </div>
        </div>
    );
};
