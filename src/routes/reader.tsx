import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CheckCircle2, ChevronDown, FileUp, Lightbulb, Loader2, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Section } from "@/components/Section";
import { VoicePlayer } from "@/components/VoicePlayer";
import { generateLessons, type LessonPlan } from "@/lib/book-ai.functions";

export const Route = createFileRoute("/reader")({
  head: () => ({
    meta: [
      { title: "AI Book Reader — Smart Lab" },
      { name: "description", content: "Upload a mechatronics book and AI turns it into step-by-step lessons with key concepts and practice questions." },
      { property: "og:title", content: "AI Book Reader — Smart Lab" },
      { property: "og:description", content: "Turn mechatronics books into AI-generated lessons." },
    ],
  }),
  component: Reader,
});

const toBase64 = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = rej;
    r.readAsDataURL(f);
  });

function Reader() {
  const { t, lang } = useApp();
  const gen = useServerFn(generateLessons);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [open, setOpen] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onFile = async (f?: File) => {
    if (!f || loading) return;
    if (f.size > 10 * 1024 * 1024) return setErr(t("الملف أكبر من 10 ميجا.", "File is larger than 10MB."));
    setErr(""); setName(f.name); setPlan(null); setLoading(true);
    try {
      const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
      const r = await gen({ data: isPdf ? { fileName: f.name, lang, pdfBase64: await toBase64(f) } : { fileName: f.name, lang, text: await f.text() } });
      if (r.error) setErr(r.error);
      else if (r.plan) { setPlan(r.plan); setOpen(0); }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  };

  return (
    <Section icon={<BookOpen />} title={t("قارئ الكتب الذكي في الميكاترونكس", "AI Mechatronics Book Reader")}
      subtitle={t("ارفع كتاباً (PDF أو نص) وسيحوّله الذكاء الاصطناعي لدروس ومفاهيم وأسئلة تدريبية", "Upload a book (PDF or text) and AI turns it into lessons, key concepts and practice questions")}>
      <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
        className={`glass flex flex-col items-center gap-3 border-2 border-dashed border-primary/40 p-10 text-center ${loading ? "opacity-70" : "cursor-pointer"}`}>
        {loading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <FileUp className="h-12 w-12 text-primary" />}
        <span className="font-bold">
          {loading ? t("جارٍ تحليل الكتاب وإنشاء الدروس…", "Analyzing the book and building lessons…") : name || t("اسحب الملف هنا أو اضغط للاختيار", "Drop a file here or click to choose")}
        </span>
        <span className="text-xs text-muted-foreground">PDF · TXT · MD — {t("حتى 10 ميجا", "up to 10MB")}</span>
        <input type="file" disabled={loading} accept=".pdf,.txt,.md,text/plain,application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {err && <p className="mt-4 rounded-xl bg-destructive/15 p-3 text-destructive">{err}</p>}

      {plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
          <div className="glass p-5">
            <div className="flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5" /><h2 className="text-xl font-bold">{plan.bookTitle}</h2></div>
            <p className="mt-2 text-muted-foreground">{plan.summary}</p>
          </div>
          {plan.lessons.map((l, i) => (
            <div key={i} className="glass overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center gap-3 p-4 text-start">
                <span className="bg-brand grid h-8 w-8 shrink-0 place-items-center rounded-lg font-bold text-primary-foreground">{i + 1}</span>
                <span className="flex-1 font-bold">{l.title}</span>
                <ChevronDown className={`h-5 w-5 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="space-y-5 px-4 pb-5">
                      <ol className="space-y-2">
                        {l.steps.map((s, j) => (
                          <li key={j} className="flex gap-2 rounded-lg bg-secondary/60 p-3 text-sm">
                            <span className="shrink-0 font-bold text-primary">{t("خطوة", "Step")} {j + 1}:</span><span>{s}</span>
                          </li>
                        ))}
                      </ol>
                      <VoicePlayer text={l.steps.join(" ")} />
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 font-bold"><Lightbulb className="h-4 w-4 text-accent" />{t("المفاهيم الأساسية", "Key concepts")}</h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {l.keyConcepts.map((k, j) => (
                            <div key={j} className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm"><b>{k.term}:</b> {k.meaning}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 font-bold">{t("أسئلة تدريبية", "Practice questions")}</h4>
                        <div className="space-y-3">{l.questions.map((q, j) => <PracticeQ key={j} q={q} />)}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}
    </Section>
  );
}

function PracticeQ({ q }: { q: LessonPlan["lessons"][number]["questions"][number] }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="rounded-xl bg-secondary/40 p-3">
      <p className="mb-2 text-sm font-semibold">{q.question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const show = pick !== null;
          const cls = show && i === q.answerIndex ? "border-success bg-success/15" : pick === i ? "border-destructive bg-destructive/15" : "border-border hover:border-primary";
          return (
            <button key={i} onClick={() => setPick(i)} className={`flex items-center justify-between rounded-lg border-2 p-2 text-start text-sm ${cls}`}>
              {o}
              {show && i === q.answerIndex && <CheckCircle2 className="h-4 w-4 text-success" />}
              {pick === i && i !== q.answerIndex && <XCircle className="h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>
      {pick !== null && <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>}
    </div>
  );
}
