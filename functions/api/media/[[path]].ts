import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { BUCKET } = context.env;
  const path = context.params.path as string;
  const key = Array.isArray(path) ? path.join('/') : path;
  if (!key) return new Response('Not found', { status: 404 });
  const obj = await BUCKET.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  const h = new Headers();
  h.set('Cache-Control', 'public, max-age=31536000');
  h.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
  return new Response(obj.body, { headers: h });
};