import { WaterIntakeEntry, UserSettings } from "@/types/water";
import { v4 as uuidv4 } from "uuid";

// Constants for IndexedDB
const DB_NAME = "HydroTrackDB";
const DB_VERSION = 1;
const WATER_STORE = "waterEntries";
const SETTINGS_STORE = "userSettings";
const ACHIEVEMENT_STORE = "achievements";

// Default user settings
const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 2000,
  reminderEnabled: true,
  reminderInterval: 60,
  calculationMode: 'automatic'
};

// Helper function to open the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error("Error opening database");
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    // If this is the first time opening the DB or an upgrade is needed
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(WATER_STORE)) {
        const waterStore = db.createObjectStore(WATER_STORE, { keyPath: "id" });
        waterStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "id" });
        
        // Add default settings during initialization
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        if (transaction) {
          const settingsStore = transaction.objectStore(SETTINGS_STORE);
          settingsStore.add({ id: "userSettings", ...DEFAULT_SETTINGS });
        }
      }
      
      if (!db.objectStoreNames.contains(ACHIEVEMENT_STORE)) {
        db.createObjectStore(ACHIEVEMENT_STORE, { keyPath: "id" });
      }
    };
  });
};

// Get all water entries
export const getWaterEntries = async (): Promise<WaterIntakeEntry[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WATER_STORE, "readonly");
      const store = transaction.objectStore(WATER_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Convert string dates back to Date objects
        const entries = request.result.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        
        // Sort by timestamp, newest first
        entries.sort((a: WaterIntakeEntry, b: WaterIntakeEntry) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        );
        
        resolve(entries);
      };
      
      request.onerror = () => {
        console.error("Error fetching water entries");
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
};

// Add a new water entry
export const addWaterEntry = async (amount: number): Promise<WaterIntakeEntry> => {
  try {
    const db = await openDB();
    const newEntry: WaterIntakeEntry = {
      id: uuidv4(),
      amount,
      timestamp: new Date()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WATER_STORE, "readwrite");
      const store = transaction.objectStore(WATER_STORE);
      const request = store.add(newEntry);
      
      request.onsuccess = () => {
        resolve(newEntry);
      };
      
      request.onerror = () => {
        console.error("Error adding water entry");
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

// Delete a water entry
export const deleteWaterEntry = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(WATER_STORE, "readwrite");
      const store = transaction.objectStore(WATER_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        console.error("Error deleting water entry");
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

// Get user settings
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, "readonly");
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get("userSettings");
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          // If no settings found, return defaults
          resolve(DEFAULT_SETTINGS);
        }
      };
      
      request.onerror = () => {
        console.error("Error fetching user settings");
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    return DEFAULT_SETTINGS;
  }
};

// Update user settings
export const updateUserSettings = async (settings: UserSettings): Promise<UserSettings> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SETTINGS_STORE, "readwrite");
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.put({ id: "userSettings", ...settings });
      
      request.onsuccess = () => {
        resolve(settings);
      };
      
      request.onerror = () => {
        console.error("Error updating user settings");
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

// Get today's total water intake
export const getTodaysTotalIntake = async (): Promise<number> => {
  try {
    const entries = await getWaterEntries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    return todaysEntries.reduce((sum, entry) => sum + entry.amount, 0);
  } catch (error) {
    console.error("Error calculating today's intake:", error);
    return 0;
  }
};

// Get water entries for a specific date range
export const getWaterEntriesForRange = async (startDate: Date, endDate: Date): Promise<WaterIntakeEntry[]> => {
  try {
    const entries = await getWaterEntries();
    
    return entries.filter(entry => {
      const entryTime = entry.timestamp.getTime();
      return entryTime >= startDate.getTime() && entryTime <= endDate.getTime();
    });
  } catch (error) {
    console.error("Error fetching water entries for range:", error);
    return [];
  }
};

// Get weekly water intake data
export const getWeeklyIntakeData = async (): Promise<{day: string; amount: number}[]> => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const entries = await getWaterEntriesForRange(startOfWeek, endOfWeek);
  
  // Group entries by day of week
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = dayNames.map(day => ({ day, amount: 0 }));
  
  entries.forEach(entry => {
    const entryDay = entry.timestamp.getDay();
    weeklyData[entryDay].amount += entry.amount;
  });
  
  return weeklyData;
};

// Get monthly water intake data
export const getMonthlyIntakeData = async (): Promise<{date: string; amount: number}[]> => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
  
  const entries = await getWaterEntriesForRange(startOfMonth, endOfMonth);
  
  // Group entries by day of month
  const daysInMonth = endOfMonth.getDate();
  const monthlyData: {date: string; amount: number}[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${i}`;
    const dayStart = new Date(year, month, i);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(year, month, i);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayEntries = entries.filter(entry => {
      const entryTime = entry.timestamp.getTime();
      return entryTime >= dayStart.getTime() && entryTime <= dayEnd.getTime();
    });
    
    const totalAmount = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
    monthlyData.push({ date: dateStr, amount: totalAmount });
  }
  
  return monthlyData;
};
