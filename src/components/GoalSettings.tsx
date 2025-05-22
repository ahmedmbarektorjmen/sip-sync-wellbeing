
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

interface GoalSettingsProps {
  dailyGoal: number;
  onUpdateGoal: (goal: number) => void;
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  reminderInterval: number;
  onUpdateReminderInterval: (minutes: number) => void;
}

const GoalSettings: React.FC<GoalSettingsProps> = ({
  dailyGoal,
  onUpdateGoal,
  reminderEnabled,
  onToggleReminder,
  reminderInterval,
  onUpdateReminderInterval
}) => {
  const [localGoal, setLocalGoal] = useState(dailyGoal);
  const [localInterval, setLocalInterval] = useState(reminderInterval);
  
  const handleSaveGoal = () => {
    if (localGoal >= 500 && localGoal <= 5000) {
      onUpdateGoal(localGoal);
      toast.success("Daily goal updated!");
    } else {
      toast.error("Please enter a value between 500ml and 5000ml");
    }
  };
  
  const handleUpdateInterval = (value: string) => {
    const interval = parseInt(value);
    setLocalInterval(interval);
    onUpdateReminderInterval(interval);
    toast.success(`Reminder interval set to ${interval} minutes`);
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
      <PopoverContent className="w-80 p-4">
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
                checked={reminderEnabled}
                onCheckedChange={onToggleReminder}
              />
            </div>
            
            {reminderEnabled && (
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
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GoalSettings;
