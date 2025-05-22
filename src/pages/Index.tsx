
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import WaterProgressCircle from "@/components/WaterProgressCircle";
import WaterIntakeForm from "@/components/WaterIntakeForm";
import WaterHistory from "@/components/WaterHistory";
import GoalSettings from "@/components/GoalSettings";
import ReminderBanner from "@/components/ReminderBanner";
import { WaterIntakeEntry, UserSettings } from "@/types/water";
import { DropletIcon } from "lucide-react";
import { 
  getWaterEntries, 
  addWaterEntry, 
  getUserSettings, 
  updateUserSettings, 
  getTodaysTotalIntake 
} from "@/services/waterDatabase";

const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 2000,
  reminderEnabled: true,
  reminderInterval: 60
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
        
        // Load water entries
        const entries = await getWaterEntries();
        setWaterEntries(entries);
        
        // Load user settings
        const userSettings = await getUserSettings();
        setSettings(userSettings);
        
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
    if (settings.reminderEnabled) {
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
  }, [settings.reminderEnabled, settings.reminderInterval]);
  
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
  
  return (
    <div className="min-h-screen water-wave-bg pb-8">
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <DropletIcon className="h-6 w-6 text-water-600" />
          <h1 className="text-2xl font-bold text-water-800">HydroTrack</h1>
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
        </div>
        
        <Card className="glass-card border-water-200/50">
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 bg-water-100/50">
                <TabsTrigger value="add" className="data-[state=active]:bg-white">
                  Add Water
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-white">
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="add" className="mt-0">
                <WaterIntakeForm onAddWater={handleAddWater} />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <WaterHistory entries={waterEntries} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
