
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { UserSettings, ACTIVITY_LEVELS } from "@/types/water";
import { Button } from "@/components/ui/button";
import { calculateOptimalWaterIntake, shouldRecalculateGoal } from "@/utils/waterCalculation";
import ReminderIntervalInput from "./ReminderIntervalInput";

interface GoalSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const GoalSettings: React.FC<GoalSettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [localGoal, setLocalGoal] = useState(settings.dailyGoal);
  const [localAge, setLocalAge] = useState(settings.age || 25);
  const [localWeight, setLocalWeight] = useState(settings.weight || 70);
  const [localHeight, setLocalHeight] = useState(settings.height || 170);
  const [localWakeTime, setLocalWakeTime] = useState(settings.wakeTime || '08:00');
  const [localSleepTime, setLocalSleepTime] = useState(settings.sleepTime || '22:00');
  
  const handleSaveGoal = () => {
    if (localGoal >= 500 && localGoal <= 5000) {
      onUpdateSettings({ dailyGoal: localGoal });
      toast.success("Daily goal updated!");
    } else {
      toast.error("Please enter a value between 500ml and 5000ml");
    }
  };
  
  const handleUpdateInterval = (minutes: number) => {
    onUpdateSettings({ reminderInterval: minutes });
    toast.success(`Reminder interval set to ${minutes} minutes`);
  };

  const handleSmartSchedulingToggle = (enabled: boolean) => {
    onUpdateSettings({ smartScheduling: enabled });
    toast.success(`Smart scheduling ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleTimeUpdate = (field: 'wakeTime' | 'sleepTime', value: string) => {
    if (field === 'wakeTime') {
      setLocalWakeTime(value);
      onUpdateSettings({ wakeTime: value });
    } else {
      setLocalSleepTime(value);
      onUpdateSettings({ sleepTime: value });
    }
    toast.success(`${field === 'wakeTime' ? 'Wake' : 'Sleep'} time updated`);
  };

  const handleCalculationModeChange = (mode: 'automatic' | 'manual') => {
    onUpdateSettings({ calculationMode: mode });
    
    if (mode === 'automatic' && settings.age && settings.gender && settings.weight && settings.height && settings.activityLevel) {
      const autoGoal = calculateOptimalWaterIntake({
        age: settings.age,
        gender: settings.gender,
        weight: settings.weight,
        height: settings.height,
        activityLevel: settings.activityLevel
      });
      setLocalGoal(autoGoal);
      onUpdateSettings({ dailyGoal: autoGoal, calculationMode: mode });
      toast.success(`Switched to automatic calculation (${autoGoal}ml)`);
    } else {
      toast.success(`Switched to ${mode} calculation`);
    }
  };

  const handlePersonalInfoUpdate = () => {
    onUpdateSettings({ 
      age: localAge, 
      weight: localWeight, 
      height: localHeight 
    });
    
    // Recalculate goal if in automatic mode
    if (settings.calculationMode === 'automatic' && settings.gender && settings.activityLevel) {
      const newGoal = calculateOptimalWaterIntake({
        age: localAge,
        gender: settings.gender,
        weight: localWeight,
        height: localHeight,
        activityLevel: settings.activityLevel
      });
      setLocalGoal(newGoal);
      onUpdateSettings({ 
        age: localAge, 
        weight: localWeight, 
        height: localHeight,
        dailyGoal: newGoal 
      });
      toast.success(`Personal info updated! Goal recalculated to ${newGoal}ml`);
    } else {
      toast.success("Personal information updated!");
    }
  };
  
  return (
    <div className="w-full space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium text-foreground">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              min={1}
              max={120}
              value={localAge}
              onChange={(e) => setLocalAge(parseInt(e.target.value) || 25)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              max={500}
              value={localWeight}
              onChange={(e) => setLocalWeight(parseInt(e.target.value) || 70)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              min={100}
              max={250}
              value={localHeight}
              onChange={(e) => setLocalHeight(parseInt(e.target.value) || 170)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={settings.gender || 'male'}
            onValueChange={(value: 'male' | 'female') => onUpdateSettings({ gender: value })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female">Female</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Activity Level</Label>
          <Select 
            value={settings.activityLevel || 'moderate'} 
            onValueChange={(value: 'sedentary' | 'light' | 'moderate' | 'intense') => onUpdateSettings({ activityLevel: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_LEVELS.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handlePersonalInfoUpdate} className="w-full">
          Update Personal Information
        </Button>
      </div>

      {/* Water Goal Calculation */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium text-foreground">Water Goal Calculation</h4>
        <div className="space-y-3">
          <Label>Calculation Mode</Label>
          <RadioGroup
            value={settings.calculationMode || 'automatic'}
            onValueChange={handleCalculationModeChange}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="automatic" id="calc-auto" />
              <Label htmlFor="calc-auto">Automatic (adjusts with weather and personal factors)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="calc-manual" />
              <Label htmlFor="calc-manual">Manual (fixed daily goal)</Label>
            </div>
          </RadioGroup>
        </div>

        {settings.calculationMode !== 'automatic' && (
          <div className="space-y-2">
            <Label htmlFor="daily-goal">Daily Water Goal (ml)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="daily-goal"
                type="number"
                min={500}
                max={5000}
                step={100}
                value={localGoal}
                onChange={(e) => setLocalGoal(parseInt(e.target.value))}
                className="flex-1"
              />
              <Button 
                onClick={handleSaveGoal}
                className="bg-water-500 hover:bg-water-600"
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 2000ml - 3000ml per day
            </p>
          </div>
        )}

        {settings.calculationMode === 'automatic' && (
          <div className="p-3 bg-water-50 rounded-lg">
            <p className="text-sm text-water-800">
              Current calculated goal: <strong>{settings.dailyGoal}ml</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Goal automatically adjusts based on your personal factors and weather conditions
            </p>
          </div>
        )}
      </div>
      
      {/* Reminder Settings */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-toggle" className="cursor-pointer">
            Enable Reminders
          </Label>
          <Switch
            id="reminder-toggle"
            checked={settings.reminderEnabled}
            onCheckedChange={(enabled) => onUpdateSettings({ reminderEnabled: enabled })}
          />
        </div>
        
        {settings.reminderEnabled && (
          <>
            <ReminderIntervalInput
              value={settings.reminderInterval}
              onChange={handleUpdateInterval}
            />

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="smart-scheduling" className="cursor-pointer">
                  Smart Scheduling
                </Label>
                <Switch
                  id="smart-scheduling"
                  checked={settings.smartScheduling || false}
                  onCheckedChange={handleSmartSchedulingToggle}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only receive reminders during awake hours
              </p>

              {settings.smartScheduling && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="wake-time">Wake Up Time</Label>
                    <Input
                      id="wake-time"
                      type="time"
                      value={localWakeTime}
                      onChange={(e) => handleTimeUpdate('wakeTime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleep-time">Sleep Time</Label>
                    <Input
                      id="sleep-time"
                      type="time"
                      value={localSleepTime}
                      onChange={(e) => handleTimeUpdate('sleepTime', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoalSettings;
