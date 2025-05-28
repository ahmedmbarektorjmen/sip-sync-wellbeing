import React, { useState, useEffect, useRef } from "react";
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
import CustomToastContainer from "@/components/CustomToastContainer";
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
import cn from "classnames";

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
  
  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = ['add', 'history', 'trends', 'settings'];
  
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

  // Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  
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
    <div className="min-h-screen water-wave-bg responsive-container">
      <CustomToastContainer />
      
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-2 md:p-6 animate-fade-in bg-card/30 backdrop-blur-sm border-b border-border/20 w-full h-[70px]">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <DropletIcon className="h-4 w-4 md:h-7 md:w-7 text-primary animate-bounce-gentle flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm md:text-2xl font-bold text-foreground truncate">HydrateMe</h1>
            <p className="text-xs text-muted-foreground hidden md:block">Stay hydrated, stay healthy</p>
          </div>
        </div>
        
        {/* Desktop Theme Toggle */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover-scale"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </header>
      
      {/* Content with top padding for fixed header */}
      <div className="pt-[70px] min-h-screen">
        {showReminder && (
          <ReminderBanner onDismiss={() => setShowReminder(false)} className="mx-1 md:mx-8 animate-slide-in-right mt-2" />
        )}
        
        <WeatherAdjustment 
          settings={settings} 
          onUpdateGoal={handleUpdateGoal} 
          className="mx-1 md:mx-8 mb-2 md:mb-4 animate-fade-in mt-2"
        />
        
        {/* Mobile Content Container with Swipe */}
        <div 
          className="mobile-safe-area"
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <main className="w-full px-1 md:px-4 pt-2 md:pt-4 max-w-4xl mx-auto responsive-container">
            {/* Main Page Content - Only show progress circle and achievements on home */}
            {activeTab === 'add' && (
              <div className="mb-3 md:mb-8 w-full">
                <div className="flex flex-col items-center mb-3 md:mb-6 animate-scale-in w-full">
                  <div className="w-full flex justify-center mb-2">
                    <WaterProgressCircle 
                      value={totalIntake} 
                      max={settings.dailyGoal} 
                    />
                  </div>
                  <h2 className="text-sm md:text-xl font-medium text-foreground text-center animate-fade-in px-1 max-w-full">
                    {totalIntake < settings.dailyGoal 
                      ? `${settings.dailyGoal - totalIntake}ml to go` 
                      : "Daily goal completed! 🎉"}
                  </h2>
                  {cupsProgress && (
                    <div className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground text-center animate-fade-in px-1 max-w-full">
                      {cupsProgress.remaining > 0 
                        ? `${cupsProgress.completed}/${cupsProgress.total} cups • ${cupsProgress.remaining} more to go`
                        : `All ${cupsProgress.total} cups completed!`}
                    </div>
                  )}
                </div>
                
                <AchievementDisplay totalIntake={totalIntake} settings={settings} className="mb-2 md:mb-6 animate-fade-in mx-1 max-w-full" />
              </div>
            )}
            
            {/* Mobile content based on active tab */}
            <div className="block md:hidden w-full">
              <Card className="glass-card border-border/50 mx-1 mb-3 animate-scale-in max-w-full">
                <CardContent className={cn("p-2", activeTab === 'trends' && "p-1")}>
                  {activeTab === 'add' && (
                    <div className="animate-fade-in w-full">
                      <WaterIntakeForm 
                        onAddWater={handleAddWater} 
                        settings={settings}
                      />
                    </div>
                  )}
                  {activeTab === 'history' && (
                    <div className="animate-fade-in w-full">
                      <h3 className="text-sm font-semibold mb-2 text-foreground">Water History</h3>
                      <WaterHistory 
                        entries={waterEntries}
                        onRemoveEntry={handleRemoveWater}
                      />
                    </div>
                  )}
                  {activeTab === 'trends' && (
                    <div className="animate-fade-in w-full">
                      <HydrationTrends entries={waterEntries} />
                    </div>
                  )}
                  {activeTab === 'settings' && (
                    <div className="space-y-4 animate-fade-in w-full">
                      <h3 className="text-sm font-semibold mb-3 text-foreground">Settings</h3>
                      <ThemeSettings />
                      <div className="pt-3 border-t">
                        <h4 className="text-sm font-medium mb-3 text-foreground">Water Goals & Reminders</h4>
                        <GoalSettings 
                          settings={settings}
                          onUpdateSettings={handleUpdateSettings}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Desktop content */}
            <div className="hidden md:block w-full">
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
                  <div className="space-y-6">
                    <ThemeSettings />
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Water Goals & Reminders</h3>
                      <GoalSettings 
                        settings={settings}
                        onUpdateSettings={handleUpdateSettings}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
