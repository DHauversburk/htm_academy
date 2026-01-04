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
        <div className="fixed bottom-8 left-8 w-40 h-40 z-40 touch-none select-none md:w-32 md:h-32">
            <div
                ref={containerRef}
                className="w-full h-full rounded-full border-4 border-blue-500/30 bg-slate-900/60 backdrop-blur-md relative shadow-2xl"
                onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            >
                {/* Crosshair guides */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1 h-full bg-slate-600/20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-1 w-full bg-slate-600/20" />
                </div>

                {/* Knob */}
                <div
                    ref={knobRef}
                    className={`absolute w-16 h-16 md:w-12 md:h-12 rounded-full shadow-2xl pointer-events-none transition-all duration-75 ${active ? 'bg-blue-500 scale-110' : 'bg-blue-500/80 scale-100'
                        }`}
                    style={{
                        left: '50%',
                        top: '50%',
                        marginTop: '-2rem',
                        marginLeft: '-2rem',
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        border: '3px solid rgba(255, 255, 255, 0.3)'
                    }}
                />
            </div>
        </div>
    );
};
