import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const r = await context.env.DB.prepare('SELECT * FROM diaries WHERE id = ?').bind(context.params.id as string).first();
  if (!r) return new Response(JSON.stringify({ error: '日记不存在' }), { status: 404 });
  return Response.json(r);
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const id = context.params.id as string;
  const body = await context.request.json() as { title?: string; content?: string; mood?: string; weather?: string; media?: string };
  const now = Date.now();
  const sets: string[] = [];
  const vals: (string | number)[] = [];
  if (body.title !== undefined) { sets.push('title = ?'); vals.push(body.title); }
  if (body.content !== undefined) { sets.push('content = ?'); vals.push(body.content); }
  if (body.mood !== undefined) { sets.push('mood = ?'); vals.push(body.mood); }
  if (body.weather !== undefined) { sets.push('weather = ?'); vals.push(body.weather); }
  if (body.media !== undefined) { sets.push('media = ?'); vals.push(body.media); }
  sets.push('updated_at = ?'); vals.push(now); vals.push(id);
  await DB.prepare(`UPDATE diaries SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return Response.json(await DB.prepare('SELECT * FROM diaries WHERE id = ?').bind(id).first());
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  await context.env.DB.prepare('DELETE FROM diaries WHERE id = ?').bind(context.params.id as string).run();
  return Response.json({ success: true });
};