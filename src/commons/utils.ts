/**
 * Utility functions for Weather App
 */

export const formatTemperature = (temp: number | string): string => {
  if (typeof temp === 'string') {
    return temp.includes('°C') ? temp : `${temp}°C`;
  }
  return `${temp}°C`;
};

export const getWeatherEmoji = (condition: string): string => {
  const normalized = condition.toLowerCase();
  if (normalized.includes('mưa') || normalized.includes('rain')) return '🌧️';
  if (normalized.includes('nắng') || normalized.includes('sunny')) return '☀️';
  if (normalized.includes('mây') || normalized.includes('cloud')) return '⛅';
  if (normalized.includes('dông') || normalized.includes('giông') || normalized.includes('thunder')) return '🌩️';
  return '🌤️';
};
