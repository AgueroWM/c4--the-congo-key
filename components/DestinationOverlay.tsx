import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Anchor, Sun, Map, Building, Utensils, Plane } from 'lucide-react';
import { Button } from './ui/Button';
import { LogoC4 } from './ui/Logos';

interface DestinationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'business', label: 'Business Hub', icon: TrendingUp },
  { id: 'lifestyle', label: 'Lifestyle & Luxe', icon: Sun },
  { id: 'logistics', label: 'Logistique & Port', icon: Anchor },
];

export const DestinationOverlay: React.FC<DestinationOverlayProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('business');

  const content = {
    business: (
      <div className="space-y-8 pb-20 md:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-xl border-l-2 border-yellow-500">
            <h3 className="text-xl font-display text-white mb-2">Capitale Économique</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pointe-Noire génère la majorité du PIB hors pétrole du Congo. C'est le siège des majors pétrolières (Total, ENI) et le cœur battant de l'industrie.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-xl border-l-2 border-blue-500">
            <h3 className="text-xl font-display text-white mb-2">Zone Économique Spéciale</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Incitations fiscales massives pour les investisseurs étrangers. Exonérations douanières pour les matériaux de construction via nos partenaires.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-display text-yellow-500 mt-8 mb-4">Indicateurs de Croissance</h4>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-slate-900/50 p-2 md:p-4 rounded text-center">
            <div className="text-xl md:text-3xl font-display text-white mb-1">+5.2%</div>
            <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500">Croissance Hors-Pétrole</div>
          </div>
          <div className="bg-slate-900/50 p-2 md:p-4 rounded text-center">
            <div className="text-xl md:text-3xl font-display text-white mb-1">1.2M</div>
            <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500">Habitants</div>
          </div>
          <div className="bg-slate-900/50 p-2 md:p-4 rounded text-center">
            <div className="text-xl md:text-3xl font-display text-white mb-1">#1</div>
            <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500">Port Eau Profonde</div>
          </div>
        </div>
      </div>
    ),
    lifestyle: (
      <div className="space-y-8 pb-20 md:pb-0">
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1573059882260-26410467576f?q=80&w=1600&auto=format&fit=crop" 
            alt="Plage de Pointe-Noire" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <h3 className="text-xl md:text-2xl font-display text-white">La Côte Sauvage</h3>
            <p className="text-yellow-500 text-xs md:text-sm tracking-wider uppercase">Littoral stratégique d'Afrique Centrale</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="glass-panel p-4 rounded-lg flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
              <Utensils className="w-8 h-8 text-yellow-500" />
              <h4 className="font-bold text-white">Gastronomie</h4>
              <p className="text-xs text-slate-400">Restaurants internationaux et fruits de mer d'exception.</p>
           </div>
           <div className="glass-panel p-4 rounded-lg flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
              <Building className="w-8 h-8 text-yellow-500" />
              <h4 className="font-bold text-white">Immobilier Premium</h4>
              <p className="text-xs text-slate-400">Villas bord de mer et penthouses sécurisés.</p>
           </div>
           <div className="glass-panel p-4 rounded-lg flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
              <Plane className="w-8 h-8 text-yellow-500" />
              <h4 className="font-bold text-white">Connectivité</h4>
              <p className="text-xs text-slate-400">Aéroport international A. Neto à 15min du centre.</p>
           </div>
        </div>
      </div>
    ),
    logistics: (
      <div className="space-y-6 pb-20 md:pb-0">
         <div className="bg-slate-800 rounded-xl p-6 md:p-8 text-center border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <Anchor className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-display text-white mb-2">Port Autonome</h3>
            <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base">
              La seule porte d'entrée en eau profonde de la sous-région.
            </p>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 md:p-5 rounded-lg border-l border-yellow-500/30">
               <span className="block text-[10px] md:text-xs uppercase text-slate-500 mb-1">Temps de transit</span>
               <div className="text-lg md:text-xl font-display text-white">Direct Europe/Asie</div>
            </div>
            <div className="glass-panel p-4 md:p-5 rounded-lg border-l border-yellow-500/30">
               <span className="block text-[10px] md:text-xs uppercase text-slate-500 mb-1">Capacité</span>
               <div className="text-lg md:text-xl font-display text-white">Hub Transbordement</div>
            </div>
         </div>
         
         <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
            <Map className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
            <p className="text-sm text-yellow-200">
              <strong className="text-yellow-500 block mb-1">Avantage C4 :</strong>
              Alliance stratégique avec CMA CGM pour un passage prioritaire.
            </p>
         </div>
      </div>
    )
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-slate-900 border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90dvh] md:h-[600px]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2 text-slate-400 hover:text-white bg-black/40 rounded-full hover:bg-black/60 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Column: Sidebar / Navigation */}
            <div className="w-full md:w-1/3 bg-slate-950 border-b md:border-b-0 md:border-r border-white/5 flex flex-col relative shrink-0">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
               
               {/* Header Section */}
               <div className="p-6 pb-2 md:p-8 mt-4 md:mt-0">
                  <h2 className="text-2xl md:text-3xl font-display text-white mb-1">Pointe-Noire</h2>
                  <p className="text-yellow-500 uppercase tracking-widest text-xs font-bold">La Porte Océane</p>
               </div>
               
               {/* Navigation (Horizontal on mobile, Vertical on Desktop) */}
               <nav className="p-4 md:p-8 pt-0 md:pt-4 overflow-x-auto md:overflow-visible flex md:flex-col gap-2 md:space-y-2 no-scrollbar">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 p-3 md:p-4 rounded-lg transition-all duration-300 text-left group whitespace-nowrap md:whitespace-normal flex-shrink-0 ${
                          isActive 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-b-2 md:border-b-0 md:border-l-2 border-yellow-500 text-white' 
                            : 'bg-slate-900/50 md:bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-yellow-500' : 'text-slate-500 group-hover:text-white'}`} />
                        <span className="font-bold tracking-wide text-sm">{tab.label}</span>
                      </button>
                    );
                  })}
               </nav>

               {/* Footer of Sidebar (Hidden on mobile to save space) */}
               <div className="hidden md:block mt-auto p-8 pt-0">
                  <div className="pt-8 border-t border-white/10">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-900/80 p-2 ring-1 ring-white/10">
                           <LogoC4 className="h-full w-full" />
                        </div>
                        <div className="text-xs text-slate-400">
                           Votre partenaire local pour<br/>débloquer ces opportunités.
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Dynamic Content */}
            <div className="w-full md:w-2/3 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 flex-grow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-full flex flex-col"
                >
                  {content[activeTab as keyof typeof content]}

                  <div className="mt-auto pt-8 flex justify-center md:justify-end pb-20 md:pb-0">
                     <Button variant="outline" onClick={onClose} className="text-xs py-3 px-6 w-full md:w-auto">
                        Fermer
                     </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
