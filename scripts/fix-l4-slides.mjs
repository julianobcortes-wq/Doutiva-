import { readFileSync } from 'fs';
for (const line of readFileSync('/workspace/.env','utf8').split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const i=line.indexOf('='); if(i<0) continue;
  const k=line.slice(0,i), v=line.slice(i+1); if(!process.env[k]) process.env[k]=v;
}
import { createClient } from '@supabase/supabase-js';
import { streamText, Output } from 'ai';
import { z } from 'zod';
import { createGatewayOpenAI, doutivaChatModel, doutivaOpenAIProviderOptions } from '../src/lib/ai-provider.server.ts';

const slideSchema = z.object({
  kind: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  text: z.string().nullable(),
  items: z.array(z.string()),
  rightItems: z.array(z.string()),
  leftLabel: z.string().nullable(),
  rightLabel: z.string().nullable(),
  head: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  unit: z.string().nullable(),
  source: z.string().nullable(),
  note: z.string().nullable(),
});
const outSchema = z.object({
  slides: z.array(slideSchema).min(7).max(10),
  quick_ref: z.string(),
});

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false,autoRefreshToken:false}});
const { data: lesson } = await sb.from('lessons').select('id,title,monograph,clinical_case').eq('position',4).single();

function toSlide(s) {
  const t=s.title;
  switch(s.kind){
    case 'title': return { kind:'title', title:t, subtitle:s.subtitle??undefined };
    case 'bullets': return { kind:'bullets', title:t, bullets:s.items, note:s.note??undefined };
    case 'bars': return { kind:'bars', title:t, unit:s.unit??'%', source:s.source??'', note:s.note??undefined,
      bars:s.items.map((it,i)=>{ const [label,v]=it.split('|'); return { label:(label??'').trim(), value:Number((v??'').replace(',','.').replace(/[^\d.-]/g,''))||0, highlight:i===s.items.length-1}; })};
    case 'flow': return { kind:'flow', title:t, note:s.note??undefined, steps:s.items.map(it=>{ const [label,detail]=it.split(/\s+—\s+|\s+-\s+/); return {label:(label??'').trim(), detail:detail?.trim()}; })};
    case 'table': return { kind:'table', title:t, head:s.head, rows:s.rows, source:s.source??undefined };
    case 'split': return { kind:'split', title:t, left:{label:s.leftLabel??'', items:s.items}, right:{label:s.rightLabel??'', items:s.rightItems} };
    case 'pearl': return { kind:'pearl', title:t, text:s.text??s.subtitle??'', source:s.source??undefined };
    default: return null;
  }
}

const openai = createGatewayOpenAI();
const result = streamText({
  model: doutivaChatModel(openai),
  system: `Você estrutura slides clínicos densos a partir de uma monografia médica. Em português do Brasil.
Regras: 8 slides; comece com kind title; inclua bars com perda de peso STEP/SURMOUNT (itens "rótulo | valor"); table com SELECT/FLOW/SUSTAIN-6; flow algoritmo de escolha; split semaglutida vs tirzepatida; pearl final.
Não invente números ausentes da monografia.`,
  prompt: `Título: ${lesson.title}\n\n=== MONOGRAFIA ===\n${lesson.monograph}`,
  output: Output.object({ schema: outSchema }),
  providerOptions: doutivaOpenAIProviderOptions('medium'),
});
const o = await result.output;
const slides = o.slides.map(toSlide).filter(Boolean);
console.log('slides', slides.length, slides.map(s=>s.kind));
const { error } = await sb.from('lessons').update({
  slides,
  quick_ref: o.quick_ref,
  duration_minutes: 90,
  updated_at: new Date().toISOString(),
}).eq('id', lesson.id);
if (error) throw error;
console.log('L4 fixed', slides.length, 'qr', o.quick_ref.length);
