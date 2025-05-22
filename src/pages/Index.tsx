import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import WaterProgressCircle from "@/components/WaterProgressCircle";
import WaterIntakeForm from "@/components/WaterIntakeForm";
import WaterHistory from "@/components/WaterHistory";
import GoalSettings from "@/components/GoalSettings";
import ReminderBanner from "@/components/ReminderBanner";
import SetupWizard from "@/components/SetupWizard";
import { WaterIntakeEntry, UserSettings, CUP_SIZES } from "@/types/water";
import { DropletIcon } from "lucide-react";
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

const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 2000,
  reminderEnabled: true,
  reminderInterval: 60,
  setupCompleted: false
};

const Index = () => {
  const { toast } = useToast();
  const [waterEntries, setWaterEntries] = useState<WaterIntakeEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [totalIntake, setTotalIntake] = useState<number>(0);
  const [showReminder, setShowReminder] = useState<boolean>(false);
  const [reminderTimerId, setReminderTimerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
      const timerId = window.setInterval(() => {
        setShowReminder(true);
      }, settings.reminderInterval * 60 * 1000);
      
      setReminderTimerId(Number(timerId));
    }
    
    return () => {
      if (reminderTimerId !== null) {
        window.clearInterval(reminderTimerId);
      }
    };
  }, [settings.reminderEnabled, settings.reminderInterval, settings.setupCompleted]);
  
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
  
  // Calculate cups needed based on cup size
  const getCupsNeeded = () => {
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
  
  const cupsInfo = getCupsNeeded();
  
  if (isLoading) {
    return (
      <div className="min-h-screen water-wave-bg flex items-center justify-center">
        <div className="animate-pulse text-water-800 font-medium">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen water-wave-bg pb-8 select-none">
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <DropletIcon className="h-6 w-6 text-water-600" />
          <h1 className="text-2xl font-bold text-water-800">HydrateMe</h1>
        </div>
        <GoalSettings 
          dailyGoal={settings.dailyGoal}
          onUpdateGoal={handleUpdateGoal}
          reminderEnabled={settings.reminderEnabled}
          onToggleReminder={handleToggleReminder}
          reminderInterval={settings.reminderInterval}
          onUpdateReminderInterval={handleUpdateReminderInterval}
        />
      </header>
      
      {showReminder && (
        <ReminderBanner onDismiss={() => setShowReminder(false)} className="mx-4 md:mx-8" />
      )}
      
      <WeatherAdjustment 
        settings={settings} 
        onUpdateGoal={handleUpdateGoal} 
        className="mx-4 md:mx-8 mb-4"
      />
      
      <main className="container px-4 pt-4 max-w-3xl">
        <div className="flex flex-col items-center mb-8">
          <WaterProgressCircle 
            value={totalIntake} 
            max={settings.dailyGoal} 
          />
          <h2 className="mt-4 text-xl font-medium text-water-800">
            {totalIntake < settings.dailyGoal 
              ? `${settings.dailyGoal - totalIntake}ml to go` 
              : "Daily goal completed! 🎉"}
          </h2>
          {cupsInfo && (
            <div className="mt-2 text-sm text-water-700">
              {cupsInfo.remaining > 0 
                ? `${cupsInfo.completed}/${cupsInfo.total} cups • ${cupsInfo.remaining} more to go`
                : `All ${cupsInfo.total} cups completed!`}
            </div>
          )}
        </div>
        
        <AchievementDisplay totalIntake={totalIntake} settings={settings} className="mb-6" />
        
        <Card className="glass-card border-water-200/50 mb-6">
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6 bg-water-100/50">
                <TabsTrigger value="add" className="data-[state=active]:bg-white">
                  Add Water
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-white">
                  History
                </TabsTrigger>
                <TabsTrigger value="trends" className="data-[state=active]:bg-white">
                  Trends
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="add" className="mt-0">
                <WaterIntakeForm 
                  onAddWater={handleAddWater} 
                  settings={settings}
                />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <WaterHistory 
                  entries={waterEntries}
                  onRemoveEntry={handleRemoveWater}
                />
              </TabsContent>
              
              <TabsContent value="trends" className="mt-0">
                <HydrationTrends entries={waterEntries} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
