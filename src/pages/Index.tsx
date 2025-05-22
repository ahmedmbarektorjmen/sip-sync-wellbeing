
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
import { v4 as uuidv4 } from "uuid";

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
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("waterEntries");
    const savedSettings = localStorage.getItem("waterSettings");
    
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries);
        // Convert string timestamps back to Date objects
        const entriesWithDates = parsedEntries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setWaterEntries(entriesWithDates);
      } catch (error) {
        console.error("Failed to parse saved water entries:", error);
      }
    }
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);
  
  // Calculate total intake whenever entries change
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysEntries = waterEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    const total = todaysEntries.reduce((sum, entry) => sum + entry.amount, 0);
    setTotalIntake(total);
    
    // Save to localStorage
    localStorage.setItem("waterEntries", JSON.stringify(waterEntries));
  }, [waterEntries]);
  
  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem("waterSettings", JSON.stringify(settings));
  }, [settings]);
  
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
  
  const handleAddWater = (amount: number) => {
    const newEntry: WaterIntakeEntry = {
      id: uuidv4(),
      amount: amount,
      timestamp: new Date()
    };
    
    setWaterEntries(prev => [newEntry, ...prev]);
    
    // Show goal completion toast
    const newTotal = totalIntake + amount;
    if (newTotal >= settings.dailyGoal && totalIntake < settings.dailyGoal) {
      toast({
        title: "Daily Goal Achieved! 🎉",
        description: "Great job staying hydrated today!",
      });
    }
  };
  
  const handleUpdateGoal = (goal: number) => {
    setSettings(prev => ({ ...prev, dailyGoal: goal }));
  };
  
  const handleToggleReminder = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, reminderEnabled: enabled }));
  };
  
  const handleUpdateReminderInterval = (minutes: number) => {
    setSettings(prev => ({ ...prev, reminderInterval: minutes }));
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
