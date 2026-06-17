import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ImagePlus, Video, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useDiaryStore, type MediaItem } from '@/store/diaryStore';
import SaveIndicator from '@/components/SaveIndicator';
import MoodWeatherSelector from '@/components/MoodWeatherSelector';
import MarkdownViewer from '@/components/MarkdownViewer';

function genId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 8); }

export default function DiaryEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const diaries = useDiaryStore((s) => s.diaries);
  const addDiary = useDiaryStore((s) => s.addDiary);
  const updateDiary = useDiaryStore((s) => s.updateDiary);
  const setSaveStatus = useDiaryStore((s) => s.setSaveStatus);
  const useApi = useDiaryStore((s) => s.useApi);
  const existing = id ? diaries.find((d) => d.id === id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [mood, setMood] = useState(existing?.mood ?? '');
  const [weather, setWeather] = useState(existing?.weather ?? '');
  const [media, setMedia] = useState<MediaItem[]>(existing?.media ?? []);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const diaryIdRef = useRef(existing?.id ?? '');
  const taRef = useRef<HTMLTextAreaElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const dateStr = existing?.date ?? today;

  useEffect(() => {
    setSaveStatus('unsaved');
    const t = setTimeout(async () => {
      const cid = diaryIdRef.current;
      if (cid) { await updateDiary(cid, { title, content, mood, weather, media }); }
      else if (title || content || media.length > 0) { const nd = await addDiary({ title, content, mood, weather, date: dateStr, media }); diaryIdRef.current = nd.id; }
      else { setSaveStatus('saved'); }
    }, 500);
    return () => clearTimeout(t);
  }, [title, content, mood, weather, media]);

  const insertPh = useCallback((ph: string) => {
    const ta = taRef.current;
    if (!ta) { setContent((p) => p + '\n' + ph + '\n'); return; }
    const s = ta.selectionStart, e = ta.selectionEnd;
    setContent(content.substring(0, s) + ph + content.substring(e));
    requestAnimationFrame(() => { const np = s + ph.length; ta.setSelectionRange(np, np); ta.focus(); });
  }, [content]);

  const uploadFile = useCallback(async (file: File, type: 'image' | 'video') => {
    setUploading(true);
    try {
      let url = '';
      if (useApi) { const fd = new FormData(); fd.append('file', file); const r = await fetch('/api/upload', { method: 'POST', body: fd }); if (r.ok) { const d = await r.json() as { url: string }; url = d.url; } }
      if (!url) url = URL.createObjectURL(file);
      const label = type === 'image' ? '图片' : '视频';
      const idx = media.filter((m) => m.type === type).length + 1;
      setMedia((prev) => [...prev, { id: genId(), type, url, name: file.name }]);
      insertPh(`[${label}${idx}]`);
    } finally { setUploading(false); }
  }, [useApi, media, insertPh]);

  const removeMedia = useCallback((mid: string) => {
    const item = media.find((m) => m.id === mid);
    if (!item) return;
    const label = item.type === 'image' ? '图片' : '视频';
    setMedia((prev) => prev.filter((m) => m.id !== mid));
    setContent((prev) => prev.replace(new RegExp(`\\[${label}\\d+\\]`, 'g'), ''));
    if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
  }, [media]);

  // 粘贴图片/视频
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: { file: File; type: 'image' | 'video' }[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === 'file') {
        const f = it.getAsFile();
        if (!f) continue;
        if (it.type.startsWith('image/')) files.push({ file: f, type: 'image' });
        else if (it.type.startsWith('video/')) files.push({ file: f, type: 'video' });
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      files.forEach((f) => uploadFile(f.file, f.type));
    }
  }, [uploadFile]);

  return (
    <div className="min-h-screen bg-warm-100 flex flex-col">
      <input ref={imgRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'image'); e.target.value = ''; }} />
      <input ref={vidRef} type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'video'); e.target.value = ''; }} />
      
      <header className="sticky top-0 z-10 bg-warm-100/60 backdrop-blur-xl border-b border-warm-200/30">
        <div className="max-w-3xl md:max-w-[845px] mx-auto px-6 md:px-12 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sage-400 hover:text-forest-600 text-xs transition-colors"><ArrowLeft size={16} /><span>离开</span></button>
          <div className="flex items-center gap-2">
            <SaveIndicator />
            <span className="w-px h-3 bg-warm-200/60 mx-1" />
            <button onClick={() => imgRef.current?.click()} disabled={uploading} className="p-2 rounded-full bg-white/40 text-sage-400 hover:text-forest-600 hover:bg-forest-50 transition-colors disabled:opacity-50" title="插入图片">{uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}</button>
            <button onClick={() => vidRef.current?.click()} disabled={uploading} className="p-2 rounded-full bg-white/40 text-sage-400 hover:text-forest-600 hover:bg-forest-50 transition-colors disabled:opacity-50" title="插入视频"><Video size={15} /></button>
            <button onClick={() => setPreview(!preview)} className={`p-2 rounded-full transition-colors ${preview ? 'bg-forest-600 text-white' : 'bg-white/40 text-sage-400 hover:text-forest-600'}`}>{preview ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl md:max-w-[845px] mx-auto w-full px-6 md:px-12 py-8">
        <div className="mb-4"><span className="text-[11px] text-sage-400 font-medium tracking-wide">{format(new Date(dateStr), 'yyyy年 M月d日 EEEE', { locale: zhCN })}</span></div>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给日记起个标题..." className="w-full text-xl font-serif font-bold text-forest-700 bg-transparent placeholder:text-sage-300 focus:outline-none mb-6 tracking-wide" />
        <div className="mb-6"><MoodWeatherSelector mood={mood} weather={weather} onMoodChange={setMood} onWeatherChange={setWeather} /></div>
        
        {media.length > 0 && (
          <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
            {media.map((item) => (
              <div key={item.id} className="relative flex-shrink-0 group">
                {item.type === 'image' ? <img src={item.url} alt={item.name} className="w-20 h-20 object-cover rounded-2xl border border-warm-200/30 shadow-sm" /> : <div className="w-20 h-20 rounded-2xl border border-warm-200/30 shadow-sm bg-forest-50 flex items-center justify-center"><Video size={20} className="text-forest-400" /></div>}
                <button onClick={() => removeMedia(item.id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X size={10} /></button>
              </div>
            ))}
          </div>
        )}

        {preview ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-warm-200/30 min-h-[420px] shadow-[0_4px_20px_-4px_rgba(45,74,62,0.04)]"><MarkdownViewer content={content} media={media} /></div>
        ) : (
          <textarea ref={taRef} value={content} onChange={(e) => setContent(e.target.value)} onPaste={handlePaste} placeholder={"今天发生了什么？支持 Markdown 格式书写...\n\n点击上方 📷 插入图片，🎬 插入视频\n也可以直接 Ctrl+V 粘贴图片/视频"} className="diary-editor w-full min-h-[420px] bg-white/80 backdrop-blur-xl rounded-3xl p-7 border border-warm-200/30 text-forest-700 text-sm transition-all shadow-[0_4px_20px_-4px_rgba(45,74,62,0.04)]" />
        )}
      </main>
    </div>
  );
}