
import { UserSettings } from "@/types/water";

export interface WaterCalculationFactors {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  temperature?: number;
}

export const calculateOptimalWaterIntake = (factors: WaterCalculationFactors): number => {
  const { age, gender, weight, height, activityLevel, temperature = 22 } = factors;
  
  // Base calculation using multiple factors
  // Start with weight-based calculation (35ml per kg for men, 31ml for women)
  let baseIntake = gender === 'male' ? weight * 35 : weight * 31;
  
  // Height adjustment (taller people need more water)
  const heightFactor = height / 170; // 170cm as baseline
  baseIntake *= Math.max(0.9, Math.min(1.2, heightFactor));
  
  // Age adjustment
  if (age < 30) {
    baseIntake *= 1.1;
  } else if (age > 55) {
    baseIntake *= 0.95;
  }
  
  // Activity level adjustment
  switch (activityLevel) {
    case 'sedentary':
      baseIntake *= 0.9;
      break;
    case 'light':
      baseIntake *= 1.0;
      break;
    case 'moderate':
      baseIntake *= 1.2;
      break;
    case 'intense':
      baseIntake *= 1.5;
      break;
  }
  
  // Temperature adjustment
  if (temperature > 25) {
    const tempFactor = 1 + ((temperature - 25) * 0.02); // 2% more per degree above 25°C
    baseIntake *= tempFactor;
  } else if (temperature < 15) {
    const tempFactor = 1 - ((15 - temperature) * 0.01); // 1% less per degree below 15°C
    baseIntake *= Math.max(0.8, tempFactor);
  }
  
  // Round to nearest 50ml
  return Math.round(baseIntake / 50) * 50;
};

export const shouldRecalculateGoal = (settings: UserSettings, temperature?: number): { shouldRecalculate: boolean; newGoal?: number } => {
  if (settings.calculationMode !== 'automatic' || !settings.age || !settings.gender || !settings.weight || !settings.height || !settings.activityLevel) {
    return { shouldRecalculate: false };
  }
  
  const newGoal = calculateOptimalWaterIntake({
    age: settings.age,
    gender: settings.gender,
    weight: settings.weight,
    height: settings.height,
    activityLevel: settings.activityLevel,
    temperature
  });
  
  // Only suggest recalculation if the difference is significant (>10%)
  const difference = Math.abs(newGoal - settings.dailyGoal) / settings.dailyGoal;
  
  return {
    shouldRecalculate: difference > 0.1,
    newGoal
  };
};
