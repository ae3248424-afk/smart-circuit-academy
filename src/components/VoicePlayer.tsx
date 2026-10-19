import { Pause, Play, Volume2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { speak, useApp } from "@/lib/app-context";

export function VoicePlayer({ text }: { text?: string }) {
  const { t, lang } = useApp();
  const [playing, setPlaying] = useState(false);
  const fallback = t(
    "مرحباً بك في المعمل الذكي. الميكاترونكس هو دمج الميكانيكا والإلكترونيات والبرمجة لبناء أنظمة ذكية مثل الروبوتات.",
    "Welcome to the Smart Lab. Mechatronics combines mechanics, electronics and programming to build smart systems like robots.",
  );
  const toggle = () => {
    if (playing) { window.speechSynthesis?.cancel(); setPlaying(false); return; }
    const u = speak(text ?? fallback, lang);
    if (!u) return;
    setPlaying(true);
    u.onend = () => setPlaying(false);
  };
  return (
    <button onClick={toggle} className="flex h-10 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 text-sm font-semibold text-primary">
      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      <span className="flex h-4 items-end gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.span key={i} className="w-0.5 rounded bg-primary"
            animate={playing ? { height: ["20%", "100%", "40%"] } : { height: "30%" }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} />
        ))}
      </span>
      <Volume2 className="h-4 w-4" />
      <span className="hidden sm:inline">{t("الراوي الذكي", "AI Voice")}</span>
    </button>
  );
}
