/**
 * Hub de dados de marketing (projeto Supabase separado, só para marketing).
 * Guarda visitas anônimas do site e números diários das campanhas (Meta, Google),
 * lidos pelo painel de marketing. Nenhum dado de usuário da plataforma vai para lá.
 *
 * URL e chave publicável são públicas por natureza: o banco só aceita gravar
 * visitas anônimas e só devolve números com a chave do painel.
 */
export const MKT_HUB_URL = "https://ynmlbkfdjxzmsndcquap.supabase.co";
export const MKT_HUB_PUBLISHABLE_KEY = "sb_publishable_UQnXK9w1OsooclrUrqD8Pw_Act2YQvh";

/** Páginas que não contam como visita (painel interno e área logada). */
export function paginaRastreavel(pathname: string): boolean {
  if (pathname.startsWith("/painel-marketing")) return false;
  if (pathname.startsWith("/resultados-")) return false;
  if (pathname.startsWith("/api/")) return false;
  return true;
}
