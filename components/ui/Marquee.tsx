import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export const Marquee = () => {
  const items = ["CONSTRUCTION", "LOGISTIQUE", "INVESTISSEMENT", "CONGO KEY", "INFRASTRUCTURES", "STANDARDS INTERNATIONAUX"];
  
  return (
    <div className="w-full bg-slate-900 border-y border-white/10 relative z-20 overflow-hidden py-6">
      <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
      <div className="flex whitespace-nowrap relative z-10">
        <motion.div
          className="flex gap-16 items-center"
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30
          }}
        >
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-16 group cursor-default">
              <span className="text-4xl md:text-6xl font-display font-bold text-transparent hover:text-yellow-500 transition-colors duration-500" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.2)' }}>
                {item}
              </span>
              <Plus className="w-6 h-6 text-yellow-500 opacity-50" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};