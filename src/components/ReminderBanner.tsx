
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
    
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('💧 HydrateMe Reminder', {
        body: 'Time to drink some water! Stay hydrated!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'water-reminder'
      });
      
      // Auto close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
    
    // Play notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+HyvmwhCSuC0fPCdSMFJH7E8OOZSw0PVKzj7q9ZFQ9Dl+Dpv20iCjCH1vHFeSYGIn/E8+GSQwoPU6jh7a5VEw5CnOPrvWseBjuL1e2+cSEELIPI8dWAOwgPVqbh7bNXEw9AlN/uvWQgCTOC1/LCqUAOGUms4eOxWBELPJDa6bhjGgU+jdXtvnAiByePweuUWwkNGFy37dWAQQoUQ5rY48Nhgj5+sFsKWzUd');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore if audio play fails (browser restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
    
    // Automatically hide after 30 seconds if not dismissed
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 500);
    }, 30000);
    
    return () => clearTimeout(timeout);
  }, [onDismiss]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };
  
  return (
    <Alert 
      className={cn(
        "relative overflow-hidden bg-primary/10 border-primary/30 transition-all duration-300 ease-in-out shadow-lg",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0",
        className
      )}
    >
      <div className="absolute right-2 top-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full hover:bg-primary/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-full">
          <Bell className="h-4 w-4 text-primary animate-bounce-gentle" />
        </div>
        <AlertDescription className="flex items-center gap-2 text-sm text-foreground">
          <span className="font-medium">Time to drink water!</span>
          <WaterDrop size="sm" animate className="inline-block" />
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default ReminderBanner;
