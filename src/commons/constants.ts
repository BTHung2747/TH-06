export interface WeatherData {
  city: string;
  temperature: string;
  condition: string;
}

export interface HourlyForecast {
  id: string;
  time: string;
  status: string;
  temp: string;
}

export interface DailyForecast {
  id: string;
  time: string;
  status: string;
  temp: string;
}

export const CURRENT_WEATHER: WeatherData = {
  city: 'Hà Nội',
  temperature: '26°C',
  condition: 'Mưa',
};

export const HOURLY_FORECAST_LIST: HourlyForecast[] = [
  { id: 'h1', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'h2', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'h3', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'h4', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'h5', time: '11 giờ', status: 'Mưa', temp: '26°C' },
];

export const DAILY_FORECAST_LIST: DailyForecast[] = [
  { id: 'd1', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd2', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd3', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd4', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd5', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd6', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd7', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd8', time: '11 giờ', status: 'Mưa', temp: '26°C' },
  { id: 'd9', time: '11 giờ', status: 'Mưa', temp: '26°C' },
];
