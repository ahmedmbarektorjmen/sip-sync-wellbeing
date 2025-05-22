
export interface WaterIntakeEntry {
  id: string;
  amount: number;
  timestamp: Date;
}

export interface UserSettings {
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderInterval: number; // in minutes
}
