import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';

export const WhatsAppButton = () => {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const phoneNumber = rawNumber.replace(/\D/g, '');
  if (!phoneNumber) return null;

  const message = encodeURIComponent("Bonjour C4, je souhaite discuter d'un projet.");
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Congo Key"
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[90] flex items-center gap-3 rounded-full border border-emerald-300/30 bg-emerald-500/95 px-4 py-3 text-slate-950 shadow-[0_16px_40px_rgba(16,185,129,0.28)] backdrop-blur transition-all hover:bg-emerald-400 hover:shadow-[0_20px_50px_rgba(16,185,129,0.35)]"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 180, damping: 16 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
        <MessageCircle className="h-5 w-5" />
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-950/70">Contact</span>
        <span className="text-sm font-extrabold text-slate-950">Discuter du projet</span>
      </span>
      <Send className="hidden h-4 w-4 sm:block" />
    </motion.a>
  );
};
