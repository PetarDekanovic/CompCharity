import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo: React.FC<LogoProps> = ({ className = "", showText = true, size = "md" }) => {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg" },
    md: { icon: "w-10 h-10", text: "text-2xl" },
    lg: { icon: "w-16 h-16", text: "text-4xl" },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizes[size].icon} flex items-center justify-center`}>
        {/* Custom SVG Logo inspired by the provided image */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Glow */}
          <circle cx="50" cy="50" r="40" fill="url(#glowGradient)" opacity="0.3" />
          
          <defs>
            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>

          {/* Hands */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M20 80C20 80 15 70 10 60C5 50 10 40 20 45C30 50 35 65 35 75"
            stroke="url(#handGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            d="M80 80C80 80 85 70 90 60C95 50 90 40 80 45C70 50 65 65 65 75"
            stroke="url(#handGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Laptop */}
          <motion.rect
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            x="30"
            y="40"
            width="40"
            height="30"
            rx="3"
            stroke="#2563EB"
            strokeWidth="4"
            fill="white"
          />
          <motion.path
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            d="M25 70H75L82 78H18L25 70Z"
            fill="#1D4ED8"
          />
          
          {/* Heart */}
          <motion.path
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 1.2 }}
            d="M50 62C50 62 42 55 42 51C42 48 44 46 47 46C49 46 50 48 50 48C50 48 51 46 53 46C56 46 58 48 58 51C58 55 50 62 50 62Z"
            fill="#EF4444"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-black tracking-tighter text-gray-900 ${sizes[size].text}`}>
          Comp<span className="text-blue-600">Charity</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
