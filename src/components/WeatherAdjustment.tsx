
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Wind, Umbrella } from "lucide-react";
import { UserSettings } from "@/types/water";

interface WeatherAdjustmentProps {
  settings: UserSettings;
  onUpdateGoal: (goal: number) => void;
  className?: string;
}

type WeatherData = {
  temperature: number;
  humidity: number;
  condition: 'clear' | 'cloudy' | 'rainy' | 'hot';
};

const WeatherAdjustment: React.FC<WeatherAdjustmentProps> = ({
  settings,
  onUpdateGoal,
  className
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAdjusted, setHasAdjusted] = useState(false);
  
  // Simulate fetching weather data
  // In a real app, you would use a weather API
  useEffect(() => {
    const fetchWeatherData = async () => {
      // Random weather simulation
      const conditions = ['clear', 'cloudy', 'rainy', 'hot'] as const;
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const randomTemp = Math.floor(Math.random() * 30) + 5; // 5-35°C
      
      setWeatherData({
        temperature: randomTemp,
        humidity: Math.floor(Math.random() * 60) + 20, // 20-80% humidity
        condition: randomCondition
      });
      
      // Wait before showing the adjustment alert
      setTimeout(() => {
        if (randomTemp > 25 || randomCondition === 'hot') {
          setIsVisible(true);
        }
      }, 2000);
    };
    
    fetchWeatherData();
  }, []);
  
  // Calculate recommended adjustment based on weather
  const getAdjustment = (): number => {
    if (!weatherData) return 0;
    
    let adjustment = 0;
    
    // Temperature adjustment
    if (weatherData.temperature > 30) {
      adjustment += 500; // Very hot
    } else if (weatherData.temperature > 25) {
      adjustment += 300; // Hot
    } else if (weatherData.temperature < 10) {
      adjustment -= 100; // Cold
    }
    
    // Condition adjustment
    if (weatherData.condition === 'hot') {
      adjustment += 200;
    } else if (weatherData.condition === 'rainy') {
      adjustment -= 100;
    }
    
    return adjustment;
  };
  
  const handleAdjustGoal = () => {
    const adjustment = getAdjustment();
    const newGoal = settings.dailyGoal + adjustment;
    onUpdateGoal(newGoal);
    setHasAdjusted(true);
    
    // Hide alert after adjustment
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  // Don't render if no weather data or not visible
  if (!weatherData || !isVisible || hasAdjusted) {
    return null;
  }
  
  const isHot = weatherData.temperature > 25 || weatherData.condition === 'hot';
  const adjustmentAmount = getAdjustment();
  
  return (
    <Alert 
      className={cn(
        "relative overflow-hidden transition-all duration-300 ease-in-out",
        isHot 
          ? "bg-orange-100 border-orange-300" 
          : "bg-blue-100 border-blue-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full",
          isHot ? "bg-orange-200/70" : "bg-blue-200/70"
        )}>
          {isHot ? (
            <Umbrella className="h-5 w-5 text-orange-700" />
          ) : (
            <Wind className="h-5 w-5 text-blue-700" />
          )}
        </div>
        
        <AlertDescription className="flex flex-col md:flex-row md:items-center md:gap-2">
          <span>
            {isHot 
              ? `It's ${weatherData.temperature}°C today! Consider drinking more water.` 
              : `The temperature is ${weatherData.temperature}°C today.`}
          </span>
          
          {adjustmentAmount !== 0 && (
            <button 
              onClick={handleAdjustGoal}
              className={cn(
                "text-sm font-medium underline underline-offset-4",
                isHot ? "text-orange-700" : "text-blue-700"
              )}
            >
              Adjust target (+{adjustmentAmount}ml)
            </button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default WeatherAdjustment;
