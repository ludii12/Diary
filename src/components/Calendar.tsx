import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useDiaryStore } from '@/store/diaryStore';

interface Props { onSelectDate: (date: string) => void; selectedDate: string | null; }

export default function Calendar({ onSelectDate, selectedDate }: Props) {
  const [m, setM] = useState(new Date());
  const diaries = useDiaryStore((s) => s.diaries);
  const dates = useMemo(() => new Set(diaries.map((d) => d.date)), [diaries]);
  const ms = startOfMonth(m); const me = endOfMonth(m);
  const cs = startOfWeek(ms, { weekStartsOn: 1 }); const ce = endOfWeek(me, { weekStartsOn: 1 });
  const days: Date[] = []; let d = cs; while (d <= ce) { days.push(d); d = addDays(d, 1); }
  const sd = selectedDate ? new Date(selectedDate) : null;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(45,74,62,0.04)] border border-warm-200/30">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setM(subMonths(m, 1))} className="p-1.5 rounded-xl hover:bg-forest-50 text-forest-600 transition-colors"><ChevronLeft size={16} /></button>
        <h3 className="font-serif text-forest-600 font-bold text-sm tracking-wide">{format(m, 'yyyy年 M月', { locale: zhCN })}</h3>
        <button onClick={() => setM(addMonths(m, 1))} className="p-1.5 rounded-xl hover:bg-forest-50 text-forest-600 transition-colors"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 mb-2">{['一','二','三','四','五','六','日'].map((w) => <div key={w} className="text-center text-[11px] text-sage-400 font-medium py-0.5">{w}</div>)}</div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          const ds = format(day, 'yyyy-MM-dd');
          const im = isSameMonth(day, m);
          const sel = sd ? isSameDay(day, sd) : false;
          const td = isToday(day);
          const has = dates.has(ds);
          return (
            <button key={i} onClick={() => im && onSelectDate(ds)} disabled={!im}
              className={`relative w-8 h-8 rounded-xl text-xs flex items-center justify-center transition-all ${!im ? 'text-sage-300/30 cursor-default' : 'cursor-pointer'} ${im && !sel ? 'text-forest-700 hover:bg-forest-50' : ''} ${sel ? 'bg-forest-600 text-white font-medium shadow-sm' : ''} ${td && !sel ? 'text-forest-600 font-bold bg-forest-50/50' : ''}`}>
              <span>{format(day, 'd')}</span>
              {has && !sel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-warm-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}