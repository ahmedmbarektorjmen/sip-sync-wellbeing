
import { UserSettings } from "@/types/water";

export const shouldShowReminder = (settings: UserSettings): boolean => {
  // If smart scheduling is disabled, always show reminders
  if (!settings.smartScheduling || !settings.wakeTime || !settings.sleepTime) {
    return true;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [wakeHour, wakeMin] = settings.wakeTime.split(':').map(Number);
  const [sleepHour, sleepMin] = settings.sleepTime.split(':').map(Number);

  const wakeMinutes = wakeHour * 60 + wakeMin;
  const sleepMinutes = sleepHour * 60 + sleepMin;

  // Handle case where sleep time is after midnight
  if (sleepMinutes < wakeMinutes) {
    // Sleep time is next day (e.g., wake at 8:00, sleep at 23:00)
    return currentTime >= wakeMinutes || currentTime <= sleepMinutes;
  } else {
    // Sleep time is same day (e.g., wake at 8:00, sleep at 20:00)
    return currentTime >= wakeMinutes && currentTime <= sleepMinutes;
  }
};

export const getNextReminderTime = (settings: UserSettings): Date | null => {
  if (!settings.smartScheduling || !settings.wakeTime) {
    return null;
  }

  const now = new Date();
  const [wakeHour, wakeMin] = settings.wakeTime.split(':').map(Number);
  
  const nextReminder = new Date();
  nextReminder.setHours(wakeHour, wakeMin, 0, 0);

  // If wake time has passed today, set for tomorrow
  if (nextReminder <= now) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  return nextReminder;
};
