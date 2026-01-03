import React, { useEffect, useState } from 'react';
import { EventBus } from '../game/EventBus';
import type { InterruptionEvent, DialogOption } from '../game/types';
import { useGameStore } from '../game/store';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const InterruptionDialog = () => {
    const [event, setEvent] = useState<InterruptionEvent | null>(null);
    const { addWorkOrder, updateBudget } = useGameStore();

    useEffect(() => {
        const handleEvent = (incomingEvent: InterruptionEvent) => {
            setEvent(incomingEvent);
        };

        EventBus.on('interruption-triggered', handleEvent);
        return () => {
            EventBus.removeListener('interruption-triggered', handleEvent);
        };
    }, []);

    const handleOption = (option: DialogOption) => {
        if (!event) return;

        console.log(`Selected option: ${option.label} (${option.action})`);

        // Apply Budget Impact
        if (option.budgetImpact) {
            updateBudget(option.budgetImpact);
            const type = option.budgetImpact > 0 ? 'success' : 'error';
            // Show toast for money
            EventBus.emit('show-toast', {
                message: `Budget updated: ${option.budgetImpact > 0 ? '+' : ''}$${option.budgetImpact}`,
                type
            });
        }

        if (option.action === 'accept') {
            if (event.associatedTicket) {
                addWorkOrder(event.associatedTicket);
                // Emit event for App.tsx to show toast
                EventBus.emit('show-toast', { message: 'New Emergency Work Order Added!', type: 'error' });
            }
        }
        else if (option.action === 'defer') {
            if (event.associatedTicket) {
                // Deferring makes it routine priority
                const deferredTicket = { ...event.associatedTicket, priority: 'routine' as const };
                addWorkOrder(deferredTicket);
                EventBus.emit('show-toast', { message: 'Ticket added to backlog.', type: 'success' });
            }
        }

        // Close dialog
        setEvent(null);
    };

    if (!event) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-4 left-4 right-4 md:left-1/4 md:right-1/4 bg-slate-900/95 border border-slate-700 rounded-lg p-6 shadow-2xl text-white backdrop-blur-md z-50"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={clsx("px-2 py-0.5 text-xs font-bold rounded uppercase", {
                                'bg-red-500 text-white': event.urgency === 'critical',
                                'bg-orange-500 text-black': event.urgency === 'high',
                                'bg-yellow-500 text-black': event.urgency === 'medium',
                                'bg-blue-500 text-white': event.urgency === 'low',
                            })}>
                                {event.urgency}
                            </span>
                            <span className="text-slate-400 text-sm">{event.type === 'walk-in' ? 'Walk-in Request' : 'Incoming Call'}</span>
                        </div>
                        <h3 className="text-xl font-bold font-display">{event.title}</h3>
                        {event.npcName && <p className="text-blue-400 text-sm font-medium">{event.npcName} says:</p>}
                    </div>
                </div>

                <div className="mb-6 bg-slate-800/50 p-4 rounded border-l-4 border-blue-500">
                    <p className="text-lg italic">"{event.description}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {event.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOption(option)}
                            className={clsx("p-3 rounded text-left transition-all border", {
                                'hover:bg-green-900/40 border-slate-600 hover:border-green-500': option.action === 'accept',
                                'hover:bg-yellow-900/40 border-slate-600 hover:border-yellow-500': option.action === 'defer',
                                'hover:bg-red-900/40 border-slate-600 hover:border-red-500': option.action === 'refuse',
                            })}
                        >
                            <div className="font-bold">{option.label}</div>
                            {option.consequence && (
                                <div className="text-xs text-slate-400 mt-1">
                                    Effect: {option.consequence}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
