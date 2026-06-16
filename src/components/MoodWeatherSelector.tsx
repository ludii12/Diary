import { MOODS, WEATHERS } from '@/utils/constants';

interface Props { mood: string; weather: string; onMoodChange: (m: string) => void; onWeatherChange: (w: string) => void; }

export default function MoodWeatherSelector({ mood, weather, onMoodChange, onWeatherChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="text-[11px] text-sage-400 font-medium mb-1.5 block tracking-wide">今日心绪</label>
        <div className="flex flex-wrap gap-1">
          {MOODS.map((m) => (
            <button key={m.key} onClick={() => onMoodChange(mood === m.key ? '' : m.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors ${mood === m.key ? 'bg-forest-600 text-white shadow-sm' : 'bg-white/50 text-forest-700 border border-warm-200/30 hover:bg-white'}`}>
              <span className="scale-90">{m.icon}</span><span>{m.label}</span></button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <label className="text-[11px] text-sage-400 font-medium mb-1.5 block tracking-wide">时令天气</label>
        <div className="flex flex-wrap gap-1">
          {WEATHERS.map((w) => (
            <button key={w.key} onClick={() => onWeatherChange(weather === w.key ? '' : w.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors ${weather === w.key ? 'bg-forest-600 text-white shadow-sm' : 'bg-white/50 text-forest-700 border border-warm-200/30 hover:bg-white'}`}>
              <span className="scale-90">{w.icon}</span><span>{w.label}</span></button>
          ))}
        </div>
      </div>
    </div>
  );
}