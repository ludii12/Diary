import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{display}</ReactMarkdown>
    </div>
  );
}