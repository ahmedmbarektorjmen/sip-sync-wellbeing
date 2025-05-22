
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import WaterDrop from "./WaterDrop";

interface ReminderBannerProps {
  onDismiss: () => void;
  className?: string;
}

const ReminderBanner: React.FC<ReminderBannerProps> = ({ 
  onDismiss,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Automatically hide after 30 seconds if not dismissed
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 500); // Call dismiss after animation completes
    }, 30000);
    
    return () => clearTimeout(timeout);
  }, [onDismiss]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Call dismiss after animation completes
  };
  
  return (
    <Alert 
      className={cn(
        "relative overflow-hidden bg-water-100 border-water-300 transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0",
        className
      )}
    >
      <div className="absolute right-2 top-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full hover:bg-water-200/50"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="bg-water-200/70 p-2 rounded-full">
          <Bell className="h-5 w-5 text-water-700" />
        </div>
        <AlertDescription className="flex items-center gap-2">
          <span>Time to drink some water!</span>
          <WaterDrop size="sm" animate className="inline-block" />
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default ReminderBanner;
