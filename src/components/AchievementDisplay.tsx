
import React, { useState, useEffect } from "react";
import { UserSettings } from "@/types/water";
import { cn } from "@/lib/utils";
import { Medal } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementDisplayProps {
  totalIntake: number;
  settings: UserSettings;
  className?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
}

const AchievementDisplay: React.FC<AchievementDisplayProps> = ({
  totalIntake,
  settings,
  className
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showUnlocked, setShowUnlocked] = useState<string | null>(null);
  
  useEffect(() => {
    // Calculate achievements based on intake and settings
    const goalPercentage = Math.min(100, Math.floor((totalIntake / settings.dailyGoal) * 100));
    
    const currentAchievements: Achievement[] = [
      {
        id: "first-drink",
        title: "First Sip",
        description: "Record your first water intake",
        icon: <Medal className="h-5 w-5" />,
        unlocked: totalIntake > 0,
      },
      {
        id: "quarter-goal",
        title: "Getting Started",
        description: "Reach 25% of your daily goal",
        icon: <Medal className="h-5 w-5" />,
        unlocked: goalPercentage >= 25,
        progress: Math.min(100, (goalPercentage / 25) * 100)
      },
      {
        id: "half-goal",
        title: "Halfway There",
        description: "Reach 50% of your daily goal",
        icon: <Medal className="h-5 w-5" />,
        unlocked: goalPercentage >= 50,
        progress: Math.min(100, (goalPercentage / 50) * 100)
      },
      {
        id: "goal-complete",
        title: "Goal Achieved",
        description: "Complete your daily water goal",
        icon: <Medal className="h-5 w-5" />,
        unlocked: goalPercentage >= 100,
        progress: goalPercentage
      }
    ];
    
    // Check for newly unlocked achievements
    const previouslyUnlocked = achievements.filter(a => a.unlocked).map(a => a.id);
    const newlyUnlocked = currentAchievements
      .filter(a => a.unlocked && !previouslyUnlocked.includes(a.id))
      .map(a => a.id);
    
    if (newlyUnlocked.length > 0) {
      setShowUnlocked(newlyUnlocked[0]);
      // Hide notification after 3 seconds
      setTimeout(() => setShowUnlocked(null), 3000);
    }
    
    setAchievements(currentAchievements);
  }, [totalIntake, settings.dailyGoal]);

  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {achievements.map((achievement) => (
        <TooltipProvider key={achievement.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "relative h-10 w-10 rounded-full flex items-center justify-center transition-all",
                  achievement.unlocked 
                    ? "bg-water-500 text-white ring-2 ring-water-300" 
                    : "bg-gray-200 text-gray-400",
                  showUnlocked === achievement.id && "animate-pulse"
                )}
              >
                {achievement.icon}
                
                {achievement.progress !== undefined && achievement.progress < 100 && (
                  <svg 
                    className="absolute inset-0 w-full h-full -rotate-90" 
                    viewBox="0 0 100 100"
                  >
                    <circle
                      className="text-gray-300"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-water-600"
                      strokeWidth="8"
                      strokeDasharray={`${achievement.progress * 2.51} 251`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {achievement.progress !== undefined && achievement.progress < 100 && (
                  <p className="text-xs">{Math.floor(achievement.progress)}% complete</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default AchievementDisplay;
