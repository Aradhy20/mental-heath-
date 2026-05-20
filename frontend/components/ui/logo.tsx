import React from 'react';
import { Brain } from 'lucide-react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

export const Logo = ({ className = "", withText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20 animate-pulse-slow">
        <Brain className="w-8 h-8 text-white" />
      </div>
      {withText && (
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight leading-none text-foreground">
            Mindful<span className="text-primary">AI</span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground leading-none mt-1">
            SAAS PLATFORM
          </span>
        </div>
      )}
    </div>
  );
};
