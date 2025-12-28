'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isMounted) {
            const publicPaths = ['/login', '/register']
            if (!isAuthenticated && !publicPaths.includes(pathname)) {
                router.push('/login')
            } else if (isAuthenticated && publicPaths.includes(pathname)) {
                router.push('/dashboard')
            }
        }
    }, [isAuthenticated, pathname, router, isMounted])

    // Prevent flash of content
    if (!isMounted) return null

    const publicPaths = ['/login', '/register']
    if (!isAuthenticated && !publicPaths.includes(pathname)) return null

    return <>{children}</>
}
