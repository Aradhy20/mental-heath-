import React from 'react';

export const NeuralBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Primary Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(167,139,250,0.05),transparent_50%),radial-gradient(at_bottom_left,rgba(167,139,250,0.05),transparent_50%)]" />
    </div>
  );
};
