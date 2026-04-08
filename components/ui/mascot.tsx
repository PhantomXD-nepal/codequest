"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const messages = [
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
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(Math.floor(Math.random() * messages.length));
      setShowMessage(true);
      
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    }, 15000); // Show a message every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-4 bg-white text-black px-4 py-3 rounded-2xl rounded-br-sm shadow-xl max-w-[200px] pointer-events-auto"
          >
            <p className="text-sm font-medium">{messages[messageIndex]}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 bg-[#39ff14] rounded-full flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(57,255,20,0.4)] border-4 border-black cursor-pointer pointer-events-auto"
        onClick={() => {
          setMessageIndex(Math.floor(Math.random() * messages.length));
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);
        }}
      >
        🦉
      </motion.div>
    </div>
  );
}
