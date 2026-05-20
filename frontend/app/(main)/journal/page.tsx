'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, Stack, alpha
} from '@mui/material'
import { 
  Search as SearchIcon, 
  Plus as PlusIcon, 
  Save as SaveIcon,
  Play as PlayIcon,
  Sparkles as SparklesIcon,
  Clock as ClockIcon,
  BookOpen as BookIcon,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { JOURNAL_ENTRIES } from '@/lib/static-data'
import { journalAPI, type JournalRecord } from '@/lib/api'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalRecord[]>([])
  const [activeEntry, setActiveEntry] = useState<JournalRecord | null>(null)
  const [content, setContent] = useState('')
  const [moodTag, setMoodTag] = useState('')
  const [isDraft, setIsDraft] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchEntries() {
      try {
        const data = await journalAPI.list()
        setEntries(data)
        if (data.length > 0) {
          handleSelectEntry(data[0])
        }
      } catch (err) {
        console.error("Journal fetch failed, using fallback.", err)
        setEntries(JOURNAL_ENTRIES as JournalRecord[])
        handleSelectEntry(JOURNAL_ENTRIES[0] as JournalRecord)
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [])

  const handleNewDraft = () => {
    setIsDraft(true)
    setActiveEntry(null)
    setContent('')
    setMoodTag('')
  }

  const handleSelectEntry = (entry: JournalRecord) => {
    setIsDraft(false)
    setActiveEntry(entry)
    setContent(entry.content)
    setMoodTag(entry.mood_tag || '')
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await journalAPI.create({ content: content.trim(), mood_tag: moodTag || undefined })
      const newEntry: JournalRecord = {
        id: res.id,
        content: content.trim(),
        mood_tag: moodTag || undefined,
        is_private: false,
        created_at: new Date().toISOString(),
        emotion_analysis: { emotion: 'reflective', score: 0.92 },
      }
      setEntries([newEntry, ...entries])
      setActiveEntry(newEntry)
      setIsDraft(false)
    } catch (err) {
      console.error("Save failed", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
         <motion.div 
           animate={{ rotate: 360 }} 
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="p-4 glass rounded-[2.5rem] border border-primary/20"
         >
            <BookIcon className="text-primary w-12 h-12" />
         </motion.div>
         <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">Archiving Neural Records...</p>
      </div>
    )
  }

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto', p: 4, h: 'calc(100vh - 40px)', display: 'flex', gap: 4 }}>
      {/* Left Sidebar: Chronicling List */}
      <Box sx={{ width: 400, h: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
           <div className="flex flex-col">
              <h2 className="text-3xl font-black tracking-tighter">Chronicles.</h2>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural Journaling</span>
           </div>
           <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={handleNewDraft}
             className="p-4 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 border border-white/20"
           >
             <PlusIcon size={24} />
           </motion.button>
        </Box>

        <div className="relative group px-2">
           <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={18} />
           <input 
             placeholder="Search archives..."
             className="w-full pl-14 pr-6 py-4 glass border border-black/5 rounded-[1.8rem] outline-none font-bold text-sm focus:border-primary/30 transition-all shadow-inner"
           />
        </div>

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
          <Stack spacing={2} sx={{ py: 1 }}>
            {entries.map((entry) => {
              const isActive = activeEntry?.id === entry.id && !isDraft
              return (
                <motion.div
                  key={entry.id}
                  whileHover={{ x: 4 }}
                  onClick={() => handleSelectEntry(entry)}
                  className={`p-6 rounded-[2.2rem] cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-primary/5 border-primary/30 shadow-lg' 
                      : 'glass border-black/5 hover:bg-black/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-2">
                        <ClockIcon size={12} className="text-muted-foreground" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                           {new Date(entry.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                     </div>
                     {entry.emotion_analysis?.emotion && (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-full border border-primary/10">
                           {entry.emotion_analysis.emotion}
                        </span>
                     )}
                  </div>
                  <h4 className={`font-black tracking-tight mb-2 truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {entry.content}
                  </h4>
                  <p className="text-[11px] font-bold text-muted-foreground opacity-60 line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                </motion.div>
              )
            })}
          </Stack>
        </Box>
      </Box>

      {/* Main Editor: Immersive Canvas */}
      <Box sx={{ flex: 1, h: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          flex: 1, 
          bgcolor: 'white',
          borderRadius: 12, 
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.05)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.05)',
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Editor Header */}
          <Box sx={{ px: 8, py: 6, borderBottom: '1px solid', borderColor: alpha('#000', 0.03), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-primary/10 rounded-[1.8rem] flex items-center justify-center border border-primary/20">
                  <CalendarIcon className="text-primary" size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black tracking-tighter">
                    {isDraft ? 'New Chronicle' : new Date(activeEntry?.created_at || Date.now()).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     <input 
                       placeholder="Mood Identifier..."
                       value={moodTag}
                       onChange={e => setMoodTag(e.target.value)}
                       disabled={!isDraft}
                       className="bg-transparent outline-none text-[10px] font-black uppercase tracking-[0.2em] text-primary placeholder-primary/30"
                     />
                  </div>
               </div>
            </div>

            {isDraft && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.8rem] font-black shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all border border-white/20"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <SaveIcon size={20} />}
                Persist Chronicle
              </motion.button>
            )}
          </Box>

          {/* Editor Body */}
          <Box sx={{ flex: 1, p: 10, position: 'relative' }}>
             <div className="absolute top-0 left-0 w-full h-full opacity-[0.01] pointer-events-none select-none overflow-hidden">
                <BookIcon size={800} className="text-primary" />
             </div>
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Translate your neural signals into language..."
               disabled={!isDraft}
               className="w-full h-full bg-transparent outline-none text-2xl font-medium leading-[1.8] text-foreground placeholder-muted-foreground/30 resize-none font-serif"
             />
          </Box>

          {/* Editor Footer */}
          <Box sx={{ px: 8, py: 4, bgcolor: 'rgba(0,0,0,0.02)', borderTop: '1px solid', borderColor: alpha('#000', 0.03), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div className="flex gap-10">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Word Count</span>
                   <span className="text-sm font-black">{content.split(/\s+/).filter(x => x).length}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Clarity</span>
                   <span className="text-sm font-black">High</span>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="p-2.5 glass rounded-xl border border-black/5 hover:text-primary transition-colors">
                   <MoreHorizontal size={18} />
                </button>
             </div>
          </Box>
        </Box>
      </Box>

      {/* Right Sidebar: Intelligence Layer */}
      <Box sx={{ width: 380, h: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
         <div className="p-10 glass rounded-[3.5rem] border border-black/5 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <SparklesIcon size={120} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <SparklesIcon size={20} className="text-primary" />
               </div>
               <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Neural Synthesis</span>
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tighter mb-4 leading-tight">AI Emotional Breakdown.</h3>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed opacity-70 italic mb-8">
               {activeEntry?.emotion_analysis?.emotion 
                 ? `We've detected a strong ${activeEntry.emotion_analysis.emotion.toUpperCase()} resonance in this chronicle. This suggests a deepening self-awareness.`
                 : "Initialize your chronicle to receive an AI-driven emotional diagnostic."}
            </p>
            {activeEntry?.emotion_analysis?.emotion && (
              <Stack spacing={3}>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest">Resonance Index</span>
                      <span className="text-xs font-black text-primary">92%</span>
                   </div>
                   <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        className="h-full bg-primary rounded-full" 
                      />
                   </div>
                </div>
              </Stack>
            )}
         </div>

         <div className="p-10 glass rounded-[3.5rem] border border-black/5 shadow-xl flex-1">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <PlayIcon size={20} className="text-emerald-500" />
               </div>
               <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Flow Protocol</span>
            </div>
            <h4 className="text-lg font-black text-foreground tracking-tighter mb-2">Deep Vagus Stimulation.</h4>
            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed opacity-70 mb-8">
               Unlock neural focus and reduce amygdala activation with this 4-minute guided flow.
            </p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 glass border border-emerald-500/20 text-emerald-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-3"
            >
               Begin Protocol <PlayIcon size={14} />
            </motion.button>
         </div>
      </Box>
    </Box>
  )
}
