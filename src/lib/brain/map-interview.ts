/** Fixed interview framing — clear size like an NPS, not an open chat. */
export const MAP_INTERVIEW_QUESTIONS = 8;
export const MAP_INTERVIEW_MINUTES = 10;

export function mapInterviewSentence(): string {
  return `Responda o mapa com ${MAP_INTERVIEW_QUESTIONS} perguntas (~${MAP_INTERVIEW_MINUTES} min) para montarmos a trilha mais relevante pro seu perfil na Doutiva.`;
}

export function mapProgressLabel(done: number, total = MAP_INTERVIEW_QUESTIONS): string {
  const safeDone = Math.max(0, Math.min(done, total));
  const current = safeDone >= total ? total : safeDone + 1;
  return `Pergunta ${current} de ${total}`;
}

export function mapProgressPct(done: number, total = MAP_INTERVIEW_QUESTIONS): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, done) / total) * 100));
}
