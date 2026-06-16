import { Env } from '../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const url = new URL(context.request.url);
  const date = url.searchParams.get('date');
  const search = url.searchParams.get('search');
  let query = 'SELECT * FROM diaries WHERE 1=1';
  const params: string[] = [];
  if (date) { query += ' AND date = ?'; params.push(date); }
  if (search) { query += ' AND (title LIKE ? OR content LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY updated_at DESC';
  return Response.json((await DB.prepare(query).bind(...params).all()).results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const body = await context.request.json() as { title?: string; content?: string; mood?: string; weather?: string; date?: string; media?: string };
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  const now = Date.now();
  await DB.prepare('INSERT INTO diaries (id, title, content, mood, weather, date, media, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, body.title || '', body.content || '', body.mood || '', body.weather || '', body.date || new Date().toISOString().split('T')[0], body.media || '[]', now, now).run();
  return Response.json(await DB.prepare('SELECT * FROM diaries WHERE id = ?').bind(id).first());
};