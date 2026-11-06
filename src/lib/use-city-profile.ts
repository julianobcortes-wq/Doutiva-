import { useCallback, useEffect, useState } from "react";
import { defaultAttributesFor, defaultProfile, type CityProfile } from "@/lib/city";

const KEY = "plv.valley-profile.v2";

function read(): CityProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProfile;
    const merged = { ...defaultProfile, ...(JSON.parse(raw) as Partial<CityProfile>) };
    // garante que os atributos correspondam à classe atual
    const base = defaultAttributesFor(merged.user_class);
    merged.attributes = { ...base, ...Object.fromEntries(
      Object.entries(merged.attributes ?? {}).filter(([k]) => k in base),
    ) };
    return merged;
  } catch {
    return defaultProfile;
  }
}

/** Perfil da cidade (mock tipado, persistido localmente até a integração com o banco). */
export function useCityProfile() {
  const [profile, setProfile] = useState<CityProfile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(read());
    setHydrated(true);
    const onChange = () => setProfile(read());
    window.addEventListener("plv:profile", onChange);
    return () => window.removeEventListener("plv:profile", onChange);
  }, []);

  const update = useCallback((patch: Partial<CityProfile>) => {
    const next = { ...read(), ...patch };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch { /* ignore */ }
    setProfile(next);
    // avisa as outras instâncias fora do ciclo de render atual
    queueMicrotask(() => window.dispatchEvent(new Event("plv:profile")));
  }, []);

  const addXp = useCallback(
    (amount: number) =>
      update({
        xp: Math.max(0, profile.xp + amount),
        life_points: Math.max(0, profile.life_points + Math.round(amount / 2)),
      }),
    [profile.xp, profile.life_points, update],
  );

  return { profile, update, addXp, hydrated };
}

/** Nome atual do hook de perfil da Doutiva. */
export const useValleyProfile = useCityProfile;

/** Define a classe do habitante fora do React (ex.: no login). */
export function setStoredClass(userClass: CityProfile["user_class"]) {
  if (typeof window === "undefined") return;
  const current = read();
  if (current.user_class === userClass) return;
  const next: CityProfile = {
    ...current,
    user_class: userClass,
    attributes: defaultAttributesFor(userClass),
    unlocked_skills: [],
    completed_missions: [],
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* ignore */ }
  window.dispatchEvent(new Event("plv:profile"));
}
