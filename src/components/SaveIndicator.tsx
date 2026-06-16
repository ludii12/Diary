import { Check } from 'lucide-react';
import { useDiaryStore } from '@/store/diaryStore';

export default function SaveIndicator() {
  const saveStatus = useDiaryStore((s) => s.saveStatus);
  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-sage-400' : saveStatus === 'saving' ? 'bg-forest-400 animate-pulse-dot' : 'bg-sage-300'}`} />
      <span className="text-sage-400 text-[11px] tracking-wide">{saveStatus === 'saved' ? '已存' : saveStatus === 'saving' ? '同步中' : '未存'}</span>
      {saveStatus === 'saved' && <Check size={11} className="text-sage-400" />}
    </div>
  );
}