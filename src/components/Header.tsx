import { Link } from "@tanstack/react-router";
import { Cpu, Languages, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { VoicePlayer } from "./VoicePlayer";

export function Header() {
  const { t, toggleLang, toggleDark, dark, lang } = useApp();
  const [open, setOpen] = useState(false);
  const nav = [
    { to: "/reader", label: t("قارئ الكتب", "Book Reader") },
    { to: "/lessons", label: t("الشروحات والمحاكاة", "Lessons & Sim") },
    { to: "/videos", label: t("الفيديوهات", "Videos") },
    { to: "/quiz", label: t("الاختبارات", "Quizzes") },
    { to: "/certificate", label: t("الشهادة", "Certificate") },
    { to: "/courses", label: t("الكورسات العالمية", "Global Courses") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="glass mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2">
            <span className="bg-brand grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground">
              <Cpu className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight md:text-base">
                {t("دورة في الميكاترونكس من Full-stack Ashraf Elsayed", "Mechatronics Course by Full-stack Ashraf Elsayed")}
              </span>
              <span className="block text-xs text-muted-foreground">{t("المعمل الذكي — Smart Lab", "Smart Lab")}</span>
            </span>
          </Link>
          <div className="hidden md:block"><VoicePlayer /></div>
          <button onClick={toggleLang} aria-label="language" className="flex h-10 items-center gap-1 rounded-xl bg-secondary px-3 text-sm font-semibold hover:bg-muted">
            <Languages className="h-4 w-4" />{lang === "ar" ? "EN" : "ع"}
          </button>
          <button onClick={toggleDark} aria-label="theme" className="grid h-10 w-10 place-items-center rounded-xl bg-secondary hover:bg-muted">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={() => setOpen(!open)} aria-label="menu" className="grid h-10 w-10 place-items-center rounded-xl bg-secondary lg:hidden">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        <nav className={`${open ? "flex" : "hidden"} mt-3 flex-col gap-1 lg:flex lg:flex-row lg:flex-wrap`}>
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-primary/15 !text-primary font-semibold" }}>
              {n.label}
            </Link>
          ))}
          <div className="pt-2 md:hidden"><VoicePlayer /></div>
        </nav>
      </div>
    </header>
  );
}
