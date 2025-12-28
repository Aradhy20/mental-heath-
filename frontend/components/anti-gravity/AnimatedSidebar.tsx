'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Smile,
    BookOpen,
    MessageCircle,
    Wind,
    BarChart2,
    Settings,
    User,
    Menu,
    X,
    LogOut,
    MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'
import { useAuthStore } from '@/lib/store/auth-store'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Smile, label: 'Mood Tracker', href: '/mood' },
    { icon: BookOpen, label: 'Journal', href: '/journal' },
    { icon: MessageCircle, label: 'AI Chat', href: '/chat' },
    { icon: Wind, label: 'Meditation', href: '/meditation' },
    { icon: BarChart2, label: 'Insights', href: '/insights' },
    { icon: MapPin, label: 'Specialists', href: '/specialists' },
]

const bottomItems = [
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: User, label: 'Profile', href: '/profile' },
]

const AnimatedSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    return (
        <motion.div
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="hidden md:flex flex-col h-screen sticky top-0 left-0 z-40 bg-white/80 dark:bg-black/40 backdrop-blur-md border-r border-white/20 dark:border-white/10 shadow-glass transition-all duration-300"
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-serenity-400 to-serenity-600 dark:from-aurora-500 dark:to-aurora-700 flex items-center justify-center text-white font-bold">
                                M
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight">MindfulAI</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    {isCollapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group',
                                    isActive
                                        ? 'bg-serenity-100 dark:bg-aurora-500/20 text-serenity-700 dark:text-aurora-300 shadow-sm'
                                        : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                                )}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <item.icon size={22} className={cn(isActive && 'text-serenity-600 dark:text-aurora-400')} />

                                <span className={cn(
                                    "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                )}>
                                    {item.label}
                                </span>

                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-serenity-500 dark:bg-aurora-400"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/20 dark:border-white/10 space-y-2">
                {bottomItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <motion.div
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors"
                            whileHover={{ x: 4 }}
                        >
                            <item.icon size={22} />
                            <span className={cn(
                                "font-medium transition-all duration-300",
                                isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                            )}>
                                {item.label}
                            </span>
                        </motion.div>
                    </Link>
                ))}

                <div className={cn("flex items-center gap-3 px-4 py-2", isCollapsed ? "justify-center" : "")}>
                    <ThemeToggle />
                    <span className={cn(
                        "text-sm font-medium text-muted-foreground transition-all duration-300",
                        isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                    )}>
                        Toggle Theme
                    </span>
                </div>

                <button
                    onClick={() => {
                        useAuthStore.getState().logout()
                        window.location.href = '/login'
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={22} />
                    <span className={cn(
                        "font-medium transition-all duration-300",
                        isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                    )}>
                        Sign Out
                    </span>
                </button>
            </div>
        </motion.div>
    )
}

export default AnimatedSidebar
