import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { Phone, Mail, User } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming a utility file for merging tailwind classes

const iconMap = {
  phone: <Phone className="h-6 w-6 text-blue-500" />,
  email: <Mail className="h-6 w-6 text-red-500" />,
  person: <User className="h-6 w-6 text-green-500" />,
};

export function InterruptionModal() {
  const activeInterruption = useGameStore((state) => state.activeInterruption);
  const dismissInterruption = useGameStore((state) => state.dismissInterruption);

  const handleChoice = (action: string) => {
    console.log(`Player chose: ${action}`);
    // Future implementation will handle the consequences of the choice
    dismissInterruption();
  };

  const isOpen = activeInterruption !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md rounded-lg bg-gray-800 p-6 text-white shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {iconMap[activeInterruption.type]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{activeInterruption.title}</h2>
                <p className="text-sm text-gray-400">
                  From: {activeInterruption.sender}
                </p>
                <p className="mt-4 text-gray-300">
                  {activeInterruption.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              {activeInterruption.choices.map((choice) => (
                <button
                  key={choice.action}
                  onClick={() => handleChoice(choice.action)}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-semibold',
                    'transition-colors duration-200',
                    {
                      'bg-blue-600 hover:bg-blue-700': choice.action.includes('accept') || choice.action.includes('agree') || choice.action.includes('read'),
                      'bg-gray-600 hover:bg-gray-700': choice.action.includes('ignore') || choice.action.includes('dismiss') || choice.action.includes('delete'),
                    }
                  )}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
