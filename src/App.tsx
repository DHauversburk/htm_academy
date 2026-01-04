import { useRef, useState, useEffect } from 'react';
import { type IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

import { ProfileSetup } from './ui/ProfileSetup';
// import { WorkOrderList } from './ui/WorkOrderList'; // Replaced by WorkbenchTerminal
import { WorkbenchTerminal } from './ui/WorkbenchTerminal';
import { RepairMenu } from './ui/RepairMenu';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { MobileControls } from './ui/MobileControls';
import { TutorialOverlay } from './ui/TutorialOverlay';
import { FPSCounter } from './ui/FPSCounter';
import { SettingsPanel } from './ui/SettingsPanel';
import { autoSave } from './game/systems/AutoSaveSystem';
import { useGameStore } from './game/store';
import { GameDirector } from './game/systems/Director';
import { DEFECTS } from './game/data/scenarios/tutorial';
import { InterruptionDialog } from './ui/InterruptionDialog';
import { InventoryHUD } from './ui/InventoryHUD';
import { SupplyCabinet } from './ui/SupplyCabinet';
import { AIDirector } from './game/systems/AIDirector';
import { CareerDashboard } from './ui/CareerDashboard';

function App() {
  // Game Reference
  const phaserRef = useRef<IRefPhaserGame>(null);
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);
  const [isSupplyOpen, setIsSupplyOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [isRepairMenuOpen, setIsRepairMenuOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentWO, setCurrentWO] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isCareerDashboardOpen, setIsCareerDashboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Store
  const { isSetupComplete, setWorkOrders, setActiveOrder, difficulty, workOrders, removeWorkOrder, addWorkOrder } = useGameStore();

  useEffect(() => {
    // Start Auto-Save
    autoSave.start();

    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      autoSave.stop();
    };
  }, [toast]);

  useEffect(() => {
    // Listen for Work Order events from Phaser
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOpenWO = (data: any) => {
      // Legacy handler, might not be needed if using WorkbenchTerminal exclusively
      setCurrentWO(data);
      // setIsWorkOrderOpen(true);
    };

    const handleOpenWorkbench = () => {
      setIsWorkbenchOpen(true);
    };

    const handleStartTutorial = () => {
      setIsSetupOpen(false);

      // Start Orientation (Tutorial Mode)
      if (phaserRef.current?.scene) {
        const game = phaserRef.current.game;
        if (game) {
          game.scene.stop('StartScreen'); // Explicitly stop the start screen
          game.scene.start('BenchScene', { mode: 'tutorial' });
        }
      }
    };

    const handleTutorialComplete = async () => {
      // 1. Generate the Shift Context (AI Director)
      // Show loading toast?
      setToast({ message: "AIDirector: Generating Hospital Layout...", type: 'success' }); // Info type hacked as success for now

      try {
        const shiftData = await AIDirector.generateDailyContext(difficulty);

        // 2. Generate Work Orders (could also be AI driven, but using existing logic for now)
        const newOrders = GameDirector.generateShift(difficulty);
        setWorkOrders(newOrders);

        if (phaserRef.current?.scene) {
          const game = phaserRef.current.game;
          if (game) {
            game.scene.stop('BenchScene');
            game.scene.stop('StartScreen');
            game.scene.start('MainGame', { shift: shiftData });
          }
        }

        // Success! Close the setup wizard.
        setIsSetupOpen(false);

      } catch (err) {
        console.error("Shift Generation Failed", err);
        setToast({ message: "Network Error. Loading Offline Protocol...", type: 'error' });

        // Use Fallback Data immediately to prevent Black Screen
        const fallbackShift = AIDirector.getCurrentShift() || {
          scenarioTitle: "Backup System",
          mapConfig: { width: 128, height: 128, rooms: [] } // GridMapManager will fill this
        };

        if (phaserRef.current?.scene) {
          const game = phaserRef.current.game;
          if (game) {
            game.scene.stop('BenchScene');
            game.scene.stop('StartScreen');
            game.scene.start('MainGame', { shift: fallbackShift });
          }
        }

        // Ensure we remove the loading overlay even on failure
        setIsSetupOpen(false);
      }
    };

    const handleUiClosed = () => {
      setIsWorkOrderOpen(false);
      setActiveOrder(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleShowToast = (data: any) => {
      if (typeof data === 'string') {
        setToast({ message: data, type: 'success' });
      } else {
        setToast(data); // { message, type }
      }
    };

    const handleOpenSupply = () => {
      setIsSupplyOpen(true);
    };

    const handleOpenCareerDashboard = () => {
      setIsCareerDashboardOpen(true);
    };

    EventBus.on('open-work-order', handleOpenWO);
    EventBus.on('open-workbench', handleOpenWorkbench);
    EventBus.on('start-tutorial', handleStartTutorial);
    EventBus.on('tutorial-complete', handleTutorialComplete);
    EventBus.on('ui-closed', handleUiClosed);
    EventBus.on('start-repair', handleStartRepair);
    EventBus.on('open-repair-menu', handleOpenRepairMenu);
    EventBus.on('show-toast', handleShowToast);
    EventBus.on('open-supply-cabinet', handleOpenSupply);
    EventBus.on('open-career-dashboard', handleOpenCareerDashboard);

    return () => {
      EventBus.removeListener('open-work-order', handleOpenWO);
      EventBus.removeListener('open-workbench', handleOpenWorkbench);
      EventBus.removeListener('start-tutorial', handleStartTutorial);
      EventBus.removeListener('tutorial-complete', handleTutorialComplete);
      EventBus.removeListener('ui-closed', handleUiClosed);
      EventBus.removeListener('start-repair', handleStartRepair);
      EventBus.removeListener('open-repair-menu', handleOpenRepairMenu);
      EventBus.removeListener('show-toast', handleShowToast);
      EventBus.removeListener('open-supply-cabinet', handleOpenSupply);
    };
  }, [difficulty, setWorkOrders, setActiveOrder]);

  const closeWorkOrder = () => {
    setIsWorkOrderOpen(false);
    setActiveOrder(null);
    EventBus.emit('ui-closed');
  };

  const handleRepairComplete = (actionId: string) => {
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

      // Remove completed order
      removeWorkOrder(currentWO.id);
      setCurrentWO(null);

      // Add a new one to keep the list full
      const newOrder = GameDirector.generateSingleWorkOrder(difficulty, workOrders);
      addWorkOrder(newOrder);

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

      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-3">
        <img src="/knight_logo.png" alt="HTM Academy Logo" className="w-10 h-10 drop-shadow-md" />
        <div>
          <h1 className="text-white font-extrabold text-xl tracking-wide drop-shadow-md leading-none">HTM ACADEMY</h1>
          <p className="text-slate-300 text-xs font-mono tracking-wider drop-shadow-md mt-1">BIOMED SIMULATOR</p>
        </div>
      </div>

      {/* Profile Setup Wizard */}
      {isSetupOpen && <ProfileSetup />}

      {/* Work Order Queue (Only show active game) */}
      {/* Mobile Joystick */}
      {isSetupComplete && (
        <div className="lg:hidden block">
          <VirtualJoystick />
        </div>
      )}

      {/* Workbench Terminal */}
      {isWorkbenchOpen && (
        <WorkbenchTerminal onClose={() => setIsWorkbenchOpen(false)} />
      )}

      {/* Repair Menu */}
      {isRepairMenuOpen && (
        <RepairMenu
          onClose={() => setIsRepairMenuOpen(false)}
          onComplete={handleRepairComplete}
        />
      )}

      {/* Supply Cabinet */}
      {isSupplyOpen && <SupplyCabinet onClose={() => setIsSupplyOpen(false)} />}

      {/* Interruption Overlay */}
      <InterruptionDialog />

      {/* Inventory HUD (Bottom Left) */}
      {isSetupComplete && <InventoryHUD />}

      {/* Mobile Interact Button */}
      {isSetupComplete && <MobileControls />}

      {/* Tutorial Overlay */}
      {isSetupComplete && <TutorialOverlay />}

      {/* FPS Counter */}
      {isSetupComplete && <FPSCounter />}

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Settings Button (Top Left) */}
      {isSetupComplete && (
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="fixed top-4 left-4 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm p-3 rounded-lg border border-slate-600 transition-all z-50"
          title="Settings"
        >
          <span className="text-xl">⚙️</span>
        </button>
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

      {/* Career Dashboard */}
      {isCareerDashboardOpen && (
        <CareerDashboard onClose={() => setIsCareerDashboardOpen(false)} />
      )}

      {/* Version Badge */}
      {isSetupComplete && (
        <div className="fixed bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-slate-400 font-mono border border-slate-700">
          v0.2.2
        </div>
      )}
    </div>
  );
}

export default App;
