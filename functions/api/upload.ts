import { Env } from '../types';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_VIDEOS = ['video/mp4', 'video/webm', 'video/ogg'];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { BUCKET } = context.env;
  const fd = await context.request.formData();
  const file = fd.get('file') as File | null;
  if (!file) return new Response(JSON.stringify({ error: '没有文件' }), { status: 400 });
  if (file.size > MAX_FILE_SIZE) return new Response(JSON.stringify({ error: '文件超过50MB限制' }), { status: 400 });
  const isImg = ALLOWED_IMAGES.includes(file.type);
  const isVid = ALLOWED_VIDEOS.includes(file.type);
  if (!isImg && !isVid) return new Response(JSON.stringify({ error: '不支持的文件类型' }), { status: 400 });
  const ext = file.name.split('.').pop() || 'bin';
  const key = `${isImg ? 'images' : 'videos'}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  await BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return Response.json({ url: `/api/media/${key}`, type: isImg ? 'image' : 'video' });
};