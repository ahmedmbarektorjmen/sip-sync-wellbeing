
import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WaterProgressCircleProps {
  value: number;
  max: number;
  className?: string;
}

const WaterProgressCircle: React.FC<WaterProgressCircleProps> = ({ 
  value, 
  max, 
  className 
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      <div className="relative w-44 h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-water-100 bg-water-50/50 shadow-inner">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-water-500 to-water-400 transition-all duration-1000 ease-out"
          style={{ height: `${percentage}%` }}
        >
          {/* Water ripples */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1 left-[10%] w-3 h-3 bg-white rounded-full animate-ripple" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-2 left-[30%] w-2 h-2 bg-white rounded-full animate-ripple" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-3 left-[70%] w-2 h-2 bg-white rounded-full animate-ripple" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-5 left-[50%] w-3 h-3 bg-white rounded-full animate-ripple" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>
      
      <div className="absolute flex flex-col items-center justify-center bg-white/90 rounded-full w-28 h-28 md:w-32 md:h-32 shadow-md">
        <span className="text-2xl md:text-4xl font-bold text-water-600">{percentage}%</span>
        <span className="text-xs md:text-sm text-water-800">{value} / {max}ml</span>
      </div>
    </div>
  );
};

export default WaterProgressCircle;
