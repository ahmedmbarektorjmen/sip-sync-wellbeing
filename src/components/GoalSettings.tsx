
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { UserSettings } from "@/types/water";

interface GoalSettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

const GoalSettings: React.FC<GoalSettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [localGoal, setLocalGoal] = useState(settings.dailyGoal);
  const [localInterval, setLocalInterval] = useState(settings.reminderInterval);
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
  
  const handleUpdateInterval = (value: string) => {
    const interval = parseInt(value);
    setLocalInterval(interval);
    onUpdateSettings({ reminderInterval: interval });
    toast.success(`Reminder interval set to ${interval} minutes`);
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
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full h-10 w-10 border-water-200 bg-white/70 hover:bg-water-100"
        >
          <Settings2 className="h-5 w-5 text-water-700" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 max-h-96 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Settings</h3>
          
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
          
          <div className="space-y-3 pt-2">
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
                <div className="space-y-2">
                  <Label htmlFor="reminder-interval">Reminder Interval</Label>
                  <Select 
                    value={localInterval.toString()} 
                    onValueChange={handleUpdateInterval}
                  >
                    <SelectTrigger id="reminder-interval">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="45">Every 45 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="90">Every 1.5 hours</SelectItem>
                      <SelectItem value="120">Every 2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
      </PopoverContent>
    </Popover>
  );
};

export default GoalSettings;
