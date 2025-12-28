'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const ParallaxBackground = React.memo(() => {
    const { scrollY } = useScroll()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const y1 = useTransform(scrollY, [0, 500], [0, 100])
    const y2 = useTransform(scrollY, [0, 500], [0, -80])
    const rotate = useTransform(scrollY, [0, 500], [0, 10])

    if (!mounted) return null

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Base Gradient - Optimized transition */}
            <div className="absolute inset-0 bg-gradient-to-br from-serenity-50 to-white dark:from-aurora-900 dark:to-black transition-colors duration-700" />

            {/* Aurora Effect - Reduced blur for potential perf gain */}
            <div className="absolute inset-0 opacity-30 dark:opacity-10 bg-aurora-gradient dark:bg-aurora-dark-gradient animate-aurora blur-xl will-change-[transform,opacity]" />

            {/* Floating Orbs - Optimized with will-change */}
            <motion.div
                style={{ y: y1, x: -50 }}
                className="absolute top-20 left-10 w-64 h-64 bg-pastel-mint/20 dark:bg-aurora-500/10 rounded-full blur-xl will-change-transform"
            />
            <motion.div
                style={{ y: y2, x: 50 }}
                className="absolute top-40 right-10 w-80 h-80 bg-pastel-violet/20 dark:bg-aurora-600/10 rounded-full blur-xl will-change-transform"
            />

            {/* Bottom Orb */}
            <motion.div
                style={{ rotate }}
                className="absolute -bottom-20 left-1/2 w-[400px] h-[400px] bg-pastel-blue/10 dark:bg-aurora-400/5 rounded-full blur-xl transform -translate-x-1/2 will-change-transform"
            />
        </div>
    )
})

ParallaxBackground.displayName = 'ParallaxBackground'

export default ParallaxBackground
