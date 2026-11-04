/** Spaced repetition (SM-2 simplified). Correct answers push the case further away; a miss brings it back tomorrow. */
export type CardState = { ease: number; interval_days: number; reps: number; lapses: number };

export function nextReview(card: CardState, correct: boolean): CardState {
  if (!correct) {
    return { ease: Math.max(1.3, card.ease - 0.2), interval_days: 1, reps: 0, lapses: card.lapses + 1 };
  }
  const reps = card.reps + 1;
  const interval_days = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(card.interval_days * card.ease);
  return { ease: Math.min(3, card.ease + 0.1), interval_days, reps, lapses: card.lapses };
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
