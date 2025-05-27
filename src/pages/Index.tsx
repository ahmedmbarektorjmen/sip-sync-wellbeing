import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import WaterProgressCircle from "@/components/WaterProgressCircle";
import WaterIntakeForm from "@/components/WaterIntakeForm";
import WaterHistory from "@/components/WaterHistory";
import GoalSettings from "@/components/GoalSettings";
import ReminderBanner from "@/components/ReminderBanner";
import SetupWizard from "@/components/SetupWizard";
import ThemeSettings from "@/components/ThemeSettings";
import MobileNavigation from "@/components/MobileNavigation";
import { WaterIntakeEntry, UserSettings, CUP_SIZES } from "@/types/water";
import { DropletIcon, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getWaterEntries, 
  addWaterEntry, 
  deleteWaterEntry,
  getUserSettings, 
  updateUserSettings, 
  getTodaysTotalIntake 
} from "@/services/waterDatabase";
import WeatherAdjustment from "@/components/WeatherAdjustment";
import HydrationTrends from "@/components/HydrationTrends";
import AchievementDisplay from "@/components/AchievementDisplay";
import { shouldShowReminder } from "@/utils/sleepSchedule";

const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 2000,
  reminderEnabled: true,
  reminderInterval: 60,
  setupCompleted: false,
  smartScheduling: false,
  wakeTime: '08:00',
  sleepTime: '22:00'
};

