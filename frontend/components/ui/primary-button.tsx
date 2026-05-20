import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function PrimaryButton({ className, children, loading, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "bg-primary text-primary-foreground font-black px-6 py-4 rounded-[2rem] hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={20} />}
      {children}
    </button>
  )
}
