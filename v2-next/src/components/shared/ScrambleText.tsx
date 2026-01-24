
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  hover?: boolean; // If true, only scrambles on hover
}

export function ScrambleText({ text, className = '', delay = 0, hover = false }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(hover ? text : '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const intervalRef = useRef<number | null>(null);

  const startScramble = () => {
    let iteration = 0;
    
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText((prev) => 
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / 3; // Speed control
    }, 30);
  };

  useEffect(() => {
    if (!hover) {
      const timer = setTimeout(() => {
        startScramble();
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [text, delay, hover]);

  return (
    <motion.span 
      className={className}
      onHoverStart={() => hover && startScramble()}
      initial={{ opacity: hover ? 1 : 0 }}
      animate={{ opacity: 1 }}
    >
      {displayText}
    </motion.span>
  );
}
