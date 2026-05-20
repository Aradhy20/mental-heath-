"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Activity, 
  Database, 
  ShieldAlert, 
  MoreHorizontal, 
  ArrowUpRight, 
  Search,
  Settings
} from 'lucide-react'

const SYSTEM_STATS = [
  { label: 'Active Users', value: '1,284', trend: '+12%', icon: Users, color: 'text-blue-400' },
  { label: 'Inference Success', value: '99.8%', trend: '+0.2%', icon: Activity, color: 'text-emerald-400' },
  { label: 'Memory Storage', value: '42.5 GB', trend: '+5GB', icon: Database, color: 'text-violet-400' },
  { label: 'Risk Flags', value: '14', trend: '-2', icon: ShieldAlert, color: 'text-rose-400' }
]

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
       <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">System <span className="text-primary italic">Manifest</span></h1>
          <p className="text-muted-foreground">Admin infrastructure & health diagnostics.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 glass rounded-xl text-sm font-semibold flex items-center gap-2">
            <Settings size={18} /> Global Config
          </button>
          <button className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
            System Reboot
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {SYSTEM_STATS.map((stat, i) => (
          <div key={i} className="p-6 glass rounded-3xl border border-black/5">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-black/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} px-2 py-1 bg-black/5 rounded-full`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Table */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] border border-black/5 overflow-hidden">
          <header className="p-8 border-b border-black/5 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Users size={20} /> User Registry</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                placeholder="Search UID..." 
                className="bg-black/5 border border-black/5 rounded-xl pl-10 pr-4 py-2 text-xs outline-none"
              />
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-zinc-950/40">
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Tier</th>
                  <th className="px-8 py-4">Risk Level</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Aradhy Jain', email: 'aradhy@example.com', status: 'Online', tier: 'Ultra', risk: 'Low' },
                  { name: 'John Doe', email: 'john@clinical.ai', status: 'Active', tier: 'Premium', risk: 'Moderate' },
                  { name: 'Jane Smith', email: 'jane@health.org', status: 'Inactive', tier: 'Free', risk: 'Low' },
                  { name: 'User_992', email: 'masked_992@temp.ai', status: 'Online', tier: 'Premium', risk: 'High' }
                ].map((user, i) => (
                  <tr key={i} className="border-b border-black/5 hover:bg-black/5 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{user.name[0]}</div>
                         <div>
                            <p className="font-bold">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{user.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Online' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        <span className="text-xs">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold">{user.tier}</td>
                    <td className="px-8 py-4">
                       <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                         user.risk === 'Low' ? 'border-emerald-500/20 text-emerald-400' : 
                         user.risk === 'Moderate' ? 'border-amber-500/20 text-amber-400' : 'border-rose-500/20 text-rose-400 bg-rose-500/10'
                       }`}>
                         {user.risk}
                       </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                       <button className="p-2 text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs */}
        <div className="p-8 glass rounded-[2.5rem] border border-black/5 space-y-8">
           <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><ArrowUpRight size={20} /> Inference Logs</h3>
            <span className="text-[10px] py-1 px-3 bg-black/5 rounded-full font-bold text-muted-foreground">LAST 1H</span>
          </div>
          <div className="space-y-4">
             {[
               { time: '23:42:01', event: 'Inference Success (Face)', status: 'OK' },
               { time: '23:41:55', event: 'Fusion Vector Computed', status: 'OK' },
               { time: '23:41:40', event: 'Risk Threshold Triggered', status: 'FLAG' },
               { time: '23:40:12', event: 'Audio MFCC Extracted', status: 'OK' },
               { time: '23:38:44', event: 'New Digital Twin Update', status: 'OK' }
             ].map((log, i) => (
                <div key={i} className="flex gap-4 p-3 bg-black/5 rounded-2xl border border-black/5 text-[10px] items-center">
                   <span className="text-muted-foreground font-mono">{log.time}</span>
                   <span className="flex-1 font-bold">{log.event}</span>
                   <span className={log.status === 'OK' ? 'text-emerald-400' : 'text-rose-400 font-bold'}>{log.status}</span>
                </div>
             ))}
          </div>
          <button className="w-full py-3 bg-black/5 border border-black/5 rounded-xl text-xs font-bold hover:bg-black/10 transition-all">
             View Full CloudLogs
          </button>
        </div>
      </div>
    </div>
  )
}