const Index = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [waterEntries, setWaterEntries] = useState<WaterIntakeEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [totalIntake, setTotalIntake] = useState<number>(0);
  const [showReminder, setShowReminder] = useState<boolean>(false);
  const [reminderTimerId, setReminderTimerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('add');
  
  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load user settings
        const userSettings = await getUserSettings();
        setSettings(userSettings);
        
        // Load water entries
        const entries = await getWaterEntries();
        setWaterEntries(entries);
        
        // Calculate today's intake
        const todaysTotal = await getTodaysTotalIntake();
        setTotalIntake(todaysTotal);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data. Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  // Setup reminders
  useEffect(() => {
    // Clear existing timer
    if (reminderTimerId !== null) {
      window.clearInterval(reminderTimerId);
      setReminderTimerId(null);
    }
    
    // Setup new timer if reminders are enabled
    if (settings.reminderEnabled && settings.setupCompleted) {
      const checkAndShowReminder = () => {
        // Import the utility function
        import('@/utils/sleepSchedule').then(({ shouldShowReminder }) => {
          if (shouldShowReminder(settings)) {
            setShowReminder(true);
          }
        });
      };

      const timerId = window.setInterval(checkAndShowReminder, settings.reminderInterval * 60 * 1000);
      setReminderTimerId(Number(timerId));
    }
    
    return () => {
      if (reminderTimerId !== null) {
        window.clearInterval(reminderTimerId);
      }
    };
  }, [settings.reminderEnabled, settings.reminderInterval, settings.setupCompleted, settings.smartScheduling, settings.wakeTime, settings.sleepTime]);
  
  const handleAddWater = async (amount: number) => {
    try {
      // Add water entry to database
      await addWaterEntry(amount);
      
      // Refresh water entries
      const updatedEntries = await getWaterEntries();
      setWaterEntries(updatedEntries);
      
      // Update today's total intake
      const newTotal = await getTodaysTotalIntake();
      setTotalIntake(newTotal);
      
      // Show goal completion toast
      if (newTotal >= settings.dailyGoal && totalIntake < settings.dailyGoal) {
        toast({
          title: "Daily Goal Achieved! 🎉",
          description: "Great job staying hydrated today!",
        });
      }
    } catch (error) {
      console.error("Error adding water:", error);
      toast({
        title: "Error",
        description: "Failed to add water entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveWater = async (entryId: string) => {
    try {
      // Delete water entry from database
      await deleteWaterEntry(entryId);
      
      // Refresh water entries
      const updatedEntries = await getWaterEntries();
      setWaterEntries(updatedEntries);
      
      // Update today's total intake
      const newTotal = await getTodaysTotalIntake();
      setTotalIntake(newTotal);
      
      toast({
        title: "Entry Removed",
        description: "Water entry has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error removing water entry:", error);
      toast({
        title: "Error",
        description: "Failed to remove water entry. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateGoal = async (goal: number) => {
    try {
      const updatedSettings = { ...settings, dailyGoal: goal };
      await updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleReminder = async (enabled: boolean) => {
    try {
      const updatedSettings = { ...settings, reminderEnabled: enabled };
      await updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error toggling reminder:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateReminderInterval = async (minutes: number) => {
    try {
      const updatedSettings = { ...settings, reminderInterval: minutes };
      await updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating reminder interval:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder interval. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSetupComplete = async (newSettings: Partial<UserSettings>) => {
    try {
      // Merge new settings with existing ones
      const updatedSettings = { ...settings, ...newSettings };
      await updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
      
      // Show success toast
      toast({
        title: "Setup Complete!",
        description: `Your daily goal is ${updatedSettings.dailyGoal}ml of water.`,
      });
    } catch (error) {
      console.error("Error saving setup:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Display setup wizard if setup not completed
  if (!settings.setupCompleted) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }
  
  // Calculate cups progress (only for display, not total intake)
  const getCupsProgress = () => {
    if (!settings.cupSize) return null;
    
    const cupVolume = CUP_SIZES.find(cup => cup.id === settings.cupSize)?.volume || 250;
    const cupsNeeded = Math.ceil(settings.dailyGoal / cupVolume);
    const cupsSoFar = Math.floor(totalIntake / cupVolume);
    
    return {
      total: cupsNeeded,
      completed: cupsSoFar,
      remaining: Math.max(0, cupsNeeded - cupsSoFar)
    };
  };
  
  const cupsProgress = getCupsProgress();
  
  if (isLoading) {
    return (
      <div className="min-h-screen water-wave-bg flex items-center justify-center">
        <div className="animate-pulse text-foreground font-medium">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen water-wave-bg">
      {/* Enhanced Header */}
      <header className="flex items-center justify-between p-3 md:p-6 animate-fade-in bg-card/30 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center gap-2 md:gap-3">
          <DropletIcon className="h-5 w-5 md:h-7 md:w-7 text-primary animate-bounce-gentle" />
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-foreground">HydrateMe</h1>
            <p className="text-xs text-muted-foreground hidden md:block">Stay hydrated, stay healthy</p>
          </div>
        </div>
        
        {/* Desktop Theme Toggle and Settings */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover-scale"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <GoalSettings 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        </div>
      </header>
      
      {showReminder && (
        <ReminderBanner onDismiss={() => setShowReminder(false)} className="mx-2 md:mx-8 animate-slide-in-right" />
      )}
      
      <WeatherAdjustment 
        settings={settings} 
        onUpdateGoal={handleUpdateGoal} 
        className="mx-2 md:mx-8 mb-3 md:mb-4 animate-fade-in"
      />
      
      {/* Mobile Content Container */}
      <div className="pb-20 md:pb-0">
        <main className="container px-2 md:px-4 pt-3 md:pt-4 max-w-4xl mx-auto">
          {/* Main Page Content - Only show progress circle and achievements on home */}
          {activeTab === 'add' && (
            <div className="mb-4 md:mb-8">
              <div className="flex flex-col items-center mb-4 md:mb-6 animate-scale-in">
                <div className="scale-75 sm:scale-90 md:scale-100">
                  <WaterProgressCircle 
                    value={totalIntake} 
                    max={settings.dailyGoal} 
                  />
                </div>
                <h2 className="mt-2 md:mt-4 text-base md:text-xl font-medium text-foreground text-center animate-fade-in px-2">
                  {totalIntake < settings.dailyGoal 
                    ? `${settings.dailyGoal - totalIntake}ml to go` 
                    : "Daily goal completed! 🎉"}
                </h2>
                {cupsProgress && (
                  <div className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground text-center animate-fade-in px-2">
                    {cupsProgress.remaining > 0 
                      ? `${cupsProgress.completed}/${cupsProgress.total} cups • ${cupsProgress.remaining} more to go`
                      : `All ${cupsProgress.total} cups completed!`}
                  </div>
                )}
              </div>
              
              <AchievementDisplay totalIntake={totalIntake} settings={settings} className="mb-3 md:mb-6 animate-fade-in mx-2" />
            </div>
          )}
          
          {/* Mobile content based on active tab */}
          <div className="block md:hidden">
            <Card className="glass-card border-border/50 mx-2 mb-4 animate-scale-in">
              <CardContent className="p-3">
                {activeTab === 'add' && (
                  <div className="animate-fade-in">
                    <WaterIntakeForm 
                      onAddWater={handleAddWater} 
                      settings={settings}
                    />
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="animate-fade-in">
                    <h3 className="text-base font-semibold mb-3 text-foreground">Water History</h3>
                    <WaterHistory 
                      entries={waterEntries}
                      onRemoveEntry={handleRemoveWater}
                    />
                  </div>
                )}
                {activeTab === 'trends' && (
                  <div className="animate-fade-in">
                    <h3 className="text-base font-semibold mb-3 text-foreground">Hydration Trends</h3>
                    <HydrationTrends entries={waterEntries} />
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-base font-semibold mb-3 text-foreground">Settings</h3>
                    <ThemeSettings />
                    <GoalSettings 
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Desktop content */}
          <div className="hidden md:block">
            <Card className="glass-card border-border/50 mb-6 animate-scale-in">
              <CardContent className="p-6">
                <Tabs defaultValue="add" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6 bg-muted/50">
                    <TabsTrigger value="add" className="data-[state=active]:bg-background transition-all hover-scale">
                      Add Water
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-background transition-all hover-scale">
                      History
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="data-[state=active]:bg-background transition-all hover-scale">
                      Trends
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="add" className="mt-0 animate-fade-in">
                    <WaterIntakeForm 
                      onAddWater={handleAddWater} 
                      settings={settings}
                    />
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-0 animate-fade-in">
                    <WaterHistory 
                      entries={waterEntries}
                      onRemoveEntry={handleRemoveWater}
                    />
                  </TabsContent>
                  
                  <TabsContent value="trends" className="mt-0 animate-fade-in">
                    <HydrationTrends entries={waterEntries} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 mb-6 animate-scale-in">
              <CardContent className="p-6">
                <ThemeSettings />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
