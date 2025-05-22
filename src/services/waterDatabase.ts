
import { WaterIntakeEntry, UserSettings } from "@/types/water";
import { v4 as uuidv4 } from "uuid";

// Constants for IndexedDB
const DB_NAME = "HydroTrackDB";
const DB_VERSION = 1;
const WATER_STORE = "waterEntries";
const SETTINGS_STORE = "userSettings";

// Default user settings
const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 2000,
  reminderEnabled: true,
  reminderInterval: 60
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
