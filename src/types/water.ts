
export interface WaterIntakeEntry {
  id: string;
  amount: number;
  timestamp: Date;
}

export interface UserSettings {
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderInterval: number; // in minutes
  setupCompleted?: boolean;
  age?: number;
  gender?: 'male' | 'female';
  weight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'intense';
  cupSize?: 'xs' | 's' | 'm' | 'l' | 'xl';
}

export interface CupSize {
  id: 'xs' | 's' | 'm' | 'l' | 'xl';
  label: string;
  volume: number; // in ml
}

export const CUP_SIZES: CupSize[] = [
  { id: 'xs', label: 'XS', volume: 120 },
  { id: 's', label: 'S', volume: 240 },
  { id: 'm', label: 'M', volume: 355 },
  { id: 'l', label: 'L', volume: 470 },
  { id: 'xl', label: 'XL', volume: 590 },
];

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { id: 'light', label: 'Light (light exercise 1–3 days/week)' },
  { id: 'moderate', label: 'Moderate (exercise 3–5 days/week)' },
  { id: 'intense', label: 'Intense (hard exercise 6–7 days/week or hot climate)' },
];
