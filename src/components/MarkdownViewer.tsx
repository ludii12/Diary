import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { X } from 'lucide-react';
import type { MediaItem } from '@/store/diaryStore';

interface Props { content: string; media?: MediaItem[]; }

function resolvePlaceholders(content: string, media: MediaItem[]): string {
  let r = content;
  const imgs = media.filter((m) => m.type === 'image');
  const vids = media.filter((m) => m.type === 'video');
  imgs.forEach((img, i) => { r = r.replaceAll(`[图片${i + 1}]`, `![${img.name}](${img.url})`); });
  vids.forEach((vid, i) => { r = r.replaceAll(`[视频${i + 1}]`, `<video src="${vid.url}" controls preload="metadata" class="max-w-full rounded-2xl my-4 shadow-[0_4px_16px_rgba(45,74,62,0.05)] border border-warm-200/20"></video>`); });
  return r;
}

export default function MarkdownViewer({ content, media = [] }: Props) {
  const display = resolvePlaceholders(content, media);
  const [lightbox, setLightbox] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const handleMediaClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
      setLightbox({ url: (target as HTMLImageElement).src, type: 'image' });
    } else if (target.tagName === 'VIDEO') {
      e.preventDefault();
      setLightbox({ url: (target as HTMLVideoElement).src, type: 'video' });
    }
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightbox]);

  return (
    <>
      <div className="markdown-body" onClick={handleMediaClick}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>{display}</ReactMarkdown>
      </div>
      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-[9999] cursor-zoom-out overflow-hidden"
          onClick={() => setLightbox(null)}
        >
          {/* 模糊背景层（独立 div，避免 filter 继承到中央图片） */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: '#0a0a0a',
              backgroundImage: `url(${lightbox.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(50px) brightness(0.45) saturate(1.4)',
              transform: 'scale(1.25)',
            }}
          />

          {/* 顶部渐变遮罩（让关闭按钮更清晰可见） */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

          {/* 关闭按钮 */}
          <button
            className="fixed top-5 right-5 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all z-[10000] shadow-lg backdrop-blur-md border border-white/10"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label="关闭"
          >
            <X size={22} />
          </button>

          {/* 居中大图（独立层，不被模糊） */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            {lightbox.type === 'image' ? (
              <img
                src={lightbox.url}
                className="relative max-w-[92vw] max-h-[88vh] w-auto h-auto object-contain rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
                style={{ backgroundColor: 'transparent' }}
                onClick={(e) => e.stopPropagation()}
                alt="放大查看"
              />
            ) : (
              <video
                src={lightbox.url}
                controls
                autoPlay
                className="relative max-w-[92vw] max-h-[88vh] rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}