"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  Bell, 
  Moon, 
  Database, 
  CreditCard, 
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const sections = [
    { 
      title: "Account Profile", 
      icon: <User size={20} />, 
      items: ["Personal Information", "Email Preferences", "Digital Twin Identity"]
    },
    { 
      title: "Privacy & Security", 
      icon: <Shield size={20} />, 
      items: ["Encryption Keys", "Two-Factor Auth", "Session Management"]
    },
    { 
      title: "System & UI", 
      icon: <Database size={20} />, 
      items: ["Data Export (GDPR)", "AI Context Memory", "Biometric Thresholds"]
    },
    { 
      title: "Subscription", 
      icon: <CreditCard size={20} />, 
      items: ["Pro Tier (Active)", "Billing History", "Payment Methods"]
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground italic">Manage your emotional operating system and privacy.</p>
      </header>

      <div className="grid gap-6">
        <div className="glass p-8 rounded-[3rem] border border-black/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                 AJ
              </div>
              <div>
                 <h2 className="text-2xl font-bold">Aradhy Jain</h2>
                 <p className="text-sm text-primary font-bold">MindfulAI Pro Member</p>
                 <p className="text-xs text-muted-foreground mt-1">aradhy@example.com</p>
              </div>
           </div>
           <button className="px-6 py-2 bg-black/5 border border-black/5 rounded-xl font-bold text-xs hover:bg-black/10 transition-all">
              Edit Profile
           </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[3.5rem] border border-black/5 space-y-6"
            >
              <div className="flex items-center gap-3 text-primary">
                <div className="p-3 bg-primary/10 rounded-2xl">
                   {section.icon}
                </div>
                <h3 className="font-bold text-lg">{section.title}</h3>
              </div>
              
              <div className="space-y-1">
                {section.items.map((item, j) => (
                  <button key={j} className="w-full flex justify-between items-center p-3 hover:bg-black/5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all group">
                    {item}
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-8 border-t border-black/5 flex justify-between items-center">
           <div className="flex gap-4">
              <button className="text-xs font-bold text-muted-foreground hover:text-white transition-all flex items-center gap-2">
                 API Documentation <ExternalLink size={12} />
              </button>
              <button className="text-xs font-bold text-muted-foreground hover:text-white transition-all flex items-center gap-2">
                 Privacy Policy <ExternalLink size={12} />
              </button>
           </div>
           <button className="flex items-center gap-2 text-rose-400 font-bold text-xs bg-rose-500/10 px-6 py-3 rounded-2xl hover:bg-rose-500/20 transition-all">
              <LogOut size={14} /> Disconnect Session
           </button>
        </div>
      </div>
    </div>
  )
}
