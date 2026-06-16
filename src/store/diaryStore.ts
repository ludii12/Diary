import { create } from 'zustand';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  file?: File;
}

export interface Diary {
  id: string;
  title: string;
  content: string;
  mood: string;
  weather: string;
  date: string;
  media: MediaItem[];
  createdAt: number;
  updatedAt: number;
}

interface ApiDiary {
  id: string;
  title: string;
  content: string;
  mood: string;
  weather: string;
  date: string;
  media: string;
  created_at: number;
  updated_at: number;
}

function parseMedia(s: string): MediaItem[] {
  try { return JSON.parse(s || '[]'); } catch { return []; }
}

function apiToDiary(a: ApiDiary): Diary {
  return {
    id: a.id, title: a.title, content: a.content,
    mood: a.mood, weather: a.weather, date: a.date,
    media: parseMedia(a.media),
    createdAt: a.created_at, updatedAt: a.updated_at,
  };
}

const STORAGE_KEY = 'diary-app-data';
function saveLocal(diaries: Diary[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(diaries)); } catch {} }
function loadLocal(): Diary[] { try { const d = localStorage.getItem(STORAGE_KEY); if (d) return JSON.parse(d); } catch {} return []; }

async function apiOk(): Promise<boolean> {
  try { const r = await fetch('/api/diaries', { method: 'GET', signal: AbortSignal.timeout(3000) }); return r.ok; } catch { return false; }
}

interface DiaryStore {
  diaries: Diary[];
  searchQuery: string;
  selectedDate: string | null;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  useApi: boolean;
  init: () => Promise<void>;
  fetchDiaries: () => Promise<void>;
  addDiary: (d: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Diary>;
  updateDiary: (id: string, u: Partial<Diary>) => Promise<void>;
  deleteDiary: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setSelectedDate: (d: string | null) => void;
  setSaveStatus: (s: 'saved' | 'saving' | 'unsaved') => void;
}

export const useDiaryStore = create<DiaryStore>((set, get) => ({
  diaries: [], searchQuery: '', selectedDate: null, saveStatus: 'saved', useApi: false,

  init: async () => {
    const ok = await apiOk(); set({ useApi: ok });
    if (ok) { await get().fetchDiaries(); } else { set({ diaries: loadLocal() }); }
  },

  fetchDiaries: async () => {
    if (!get().useApi) return;
    try { const r = await fetch('/api/diaries'); if (r.ok) { const d = await r.json() as ApiDiary[]; set({ diaries: d.map(apiToDiary) }); } } catch {}
  },

  addDiary: async (diary) => {
    const now = Date.now();
    if (get().useApi) {
      try {
        const r = await fetch('/api/diaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...diary, media: JSON.stringify(diary.media) }) });
        if (r.ok) { const d = apiToDiary(await r.json() as ApiDiary); set((s) => ({ diaries: [d, ...s.diaries] })); return d; }
      } catch {}
    }
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const nd: Diary = { ...diary, id, createdAt: now, updatedAt: now };
    const diaries = [nd, ...get().diaries]; set({ diaries }); saveLocal(diaries); return nd;
  },

  updateDiary: async (id, updates) => {
    set({ saveStatus: 'saving' });
    if (get().useApi) {
      try {
        const body: Record<string, unknown> = { ...updates };
        if (updates.media) body.media = JSON.stringify(updates.media);
        const r = await fetch(`/api/diaries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (r.ok) { const d = apiToDiary(await r.json() as ApiDiary); set((s) => ({ diaries: s.diaries.map((x) => x.id === id ? d : x), saveStatus: 'saved' })); return; }
      } catch {}
    }
    const diaries = get().diaries.map((d) => d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d);
    set({ diaries, saveStatus: 'saved' }); saveLocal(diaries);
  },

  deleteDiary: async (id) => {
    if (get().useApi) { try { await fetch(`/api/diaries/${id}`, { method: 'DELETE' }); } catch {} }
    const diaries = get().diaries.filter((d) => d.id !== id); set({ diaries }); saveLocal(diaries);
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedDate: (d) => set({ selectedDate: d }),
  setSaveStatus: (s) => set({ saveStatus: s }),
}));