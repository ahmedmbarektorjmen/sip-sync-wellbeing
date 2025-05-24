
interface WeatherData {
  temperature: number;
  humidity: number;
  condition: 'clear' | 'cloudy' | 'rainy' | 'hot';
  location: string;
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  name: string;
}

const API_KEY = 'demo_key'; // This would normally be from environment variables
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherData = async (lat?: number, lon?: number): Promise<WeatherData> => {
  try {
    // Get user's location if not provided
    if (!lat || !lon) {
      const position = await getCurrentPosition();
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    }

    // For demo purposes, we'll simulate the API call since we don't have a real API key
    // In production, you would use: 
    // const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    
    // Simulate weather data based on location and time
    const weatherData = generateWeatherData(lat, lon);
    
    return weatherData;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    // Fallback to default weather
    return {
      temperature: 22,
      humidity: 65,
      condition: 'clear',
      location: 'Unknown Location'
    };
  }
};

const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      enableHighAccuracy: true,
    });
  });
};

const generateWeatherData = (lat: number, lon: number): WeatherData => {
  // Simulate weather based on location and time
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  
  // Base temperature on latitude (rough approximation)
  let baseTemp = 25 - Math.abs(lat) * 0.7;
  
  // Seasonal adjustment (Northern hemisphere bias)
  const seasonalAdjustment = lat > 0 
    ? Math.cos((month - 6) * Math.PI / 6) * 15 
    : Math.cos(month * Math.PI / 6) * 15;
  
  // Daily temperature variation
  const dailyVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
  
  const temperature = Math.round(baseTemp + seasonalAdjustment + dailyVariation + (Math.random() - 0.5) * 6);
  
  // Determine condition based on temperature and randomness
  let condition: 'clear' | 'cloudy' | 'rainy' | 'hot';
  const random = Math.random();
  
  if (temperature > 30) {
    condition = 'hot';
  } else if (temperature < 15 && random < 0.3) {
    condition = 'rainy';
  } else if (random < 0.4) {
    condition = 'cloudy';
  } else {
    condition = 'clear';
  }
  
  // Humidity based on condition
  const humidity = condition === 'rainy' ? 80 + Math.random() * 15 : 40 + Math.random() * 40;
  
  // Approximate location name based on coordinates
  const location = getLocationName(lat, lon);
  
  return {
    temperature,
    humidity: Math.round(humidity),
    condition,
    location
  };
};

const getLocationName = (lat: number, lon: number): string => {
  // Simple location approximation - in production you'd use reverse geocoding
  if (lat > 40 && lat < 50 && lon > -125 && lon < -60) return 'North America';
  if (lat > 35 && lat < 70 && lon > -10 && lon < 70) return 'Europe';
  if (lat > -40 && lat < 35 && lon > 10 && lon < 55) return 'Africa';
  if (lat > -45 && lat < 55 && lon > 70 && lon < 180) return 'Asia';
  if (lat > -50 && lat < -10 && lon > 110 && lon < 180) return 'Australia';
  if (lat > -60 && lat < 15 && lon > -85 && lon < -30) return 'South America';
  return 'Your Location';
};
