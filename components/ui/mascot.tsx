"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Owl } from '@/components/ui/owl';

const defaultMessages = [
  "Keep up the great work! 🚀",
  "Remember to take breaks! ☕",
  "You're learning so fast! 🧠",
  "Don't forget to check your streak! 🔥",
  "Coding is like magic! ✨",
  "Every bug is a learning opportunity! 🐛",
  "You're a coding wizard! 🧙‍♂️"
];

export function Mascot() {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [owlState, setOwlState] = useState<'idle' | 'talking' | 'happy' | 'sad'>('idle');

  useEffect(() => {
    const handleCustomMessage = (e: CustomEvent) => {
      setMessage(e.detail.message);
      setOwlState(e.detail.state || 'talking');
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        setOwlState('idle');
      }, 6000);
    };

    window.addEventListener('mascot-message', handleCustomMessage as EventListener);

    const interval = setInterval(() => {
      if (!showMessage) {
        setMessage(defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
        setOwlState('talking');
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
          setOwlState('idle');
        }, 5000);
      }
    }, 30000); // Show a message every 30 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('mascot-message', handleCustomMessage as EventListener);
    };
  }, [showMessage]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-4 bg-[#1a1a1a] border-2 border-[#39ff14] text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[200px] pointer-events-auto"
          >
            <p className="text-[10px] font-pixel leading-relaxed">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-24 h-24 cursor-pointer pointer-events-auto"
        onClick={() => {
          setMessage(defaultMessages[Math.floor(Math.random() * defaultMessages.length)]);
          setOwlState('happy');
          setShowMessage(true);
          setTimeout(() => {
            setShowMessage(false);
            setOwlState('idle');
          }, 5000);
        }}
      >
        <Owl state={owlState} />
      </motion.div>
    </div>
  );
}
