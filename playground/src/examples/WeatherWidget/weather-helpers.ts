import { h } from 'aided-core';

// --- API Fetcher Functions ---

/**
 * Fetches the location details from OpenStreetMap.
 * It's designed to be used in a resource, so it handles a null source.
 */
export const fetchLocation = async (coords: { latitude: number; longitude: number; } | null) => {
  if (!coords) return null; // Don't fetch if we don't have coordinates yet
  const { latitude, longitude } = coords;
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch location name.');
  return response.json();
};

/**
 * Fetches the 5-day weather forecast from Open-Meteo.
 * This fetcher depends on the result from fetchLocation.
 */
export const fetchWeather = async (locationData: { lat: number; lon: number; } | null) => {
  if (!locationData) return null; // Don't fetch if location data isn't ready
  console.log(locationData);
  const { lat, lon } = locationData;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather data.');
  return response.json();
};

// --- UI Helper Components ---

export const ErrorMessage = (props: { message: string; }) => h.div({ class: 'error' }, `Error: ${props.message}`);

/** A simple function to map weather codes to emojis */
export function getWeatherIcon(code: number) {
  if (code === 0) return '☀️'; // Clear sky
  if (code <= 3) return '⛅️'; // Partly cloudy
  if (code <= 48) return '☁️'; // Fog
  if (code <= 67) return '🌧️'; // Rain
  if (code <= 77) return '❄️'; // Snow
  if (code <= 99) return '⛈️'; // Thunderstorm
  return '❓';
}