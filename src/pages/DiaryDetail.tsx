import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PenLine, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useDiaryStore } from '@/store/diaryStore';
import MarkdownViewer from '@/components/MarkdownViewer';
import { getMoodIcon, getWeatherIcon } from '@/utils/constants';

export default function DiaryDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const diaries = useDiaryStore((s) => s.diaries);
  const deleteDiary = useDiaryStore((s) => s.deleteDiary);
  const diary = diaries.find((d) => d.id === id);

  if (!diary) {
    return (
      <div className="min-h-screen bg-warm-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sage-400 text-xs mb-2">日记不存在</p>
          <button onClick={() => navigate('/')} className="text-forest-600 hover:underline text-xs">返回首页</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-100">
      <header className="sticky top-0 z-10 bg-warm-100/60 backdrop-blur-xl border-b border-warm-200/30">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sage-400 hover:text-forest-600 text-sm"><ArrowLeft size={18} /><span>返回</span></button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/write/${diary.id}`)} className="flex items-center gap-1 text-sage-400 hover:text-forest-600 text-xs font-medium transition-colors"><PenLine size={13} /><span>修改</span></button>
            <span className="w-px h-3 bg-warm-200/60" />
            <button onClick={() => { if (confirm('确定删除吗？')) { deleteDiary(diary.id); navigate('/'); } }} className="flex items-center gap-1 text-sage-400 hover:text-red-500 text-xs font-medium transition-colors"><Trash2 size={13} /><span>抹去</span></button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 animate-fadeIn">
        <article className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(45,74,62,0.04)] border border-warm-200/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-sage-400 font-medium">{format(new Date(diary.date), 'yyyy年 M月d日 EEEE', { locale: zhCN })}</span>
            {diary.mood && <span className="text-sm opacity-70">{getMoodIcon(diary.mood)}</span>}
            {diary.weather && <span className="text-sm opacity-70">{getWeatherIcon(diary.weather)}</span>}
          </div>
          <h1 className="font-serif text-2xl font-bold text-forest-700 mb-6 tracking-wide">{diary.title || '无标题'}</h1>
          
          <div className="min-h-[250px]">
            <MarkdownViewer content={diary.content} media={diary.media} />
          </div>

          <div className="mt-12 pt-4 border-t border-warm-200/30 text-[11px] text-sage-300 flex justify-between items-center">
            <span>记录于 {format(new Date(diary.createdAt), 'yyyy-MM-dd HH:mm')}</span>
            {diary.updatedAt !== diary.createdAt && <span>修润于 {format(new Date(diary.updatedAt), 'yyyy-MM-dd HH:mm')}</span>}
          </div>
          
          {/* 已完全删除右下角/底部的所有外部超链接区块 */}
        </article>
      </main>
    </div>
  );
}