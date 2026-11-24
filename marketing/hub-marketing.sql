-- Hub de dados de marketing da Doutiva (projeto Supabase "Doutiva" antigo, usado só para marketing).
create table if not exists public.mkt_config (
  id int primary key default 1 check (id = 1),
  chave_hash text not null
);
alter table public.mkt_config enable row level security;

create table if not exists public.mkt_campanhas (
  canal text not null,
  campanha_id text not null,
  nome text not null,
  status text,
  objetivo text,
  orcamento_total numeric,
  orcamento_diario numeric,
  inicio date,
  fim date,
  utm_campanha text,
  atualizado_em timestamptz not null default now(),
  primary key (canal, campanha_id)
);
alter table public.mkt_campanhas enable row level security;

create table if not exists public.mkt_anuncios_dia (
  dia date not null,
  canal text not null,
  campanha_id text not null,
  anuncio_id text not null,
  anuncio text,
  conjunto text,
  titulo text,
  imagem_url text,
  link_anuncio text,
  utm_conteudo text,
  gasto numeric not null default 0,
  impressoes integer not null default 0,
  alcance integer not null default 0,
  cliques integer not null default 0,
  cliques_link integer not null default 0,
  visitas_pagina integer not null default 0,
  conversoes integer not null default 0,
  atualizado_em timestamptz not null default now(),
  primary key (dia, canal, anuncio_id)
);
alter table public.mkt_anuncios_dia enable row level security;

create table if not exists public.mkt_visitas (
  id bigserial primary key,
  criado_em timestamptz not null default now(),
  sessao text not null check (char_length(sessao) between 8 and 64),
  pagina text not null check (char_length(pagina) <= 200),
  origem text check (char_length(origem) <= 80),
  meio text check (char_length(meio) <= 80),
  campanha text check (char_length(campanha) <= 120),
  conteudo text check (char_length(conteudo) <= 120),
  termo text check (char_length(termo) <= 120),
  referrer_host text check (char_length(referrer_host) <= 120),
  dispositivo text check (dispositivo in ('celular', 'computador', 'tablet'))
);
create index if not exists mkt_visitas_criado_em on public.mkt_visitas (criado_em);
alter table public.mkt_visitas enable row level security;
-- O site só grava visitas anônimas; ninguém lê pela API pública.
create policy mkt_visitas_insert on public.mkt_visitas for insert to anon, authenticated with check (true);
grant insert on public.mkt_visitas to anon, authenticated;
grant usage, select on sequence public.mkt_visitas_id_seq to anon, authenticated;

create or replace function public.mkt_chave_ok(p_chave text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.mkt_config
    where chave_hash = encode(extensions.digest(coalesce(p_chave, ''), 'sha256'), 'hex')
  );
$$;

create or replace function public.mkt_painel(p_chave text, p_inicio date, p_fim date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
begin
  if not public.mkt_chave_ok(p_chave) then
    raise exception 'chave invalida' using errcode = '28000';
  end if;
  if p_fim < p_inicio or p_fim - p_inicio > 400 then
    raise exception 'periodo invalido' using errcode = '22023';
  end if;
  return jsonb_build_object(
    'campanhas', coalesce((select jsonb_agg(to_jsonb(c) order by c.canal, c.nome) from public.mkt_campanhas c), '[]'::jsonb),
    'anuncios', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.dia, a.canal, a.anuncio)
      from public.mkt_anuncios_dia a where a.dia between p_inicio and p_fim
    ), '[]'::jsonb),
    'visitas', coalesce((
      select jsonb_agg(v) from (
        select (criado_em at time zone 'America/Sao_Paulo')::date as dia,
               coalesce(origem, '') as origem, coalesce(meio, '') as meio,
               coalesce(campanha, '') as campanha, coalesce(conteudo, '') as conteudo,
               coalesce(referrer_host, '') as referrer_host, dispositivo,
               count(*) as paginas_vistas,
               count(distinct sessao) as sessoes
        from public.mkt_visitas
        where (criado_em at time zone 'America/Sao_Paulo')::date between p_inicio and p_fim
        group by 1, 2, 3, 4, 5, 6, 7
      ) v
    ), '[]'::jsonb),
    'paginas', coalesce((
      select jsonb_agg(v) from (
        select (criado_em at time zone 'America/Sao_Paulo')::date as dia,
               coalesce(origem, '') as origem, coalesce(meio, '') as meio,
               coalesce(campanha, '') as campanha, coalesce(conteudo, '') as conteudo,
               coalesce(referrer_host, '') as referrer_host, pagina,
               count(*) as paginas_vistas,
               count(distinct sessao) as sessoes
        from public.mkt_visitas
        where (criado_em at time zone 'America/Sao_Paulo')::date between p_inicio and p_fim
        group by 1, 2, 3, 4, 5, 6, 7
      ) v
    ), '[]'::jsonb),
    'atualizado_em', (select max(atualizado_em) from public.mkt_anuncios_dia)
  );
end;
$$;

revoke all on function public.mkt_painel(text, date, date) from public;
revoke all on function public.mkt_chave_ok(text) from public;
grant execute on function public.mkt_painel(text, date, date) to anon, authenticated;
grant execute on function public.mkt_chave_ok(text) to anon, authenticated;
