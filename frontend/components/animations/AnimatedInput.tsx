/**
 * Animated Input Component
 * Premium text input with floating label and validation animations
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'

interface BaseAnimatedProps {
    label: string
    error?: string
    success?: boolean
    helperText?: string
}

interface AnimatedInputProps extends BaseAnimatedProps, React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
}

export default function AnimatedInput({
    label,
    error,
    success,
    helperText,
    icon,
    className = "",
    ...props
}: AnimatedInputProps) {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(e.target.value.length > 0)
        props.onChange?.(e)
    }

    const isActive = isFocused || hasValue

    return (
        <div className={`relative ${className}`}>
            {/* Input Container */}
            <div className="relative">
                {/* Icon */}
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                )}

                {/* Input */}
                <motion.input
                    {...(() => {
                        const { onAnimationStart, onDragStart, onDragEnd, onDrag, ...rest } = props as any;
                        return rest;
                    })()}
                    className={`
            w-full px-4 py-3 rounded-xl border-2 transition-colors
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-500 focus:border-red-600' :
                            success ? 'border-green-500 focus:border-green-600' :
                                'border-gray-300 dark:border-gray-700 focus:border-serenity-500'}
            bg-white dark:bg-gray-900
            outline-none
          `}
                    onFocus={(e) => {
                        setIsFocused(true)
                        props.onFocus?.(e)
                    }}
                    onBlur={(e) => {
                        setIsFocused(false)
                        props.onBlur?.(e)
                    }}
                    onChange={handleChange}
                    animate={{
                        scale: isFocused ? 1.02 : 1
                    }}
                    transition={{ duration: 0.2 }}
                />

                {/* Floating Label */}
                <motion.label
                    className={`
            absolute left-4 pointer-events-none
            ${icon ? 'left-12' : ''}
            transition-colors
            ${error ? 'text-red-500' :
                            success ? 'text-green-500' :
                                isFocused ? 'text-serenity-600 dark:text-serenity-400' : 'text-muted-foreground'}
          `}
                    animate={{
                        y: isActive ? -32 : 0,
                        scale: isActive ? 0.85 : 1,
                        x: isActive ? (icon ? -32 : -4) : 0
                    }}
                    initial={false}
                    transition={{ duration: 0.2 }}
                >
                    {label}
                </motion.label>

                {/* Status Icon */}
                <AnimatePresence>
                    {(error || success) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            {error ? (
                                <AlertCircle className="text-red-500" size={20} />
                            ) : (
                                <Check className="text-green-500" size={20} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Helper Text / Error */}
            <AnimatePresence mode="wait">
                {(error || helperText) && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`mt-2 text-sm ${error ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                        {error || helperText}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Focus underline */}
            <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-serenity-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isFocused ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
            />
        </div>
    )
}

// Textarea variant
interface AnimatedTextareaProps extends BaseAnimatedProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export function AnimatedTextarea({
    label,
    error,
    success,
    helperText,
    className = "",
    ...props
}: AnimatedTextareaProps) {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setHasValue(e.target.value.length > 0)
        props.onChange?.(e)
    }

    const isActive = isFocused || hasValue

    return (
        <div className={`relative ${className}`}>
            <motion.textarea
                {...(() => {
                    const { onAnimationStart, onDragStart, onDragEnd, onDrag, ...rest } = props as any;
                    return rest;
                })()}
                className={`
          w-full px-4 py-3 rounded-xl border-2 transition-colors resize-none
          ${error ? 'border-red-500 focus:border-red-600' :
                        success ? 'border-green-500 focus:border-green-600' :
                            'border-gray-300 dark:border-gray-700 focus:border-serenity-500'}
          bg-white dark:bg-gray-900
          outline-none
        `}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={handleChange}
                rows={4}
            />

            <motion.label
                className={`
          absolute left-4 top-3 pointer-events-none
          transition-colors
          ${error ? 'text-red-500' :
                        success ? 'text-green-500' :
                            isFocused ? 'text-serenity-600' : 'text-muted-foreground'}
        `}
                animate={{
                    y: isActive ? -32 : 0,
                    scale: isActive ? 0.85 : 1,
                    x: isActive ? -4 : 0
                }}
            >
                {label}
            </motion.label>

            <AnimatePresence mode="wait">
                {(error || helperText) && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-2 text-sm ${error ? 'text-red-500' : 'text-muted-foreground'}`}
                    >
                        {error || helperText}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
