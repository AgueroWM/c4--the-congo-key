import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoC4 } from './Logos';

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(onComplete, 250);
    }, 650);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="w-32 h-32 flex items-center justify-center mb-6 relative"
            >
              {/* Effet de lueur derrière le logo */}
              <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
              
              {/* IMAGE LOGO */}
              <LogoC4 className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              
            </motion.div>
            
            {/* Loading Bar */}
            <div className="absolute -bottom-8 left-0 w-full h-1 bg-slate-800 overflow-hidden">
                <motion.div 
                    className="h-full bg-yellow-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.55, ease: "easeInOut" }}
                />
            </div>
          </div>

          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="mt-12 text-center"
          >
              <h2 className="text-white font-display text-xl tracking-[0.2em] mb-2">CONGO KEY</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Initialisation de l'expérience</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
