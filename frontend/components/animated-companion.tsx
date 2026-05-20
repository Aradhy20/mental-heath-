"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function AnimatedCompanion() {
  const [isBlinking, setIsBlinking] = useState(false)

  // Randomized Blinking Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, Math.random() * 4000 + 2000)

    return () => clearInterval(blinkInterval)
  }, [])

  return (
    <div className="relative w-64 h-64 flex items-center justify-center group">
      {/* ── Outer Neural Halo ── */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"
      />

      {/* ── Main Body Layer ── */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10"
        initial="initial"
        animate="animate"
      >
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Therapeutic Breathing Body ── */}
        <motion.path
          d="M100,40 C140,40 170,70 170,110 C170,150 140,180 100,180 C60,180 30,150 30,110 C30,70 60,40 100,40"
          fill="url(#bodyGradient)"
          filter="url(#glow)"
          animate={{
            d: [
              "M100,40 C140,40 170,70 170,110 C170,150 140,180 100,180 C60,180 30,150 30,110 C30,70 60,40 100,40",
              "M100,35 C145,35 175,75 175,115 C175,155 145,185 100,185 C55,185 25,155 25,115 C25,75 55,35 100,35",
              "M100,40 C140,40 170,70 170,110 C170,150 140,180 100,180 C60,180 30,150 30,110 C30,70 60,40 100,40"
            ]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* ── Floating Hands/Tendrils ── */}
        <motion.ellipse
          cx="45" cy="120" rx="10" ry="15"
          fill="var(--primary)"
          opacity="0.6"
          animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx="155" cy="120" rx="10" ry="15"
          fill="var(--primary)"
          opacity="0.6"
          animate={{ y: [0, -12, 0], x: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />

        {/* ── Expressive Eyes ── */}
        <g filter="url(#glow)">
          <motion.ellipse
            cx="80" cy="100" rx="4"
            ry={isBlinking ? 0.5 : 4}
            fill="white"
            initial={{ scale: 1 }}
            className="transition-all duration-150"
          />
          <motion.ellipse
            cx="120" cy="100" rx="4"
            ry={isBlinking ? 0.5 : 4}
            fill="white"
            initial={{ scale: 1 }}
            className="transition-all duration-150"
          />
        </g>

        {/* ── Gentle Smile ── */}
        <motion.path
          d="M85,125 Q100,135 115,125"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
          animate={{
            d: [
              "M85,125 Q100,135 115,125",
              "M85,127 Q100,138 115,127",
              "M85,125 Q100,135 115,125"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* ── Interactive Base Glow ── */}
      <motion.div 
        className="absolute bottom-10 w-24 h-4 bg-primary/30 blur-2xl rounded-full"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}
