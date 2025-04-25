"use client"

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

type Particle = {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

export default function FloatingParticles() {
  // Use useRef to store particles and mount state
  // This prevents re-renders and infinite update loops
  const particlesRef = useRef<Particle[]>([]);
  const isMountedRef = useRef(false);
  
  // Create particles only once when component mounts
  useEffect(() => {
    // Prevent multiple executions
    if (isMountedRef.current) return;
    
    // Mark as mounted
    isMountedRef.current = true;
    
    // Only create particles once
    if (particlesRef.current.length === 0) {
      const newParticles = Array.from({ length: 15 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 15 + 5,
        color: Math.random() > 0.5 ? 'shopify-green' : 'blue',
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5
      }));
      
      // Set to ref without triggering re-render
      particlesRef.current = newParticles;
    }
    
    // No cleanup needed since we're using refs
  }, []); // Empty dependency array ensures this runs only once

  // No conditional rendering based on state to avoid re-renders
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particlesRef.current.map((particle, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full opacity-10 bg-${particle.color}`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}