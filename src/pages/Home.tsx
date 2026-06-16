import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useDiaryStore } from '@/store/diaryStore';
import Calendar from '@/components/Calendar';
import DiaryCard from '@/components/DiaryCard';

export default function Home() {
  const navigate = useNavigate();
  const diaries = useDiaryStore((s) => s.diaries);
  const q = useDiaryStore((s) => s.searchQuery);
  const sd = useDiaryStore((s) => s.selectedDate);
  const setQ = useDiaryStore((s) => s.setSearchQuery);
  const setSd = useDiaryStore((s) => s.setSelectedDate);

  const filtered = useMemo(() => {
    let r = diaries;
    if (sd) r = r.filter((d) => d.date === sd);
    if (q.trim()) { const lq = q.toLowerCase(); r = r.filter((d) => d.title.toLowerCase().includes(lq) || d.content.toLowerCase().includes(lq)); }
    return r.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [diaries, sd, q]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const handleNew = () => { const ex = diaries.find((d) => d.date === today); navigate(ex ? `/write/${ex.id}` : '/write'); };

  return (
    <div className="min-h-screen bg-warm-100">
      <header className="sticky top-0 z-10 bg-warm-100/60 backdrop-blur-xl border-b border-warm-200/30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* 已彻底移除原有的 Logo 图标 */}
            <h1 className="font-serif text-lg font-bold tracking-widest text-forest-700">日记</h1>
          </div>
          <button 
            onClick={handleNew} 
            className="flex items-center gap-1.5 px-5 py-2.5 bg-forest-600/90 text-white rounded-full text-xs font-medium hover:bg-forest-700 transition-all shadow-[0_4px_12px_rgba(45,74,62,0.1)] hover:shadow-[0_6px_16px_rgba(45,74,62,0.15)]"
          >
            <Plus size={14} />
            <span>写日记</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            <Calendar onSelectDate={setSd} selectedDate={sd} />
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400" />
              <input 
                type="text" 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="搜索日记..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 backdrop-blur-md rounded-full border border-warm-200/40 text-xs text-forest-700 placeholder:text-sage-300 focus:outline-none focus:bg-white/80 transition-all shadow-sm" 
              />
            </div>
            {sd && (
              <div className="flex items-center justify-between bg-forest-50/60 backdrop-blur-md rounded-full px-4 py-2">
                <span className="text-[11px] text-forest-600 font-medium">筛选：{sd}</span>
                <button onClick={() => setSd(null)} className="text-[11px] text-sage-400 hover:text-forest-600">清除</button>
              </div>
            )}
          </aside>

          <section className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center mb-4 shadow-sm">
                  <BookOpen size={20} className="text-sage-300" />
                </div>
                <p className="text-sage-400 text-xs mb-1">{sd ? '这天还没有日记' : '还没有日记'}</p>
                <p className="text-sage-300 text-[11px]">点击「写日记」开始记录你的故事</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((d) => <DiaryCard key={d.id} diary={d} />)}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}