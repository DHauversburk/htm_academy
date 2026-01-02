import { useRef, useState, useEffect } from 'react';
import { type IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

import { ProfileSetup } from './ui/ProfileSetup';
import { WorkOrderList } from './ui/WorkOrderList';
import { RepairMenu } from './ui/RepairMenu';
import { useGameStore } from './game/store';
import { GameDirector } from './game/systems/Director';
import { DEFECTS } from './game/data/scenarios/tutorial';

function App() {
  // Game Reference
  const phaserRef = useRef<IRefPhaserGame>(null);
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isRepairMenuOpen, setIsRepairMenuOpen] = useState(false);
  const [currentWO, setCurrentWO] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Store
  const { isSetupComplete, setWorkOrders, setActiveOrder, difficulty, workOrders } = useGameStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    // Listen for Work Order events from Phaser
    const handleOpenWO = (data: any) => {
      setCurrentWO(data);
      setIsWorkOrderOpen(true);
      setActiveOrder(data.id);
    };

    const handleStartSetup = () => {
      setIsSetupOpen(true);
    }

    const handleStartTutorial = () => {
      setIsSetupOpen(false);

      // Start Orientation (Tutorial Mode)
      if (phaserRef.current?.scene) {
        const game = phaserRef.current.game;
        if (game) {
          game.scene.start('BenchScene', { mode: 'tutorial' });
        }
      }
    };

    const handleTutorialComplete = () => {
      // Now we really start the game
      // Generate the Shift based on difficulty!
      const newOrders = GameDirector.generateShift(difficulty);
      setWorkOrders(newOrders);

      if (phaserRef.current?.scene) {
        const game = phaserRef.current.game;
        if (game) {
          game.scene.start('MainGame');
        }
      }
    };

    const handleUiClosed = () => {
      setIsWorkOrderOpen(false);
      setActiveOrder(null);
    };

    const handleStartRepair = (data: any) => {
      // Close UI overlays
      setIsWorkOrderOpen(false);
      setCurrentWO(data.details); // Ensure we have the latest details

      // Tell Phaser to Start Bench Scene
      if (phaserRef.current?.scene) {
        const game = phaserRef.current.game;
        if (game) {
          game.scene.stop('MainGame');
          game.scene.start('BenchScene', { ...data, mode: 'repair' });
        }
      }
    };

    const handleOpenRepairMenu = () => {
      setIsRepairMenuOpen(true);
    };

    EventBus.on('open-work-order', handleOpenWO);
    EventBus.on('start-setup', handleStartSetup);
    EventBus.on('start-tutorial', handleStartTutorial);
    EventBus.on('tutorial-complete', handleTutorialComplete);
    EventBus.on('ui-closed', handleUiClosed);
    EventBus.on('start-repair', handleStartRepair);
    EventBus.on('open-repair-menu', handleOpenRepairMenu);

    return () => {
      EventBus.removeListener('open-work-order', handleOpenWO);
      EventBus.removeListener('start-setup', handleStartSetup);
      EventBus.removeListener('start-tutorial', handleStartTutorial);
      EventBus.removeListener('tutorial-complete', handleTutorialComplete);
      EventBus.removeListener('ui-closed', handleUiClosed);
      EventBus.removeListener('start-repair', handleStartRepair);
      EventBus.removeListener('open-repair-menu', handleOpenRepairMenu);
    };
  }, [difficulty, setWorkOrders, setActiveOrder]);

  const closeWorkOrder = () => {
    setIsWorkOrderOpen(false);
    setActiveOrder(null);
    EventBus.emit('ui-closed');
  };

  const handleRepairComplete = (actionId: string, _notes: string) => {
    setIsRepairMenuOpen(false);

    if (!currentWO) return;

    // Validation Logic
    const defect = DEFECTS[currentWO.actualDefectId];
    if (!defect) {
      console.error("Defect not found:", currentWO.actualDefectId);
      return;
    }

    if (actionId === defect.fixAction) {
      // SUCCESS
      setToast({ message: 'Repair Successful! Ticket Closed.', type: 'success' });

      // Remove order from list
      const remainingOrders = workOrders.filter(o => o.id !== currentWO.id);
      setWorkOrders(remainingOrders);
      setCurrentWO(null);

      // Return to Workshop
      if (phaserRef.current?.scene) {
        const game = phaserRef.current.game;
        if (game) {
          game.scene.stop('BenchScene');
          game.scene.start('MainGame');
        }
      }
    } else {
      // FAILURE
      setToast({ message: 'Incorrect Repair Action! Issue Persists.', type: 'error' });
    }
  };

  return (
    <div id="app" className="relative w-full h-full overflow-hidden">
      <PhaserGame ref={phaserRef} />

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-white font-bold text-xl drop-shadow-md">HTM Academy</h1>
        <p className="text-slate-300 text-sm drop-shadow-md">Biomed Simulator</p>
      </div>

      {/* Profile Setup Wizard */}
      {isSetupOpen && <ProfileSetup />}

      {/* Work Order Queue (Only show active game) */}
      {isSetupComplete && !isWorkOrderOpen && !isRepairMenuOpen && <WorkOrderList />}

      {/* Repair Menu */}
      {isRepairMenuOpen && (
        <RepairMenu
          onClose={() => setIsRepairMenuOpen(false)}
          onComplete={handleRepairComplete}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={clsx(
              "absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[100] font-bold text-white pointer-events-none",
              toast.type === 'success' ? "bg-green-500" : "bg-red-500"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Layer */}
      <AnimatePresence>
        {isWorkOrderOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeWorkOrder} // Click outside to close
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent close on modal click
            >
              {/* Header */}
              <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-white font-semibold text-lg">Work Order #{currentWO?.id}</h2>
                <button onClick={closeWorkOrder} className="text-slate-400 hover:text-white transition-colors">
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Device</span>
                  <p className="text-lg text-slate-100 font-medium">{currentWO?.type}</p>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Reported Issue</span>
                  <p className="text-slate-200">{currentWO?.issue}</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                    Start Diagnostics
                  </button>
                  <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-all">
                    Docs
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
