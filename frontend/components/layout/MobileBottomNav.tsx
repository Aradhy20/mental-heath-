'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Smile,
    BookOpen,
    MessageCircle,
    Wind
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { icon: LayoutDashboard, href: '/dashboard', label: 'Home' },
    { icon: Smile, href: '/mood', label: 'Mood' },
    { icon: BookOpen, href: '/journal', label: 'Journal' },
    { icon: MessageCircle, href: '/chat', label: 'Chat' },
    { icon: Wind, href: '/meditation', label: 'Zen' },
]

const MobileBottomNav = () => {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-float-hover p-2 flex justify-between items-center"
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link key={item.href} href={item.href} className="relative flex-1">
                            <motion.div
                                className={cn(
                                    "flex flex-col items-center justify-center py-2 rounded-2xl transition-colors",
                                    isActive ? "text-serenity-600 dark:text-aurora-400" : "text-muted-foreground hover:text-foreground"
                                )}
                                whileTap={{ scale: 0.9 }}
                            >
                                <div className="relative">
                                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobileNavIndicator"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current"
                                        />
                                    )}
                                </div>
                                <span className="text-[10px] font-medium mt-1">{item.label}</span>
                            </motion.div>
                        </Link>
                    )
                })}
            </motion.div>
        </div>
    )
}

export default MobileBottomNav
