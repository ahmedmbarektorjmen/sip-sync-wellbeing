
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Wind, Umbrella, MapPin } from "lucide-react";
import { UserSettings } from "@/types/water";
import { getWeatherData } from "@/services/weatherService";

interface WeatherAdjustmentProps {
  settings: UserSettings;
  onUpdateGoal: (goal: number) => void;
  className?: string;
}

type WeatherData = {
  temperature: number;
  humidity: number;
  condition: 'clear' | 'cloudy' | 'rainy' | 'hot';
  location: string;
};

const WeatherAdjustment: React.FC<WeatherAdjustmentProps> = ({
  settings,
  onUpdateGoal,
  className
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true);
        const data = await getWeatherData();
        setWeatherData(data);
        
        // Show adjustment suggestion after loading
        setTimeout(() => {
          if (data.temperature > 25 || data.condition === 'hot') {
            setIsVisible(true);
          }
        }, 1000);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoading(false);
      }
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
    
    // Humidity adjustment
    if (weatherData.humidity > 80) {
      adjustment += 100;
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
  
  // Don't render if loading, no weather data, not visible, or already adjusted
  if (isLoading || !weatherData || !isVisible || hasAdjusted) {
    return null;
  }
  
  const isHot = weatherData.temperature > 25 || weatherData.condition === 'hot';
  const adjustmentAmount = getAdjustment();
  
  return (
    <Alert 
      className={cn(
        "relative overflow-hidden transition-all duration-300 ease-in-out animate-fade-in",
        isHot 
          ? "bg-orange-100 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700" 
          : "bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full",
          isHot ? "bg-orange-200/70 dark:bg-orange-800/50" : "bg-blue-200/70 dark:bg-blue-800/50"
        )}>
          {isHot ? (
            <Umbrella className="h-4 w-4 md:h-5 md:w-5 text-orange-700 dark:text-orange-300" />
          ) : (
            <Wind className="h-4 w-4 md:h-5 md:w-5 text-blue-700 dark:text-blue-300" />
          )}
        </div>
        
        <AlertDescription className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm md:text-base">
              {isHot 
                ? `It's ${weatherData.temperature}°C in ${weatherData.location}! Consider drinking more water.` 
                : `The temperature is ${weatherData.temperature}°C in ${weatherData.location}.`}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{weatherData.location}</span>
            </div>
          </div>
          
          {adjustmentAmount !== 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAdjustGoal}
                className={cn(
                  "text-xs md:text-sm font-medium underline underline-offset-4 hover-scale",
                  isHot ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"
                )}
              >
                Adjust target (+{adjustmentAmount}ml)
              </button>
              <button 
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default WeatherAdjustment;
