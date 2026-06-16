import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PenLine, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Diary } from '@/store/diaryStore';
import { getMoodIcon, getWeatherIcon } from '@/utils/constants';

interface Props { diary: Diary }

export default function DiaryCard({ diary }: Props) {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/diary/${diary.id}`)}
      className="group bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(45,74,62,0.04)] border border-warm-200/30 hover:bg-white hover:shadow-[0_8px_30px_-4px_rgba(45,74,62,0.08)] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[150px] animate-fadeIn"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-sage-400 font-medium">
              {format(new Date(diary.date), 'M月d日 EEEE', { locale: zhCN })}
            </span>
            {(diary.mood || diary.weather) && (
              <div className="flex items-center gap-1 opacity-60 scale-90">
                {diary.mood && <span>{getMoodIcon(diary.mood)}</span>}
                {diary.weather && <span>{getWeatherIcon(diary.weather)}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/write/${diary.id}`)} 
              className="p-1.5 rounded-full hover:bg-forest-50 text-sage-400 hover:text-forest-600 transition-colors"
            >
              <PenLine size={13} />
            </button>
            <button 
              onClick={() => { if (confirm('确定删除？')) { import('@/store/diaryStore').then(({useDiaryStore}) => useDiaryStore.getState().deleteDiary(diary.id)); } }} 
              className="p-1.5 rounded-full hover:bg-red-50 text-sage-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <h3 className="font-serif text-forest-700 font-semibold text-base mb-1.5 line-clamp-1">{diary.title || '无标题'}</h3>
      </div>
      <p className="text-xs text-sage-400 line-clamp-2 leading-relaxed mt-auto">{diary.content || '暂无内容...'}</p>
    </div>
  );
}