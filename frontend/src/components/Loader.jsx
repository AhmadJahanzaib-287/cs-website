import React from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  // 4 Quadrants (CS, SE, AI, IT)
  const quadrants = [
    { id: 'CS', initialX: -200, initialY: -200, clip: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)', moveAnim: 'loaderMoveCS' }, // Top-Left
    { id: 'SE', initialX: 200, initialY: -200, clip: 'polygon(50% 0, 100% 0, 100% 50%, 50% 50%)', moveAnim: 'loaderMoveSE' },  // Top-Right
    { id: 'AI', initialX: -200, initialY: 200, clip: 'polygon(0 50%, 50% 50%, 50% 100%, 0 100%)', moveAnim: 'loaderMoveAI' },  // Bottom-Left
    { id: 'IT', initialX: 200, initialY: 200, clip: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)', moveAnim: 'loaderMoveIT' }, // Bottom-Right
  ];

  return (
    <>
    <style>{`
      @keyframes loaderRingSpin {
        0%   { transform: rotate(0deg); }
        30%  { transform: rotate(360deg); }
        85%  { transform: rotate(360deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes loaderMoveCS {
        0%   { transform: translate(-200px, -200px) scale(0.3); }
        25%  { transform: translate(0px, 0px) scale(1); }
        85%  { transform: translate(0px, 0px) scale(1); }
        100% { transform: translate(-200px, -200px) scale(0.3); }
      }
      @keyframes loaderMoveSE {
        0%   { transform: translate(200px, -200px) scale(0.3); }
        25%  { transform: translate(0px, 0px) scale(1); }
        85%  { transform: translate(0px, 0px) scale(1); }
        100% { transform: translate(200px, -200px) scale(0.3); }
      }
      @keyframes loaderMoveAI {
        0%   { transform: translate(-200px, 200px) scale(0.3); }
        25%  { transform: translate(0px, 0px) scale(1); }
        85%  { transform: translate(0px, 0px) scale(1); }
        100% { transform: translate(-200px, 200px) scale(0.3); }
      }
      @keyframes loaderMoveIT {
        0%   { transform: translate(200px, 200px) scale(0.3); }
        25%  { transform: translate(0px, 0px) scale(1); }
        85%  { transform: translate(0px, 0px) scale(1); }
        100% { transform: translate(200px, 200px) scale(0.3); }
      }
      @keyframes loaderFade {
        0%   { opacity: 0; }
        25%  { opacity: 1; }
        96%  { opacity: 1; }
        100% { opacity: 0; }
      }
    `}</style>
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center z-10">
        
        {/* 1. Outer Ring: Rotates 360 deg during first 1.5s, then STAYS LOCKED straight for 2.5s */}
        <div
          style={{ animation: 'loaderRingSpin 5s ease-in-out infinite' }}
          className="absolute inset-0 rounded-full flex items-center justify-center z-0"
        >
          <img 
            src="/dcs-ring.png" 
            alt="DCS Ring" 
            className="w-full h-full object-contain rounded-full shadow-[0_0_35px_rgba(43,155,215,0.3)]"
          />
        </div>

        {/* 2. Inner Center Core: Increased size to 86% to eliminate all edge gaps */}
        <div className="absolute w-[101%] h-[101%] rounded-full z-10 flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full">
            {quadrants.map((item) => (
              <div
                key={item.id}
                style={{
                  clipPath: item.clip,
                  animation: `${item.moveAnim} 5s cubic-bezier(0.175,0.885,0.32,1.275) infinite, loaderFade 5s cubic-bezier(0.175,0.885,0.32,1) infinite`,
                }}
                className="absolute inset-0 w-full h-full"
              >
                <img 
                  src="/dcs-center.png" 
                  alt={item.id} 
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Subtitle */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center space-y-1 z-20"
      >
        <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
          DEPARTMENT OF COMPUTER SCIENCE
        </h3>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase animate-pulse">
          PARS • Loading Hub...
        </p>
      </motion.div>
    </div>
    </>
  );
}