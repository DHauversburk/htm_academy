import { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

export function MobileControls() {
    const [showInteract, setShowInteract] = useState(false);
    const [interactTarget, setInteractTarget] = useState<string>('');

    useEffect(() => {
        const handleZoneEnter = (data: { name: string }) => {
            setShowInteract(true);
            setInteractTarget(data.name);
        };

        const handleZoneExit = () => {
            setShowInteract(false);
            setInteractTarget('');
        };

        EventBus.on('zone-enter', handleZoneEnter);
        EventBus.on('zone-exit', handleZoneExit);

        return () => {
            EventBus.removeListener('zone-enter', handleZoneEnter);
            EventBus.removeListener('zone-exit', handleZoneExit);
        };
    }, []);

    const handleInteract = () => {
        EventBus.emit('mobile-interact');
    };

    if (!showInteract) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50">
            <button
                onClick={handleInteract}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl transition-all transform active:scale-95"
                style={{
                    fontSize: '18px',
                    minWidth: '120px',
                    minHeight: '60px'
                }}
            >
                <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">👆</span>
                    <span>{interactTarget}</span>
                </div>
            </button>
        </div>
    );
}
