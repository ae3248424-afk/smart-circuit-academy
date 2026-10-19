import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "ar" | "en";
type Ctx = {
  lang: Lang;
  dark: boolean;
  toggleLang: () => void;
  toggleDark: () => void;
  t: (ar: string, en: string) => string;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const l = localStorage.getItem("lang") as Lang | null;
    const d = localStorage.getItem("dark");
    if (l) setLang(l);
    if (d) setDark(d === "1");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("lang", lang);
    localStorage.setItem("dark", dark ? "1" : "0");
  }, [lang, dark]);

  return (
    <AppCtx.Provider
      value={{
        lang,
        dark,
        toggleLang: () => setLang((l) => (l === "ar" ? "en" : "ar")),
        toggleDark: () => setDark((d) => !d),
        t: (ar, en) => (lang === "ar" ? ar : en),
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}

export function speak(text: string, lang: Lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "ar" ? "ar-SA" : "en-US";
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
  return u;
}
