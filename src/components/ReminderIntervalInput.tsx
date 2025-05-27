
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReminderIntervalInputProps {
  value: number; // value in minutes
  onChange: (minutes: number) => void;
  className?: string;
}

const ReminderIntervalInput: React.FC<ReminderIntervalInputProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  const handleHoursChange = (newHours: number) => {
    const totalMinutes = newHours * 60 + minutes;
    onChange(totalMinutes);
  };

  const handleMinutesChange = (newMinutes: number) => {
    const totalMinutes = hours * 60 + newMinutes;
    onChange(totalMinutes);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>Reminder Interval</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <Label className="text-xs text-muted-foreground mt-1 block">Hours</Label>
        </div>
        <div className="flex-1">
          <Input
            type="number"
            min={0}
            max={59}
            step={5}
            value={minutes}
            onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <Label className="text-xs text-muted-foreground mt-1 block">Minutes</Label>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Total: {value} minutes ({hours > 0 && `${hours}h `}{minutes}min)
      </p>
    </div>
  );
};

export default ReminderIntervalInput;
