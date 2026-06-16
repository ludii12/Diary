export const MOODS = [
  { key: 'happy', label: '开心', icon: '😊' },
  { key: 'calm', label: '平静', icon: '😌' },
  { key: 'excited', label: '兴奋', icon: '🤩' },
  { key: 'sad', label: '难过', icon: '😢' },
  { key: 'anxious', label: '焦虑', icon: '😰' },
  { key: 'angry', label: '生气', icon: '😤' },
] as const;

export const WEATHERS = [
  { key: 'sunny', label: '晴天', icon: '☀️' },
  { key: 'cloudy', label: '多云', icon: '☁️' },
  { key: 'rainy', label: '下雨', icon: '🌧️' },
  { key: 'snowy', label: '下雪', icon: '❄️' },
  { key: 'windy', label: '刮风', icon: '💨' },
  { key: 'stormy', label: '暴风', icon: '⛈️' },
] as const;

export function getMoodIcon(key: string): string { return MOODS.find((m) => m.key === key)?.icon ?? ''; }
export function getWeatherIcon(key: string): string { return WEATHERS.find((w) => w.key === key)?.icon ?? ''; }