'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { IconButton, Tooltip, alpha } from '@mui/material'
import { DarkMode as MoonIcon, LightMode as SunIcon } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <IconButton size="small" sx={{ borderRadius: 4, bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03) }}>
        <div className="w-5 h-5" />
      </IconButton>
    )
  }

  const isDark = theme === 'dark'

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton 
        size="small"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        sx={{ 
          borderRadius: 4, 
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
          color: isDark ? '#FBBF24' : '#6366F1',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.08),
            transform: 'rotate(12deg) scale(1.1)'
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isDark ? <MoonIcon fontSize="small" /> : <SunIcon fontSize="small" />}
          </motion.div>
        </AnimatePresence>
      </IconButton>
    </Tooltip>
  )
}
