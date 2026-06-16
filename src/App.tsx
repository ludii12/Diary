import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from '@/pages/Home';
import DiaryEdit from '@/pages/DiaryEdit';
import DiaryDetail from '@/pages/DiaryDetail';
import { useDiaryStore } from '@/store/diaryStore';

export default function App() {
  const init = useDiaryStore((s) => s.init);
  useEffect(() => { init(); }, [init]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/write" element={<DiaryEdit />} />
        <Route path="/write/:id" element={<DiaryEdit />} />
        <Route path="/diary/:id" element={<DiaryDetail />} />
      </Routes>
    </Router>
  );
}