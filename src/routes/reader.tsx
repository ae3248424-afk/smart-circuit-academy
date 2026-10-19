import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, FileUp } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Section } from "@/components/Section";
import { VoicePlayer } from "@/components/VoicePlayer";

export const Route = createFileRoute("/reader")({
  head: () => ({
    meta: [
      { title: "AI Book Reader — Smart Lab" },
      { name: "description", content: "Upload mechatronics books and split them into simple step-by-step lessons." },
      { property: "og:title", content: "AI Book Reader — Smart Lab" },
      { property: "og:description", content: "Turn mechatronics books into bite-size lessons." },
    ],
  }),
  component: Reader,
});

type Lesson = { title: string; steps: string[] };

function toLessons(text: string): Lesson[] {
  const clean = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  const paras = clean.split(/\n\s*\n|(?<=[.!؟?])\s+(?=[A-Zا-ي])/).map((p) => p.trim()).filter((p) => p.length > 20);
  const lessons: Lesson[] = [];
  for (let i = 0; i < paras.length && lessons.length < 12; i += 3) {
    const chunk = paras.slice(i, i + 3);
    const steps = chunk.flatMap((p) => p.split(/(?<=[.!؟?])\s+/)).filter((s) => s.length > 10).slice(0, 5);
    const title = chunk[0].split(/\s+/).slice(0, 7).join(" ");
    lessons.push({ title, steps });
  }
  return lessons;
}

async function extractPdf(file: File): Promise<string> {
  const raw = await file.text();
  const parts = [...raw.matchAll(/\(([^()]{3,})\)\s*Tj/g)].map((m) => m[1]);
  return parts.join(" ");
}

function Reader() {
  const { t } = useApp();
  const [name, setName] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [open, setOpen] = useState(0);
  const [err, setErr] = useState("");

  const onFile = async (f?: File) => {
    if (!f) return;
    setErr(""); setName(f.name);
    const text = f.type === "application/pdf" || f.name.endsWith(".pdf") ? await extractPdf(f) : await f.text();
    const ls = toLessons(text);
    if (!ls.length) setErr(t("تعذّر استخراج نص كافٍ. جرّب ملفاً نصياً (TXT/MD).", "Couldn't extract enough text. Try a TXT/MD file."));
    setLessons(ls); setOpen(0);
  };

  return (
    <Section icon={<BookOpen />} title={t("قارئ الكتب الذكي في الميكاترونكس", "AI Mechatronics Book Reader")}
      subtitle={t("ارفع كتاباً (PDF أو نص) وسنقسّمه لدروس خطوة بخطوة", "Upload a book (PDF or text) and get step-by-step lessons")}>
      <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
        className="glass flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed border-primary/40 p-10 text-center">
        <FileUp className="h-12 w-12 text-primary" />
        <span className="font-bold">{name || t("اسحب الملف هنا أو اضغط للاختيار", "Drop a file here or click to choose")}</span>
        <span className="text-xs text-muted-foreground">PDF · TXT · MD</span>
        <input type="file" accept=".pdf,.txt,.md,text/plain,application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {err && <p className="mt-4 text-destructive">{err}</p>}
      <div className="mt-6 space-y-3">
        {lessons.map((l, i) => (
          <div key={i} className="glass overflow-hidden">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center gap-3 p-4 text-start">
              <span className="bg-brand grid h-8 w-8 shrink-0 place-items-center rounded-lg font-bold text-primary-foreground">{i + 1}</span>
              <span className="flex-1 font-bold">{l.title}…</span>
              <ChevronDown className={`h-5 w-5 transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <ol className="space-y-2 px-4 pb-4">
                    {l.steps.map((s, j) => (
                      <li key={j} className="flex gap-2 rounded-lg bg-secondary/60 p-3 text-sm">
                        <span className="font-bold text-primary">{t("خطوة", "Step")} {j + 1}:</span><span>{s}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="px-4 pb-4"><VoicePlayer text={l.steps.join(" ")} /></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
}
