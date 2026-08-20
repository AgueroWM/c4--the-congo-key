import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Use type intersection instead of interface extension to ensure proper inheritance of all props
// (including className, onClick, type, etc.) from HTMLMotionProps<"button">.
export type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: 'primary' | 'glass' | 'outline';
  icon?: React.ElementType;
  children?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, icon: Icon, className = '', ...props }) => {
  const baseStyle = "px-7 py-3.5 rounded-md font-bold tracking-[0.12em] uppercase text-sm transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group";
  
  const variants = {
    primary: "bg-yellow-500 text-slate-950 hover:bg-yellow-400 border border-yellow-400 shadow-[0_16px_38px_rgba(234,179,8,0.18)]",
    glass: "glass-panel text-white hover:bg-white/10 hover:border-yellow-500/50 rounded-md",
    outline: "border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900"
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {Icon && <Icon className="w-4 h-4" />}
      </span>
    </motion.button>
  );
};
