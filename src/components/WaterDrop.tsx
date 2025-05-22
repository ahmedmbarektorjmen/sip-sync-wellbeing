
import React from "react";
import { cn } from "@/lib/utils";

interface WaterDropProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const WaterDrop: React.FC<WaterDropProps> = ({ 
  size = "md", 
  className, 
  animate = false 
}) => {
  const sizeClasses = {
    sm: "w-6 h-8",
    md: "w-10 h-14",
    lg: "w-16 h-20",
  };
  
  return (
    <div 
      className={cn(
        "water-drop relative", 
        sizeClasses[size], 
        animate && "animate-wave", 
        className
      )}
    >
      <div className="absolute inset-0 opacity-30 rounded-[inherit] bg-white/30 blur-sm"></div>
    </div>
  );
};

export default WaterDrop;
