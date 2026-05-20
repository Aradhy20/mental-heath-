"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Smile, 
  Meh, 
  Frown, 
  Angry, 
  Sun,
  CloudRain,
  Moon,
  Coffee,
  Heart,
  Plus
} from 'lucide-react'

const MoodButton = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] transition-all border ${
      isActive 
        ? 'bg-primary border-primary/50 text-white shadow-xl shadow-primary/20 scale-105' 
        : 'glass border-black/5 text-muted-foreground hover:border-primary/30'
    }`}
  >
    <Icon size={32} />
    <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </button>
)

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState('good')

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-black text-foreground mb-2">How are you today?</h1>
        <p className="text-muted-foreground font-medium">Select the emotion that best describes your current state.</p>
      </div>

      {/* Mood Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MoodButton 
          icon={Smile} 
          label="Great" 
          isActive={selectedMood === 'great'} 
          onClick={() => setSelectedMood('great')} 
        />
        <MoodButton 
          icon={Sun} 
          label="Good" 
          isActive={selectedMood === 'good'} 
          onClick={() => setSelectedMood('good')} 
        />
        <MoodButton 
          icon={Meh} 
          label="Okay" 
          isActive={selectedMood === 'okay'} 
          onClick={() => setSelectedMood('okay')} 
        />
        <MoodButton 
          icon={Frown} 
          label="Bad" 
          isActive={selectedMood === 'bad'} 
          onClick={() => setSelectedMood('bad')} 
        />
      </div>

      {/* Detailed Entry */}
      <div className="glass rounded-[2.5rem] p-8 border border-black/5 space-y-8">
        <div>
          <h3 className="text-lg font-black text-foreground mb-4">What's contributing to your mood?</h3>
          <div className="flex flex-wrap gap-3">
            {['Work', 'Health', 'Social', 'Family', 'Sleep', 'Exercise', 'Hobbies'].map((tag) => (
              <button key={tag} className="px-5 py-2 rounded-xl bg-black/5 text-muted-foreground font-bold text-sm hover:bg-primary/10 hover:text-primary transition-all border border-black/5 hover:border-primary/30">
                {tag}
              </button>
            ))}
            <button className="px-3 py-2 rounded-xl bg-black/5 text-muted-foreground hover:bg-black/10 transition-all border border-black/5">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-foreground mb-4">Add a private note (Optional)</h3>
          <textarea 
            placeholder="Write down your thoughts..."
            className="w-full h-40 p-6 bg-black/5 border border-black/5 rounded-[1.5rem] outline-none text-foreground font-medium placeholder-muted-foreground focus:border-primary/50 transition-all resize-none"
          ></textarea>
        </div>

        <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          Save Entry
        </button>
      </div>
    </div>
  )
}
