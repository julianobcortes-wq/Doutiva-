import { useCallback, useEffect, useState } from "react";
import {
  emptyWallet, mockTransactions, type GamificationIntensity, type InventoryEntry,
  type LifePointsSource, type Transaction, type Wallet,
} from "@/lib/economy";
import { mockLfcLedger, type LfcEntry, type LfcSource } from "@/lib/valley-v1";

const KEY = "plv.valley-game.v1";

export type GameState = {
  wallet: Wallet;
  transactions: Transaction[];
  inventory: InventoryEntry[];
  equipped: Record<string, string>;
  lifer_coins: number;
  lfc_ledger: LfcEntry[];
  build_id: string;
  season_xp: number;
  claimed_season_rewards: number[];
  journey_chapters: string[];
  best_streak: number;
  active_days_month: number;
  intensity: GamificationIntensity;
  sounds: boolean;
  celebrations: boolean;
};

const defaultState: GameState = {
  wallet: { ...emptyWallet, earned_life_points: 640, purchased_life_points: 650, promotional_life_points: 200 },
  transactions: mockTransactions,
  inventory: [
    { item_id: "moldura-aurora", quantity: 1, acquired_at: "há 3 dias", acquisition_source: "compra", state: "em_uso" },
    { item_id: "biblioteca-longevidade", quantity: 1, acquired_at: "há 12 dias", acquisition_source: "missao", state: "permanente" },
    { item_id: "jantar-valley", quantity: 1, acquired_at: "há 5 dias", acquisition_source: "compra", state: "consumivel", expires_at: "em 24 dias" },
    { item_id: "integracao-wearable", quantity: 1, acquired_at: "há 1 mês", acquisition_source: "evento", state: "disponivel" },
  ],
  equipped: {},
  lifer_coins: 1840,
  lfc_ledger: mockLfcLedger,
  build_id: "longevidade",
  season_xp: 640,
  claimed_season_rewards: [200],
  journey_chapters: ["sono:c1"],
  best_streak: 21,
  active_days_month: 18,
  intensity: "equilibrada",
  sounds: false,
  celebrations: true,
};

function read(): GameState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...(JSON.parse(raw) as Partial<GameState>) };
  } catch {
    return defaultState;
  }
}

/** Estado de jogo da Doutiva (carteira, inventário, temporada, preferências). */
export function useValleyGame() {
  const [state, setState] = useState<GameState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
    const onChange = () => setState(read());
    window.addEventListener("plv:game", onChange);
    return () => window.removeEventListener("plv:game", onChange);
  }, []);

  const update = useCallback((patch: Partial<GameState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      window.dispatchEvent(new Event("plv:game"));
      return next;
    });
  }, []);

  const addLifePoints = useCallback(
    (amount: number, source: LifePointsSource, label: string, detail = "") => {
      setState((prev) => {
        const key = `${source}_life_points` as const;
        const next: GameState = {
          ...prev,
          wallet: { ...prev.wallet, [key]: Math.max(0, prev.wallet[key] + amount) },
          transactions: [
            { id: `t${Date.now()}`, label, detail, amount, source, created_at: "agora" },
            ...prev.transactions,
          ].slice(0, 30),
        };
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch { /* ignore */ }
        window.dispatchEvent(new Event("plv:game"));
        return next;
      });
    },
    [],
  );

  const equip = useCallback(
    (slot: string, value: string) => update({ equipped: { ...state.equipped, [slot]: value } }),
    [state.equipped, update],
  );

  const toggleChapter = useCallback(
    (id: string) =>
      update({
        journey_chapters: state.journey_chapters.includes(id)
          ? state.journey_chapters.filter((c) => c !== id)
          : [...state.journey_chapters, id],
      }),
    [state.journey_chapters, update],
  );

  const addLifeCoins = useCallback(
    (amount: number, source: LfcSource, label: string, detail = "") => {
      setState((prev) => {
        const next: GameState = {
          ...prev,
          lifer_coins: Math.max(0, prev.lifer_coins + amount),
          lfc_ledger: [
            { id: `lfc${Date.now()}`, label, detail, amount, source, created_at: "agora" },
            ...prev.lfc_ledger,
          ].slice(0, 30),
        };
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch { /* ignore */ }
        window.dispatchEvent(new Event("plv:game"));
        return next;
      });
    },
    [],
  );

  const setBuild = useCallback((build_id: string) => update({ build_id }), [update]);

  return { state, hydrated, update, addLifePoints, equip, toggleChapter, addLifeCoins, setBuild };
}
