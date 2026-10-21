import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Medal, Trophy, XCircle } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Section } from "@/components/Section";
import { CodeBlock } from "@/components/CodeBlock";
import { badgeFor, PASS, questions, scorePercent } from "@/lib/quiz";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quizzes & Final Exam — Smart Lab" },
      { name: "description", content: "Multiple-choice and coding challenges with live progress and badges." },
      { property: "og:title", content: "Quizzes & Final Exam — Smart Lab" },
      { property: "og:description", content: "Test your mechatronics knowledge and earn badges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiz,
});

function Quiz() {
  const { t } = useApp();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const answered = Object.keys(answers).length;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const pct = scorePercent(correct, questions.length);
  const badge = badgeFor(pct);

  const submit = () => {
    setDone(true);
    localStorage.setItem("finalScore", String(pct));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const badgeLabel = { gold: t("ذهبية — خبير", "Gold — Expert"), silver: t("فضية — متمكن", "Silver — Proficient"), bronze: t("برونزية — مبتدئ", "Bronze — Beginner"), none: t("حاول مجدداً", "Try again") }[badge];

  return (
    <Section icon={<Trophy />} title={t("الاختبارات الشاملة والامتحان النهائي", "Quizzes & Final Exam")}
      subtitle={t(`احصل على ${PASS}% أو أكثر لتنال الشهادة`, `Score ${PASS}%+ to earn your certificate`)}>
      <div className="glass sticky top-28 z-30 mb-6 p-4 lg:top-32">
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>{t("نسبة الإنجاز", "Completion")}</span><span>{answered}/{questions.length}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <motion.div className="bg-brand h-full" animate={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
      </div>

      {done && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass mb-6 p-6 text-center">
          <Medal className={`mx-auto h-16 w-16 ${badge === "none" ? "text-muted-foreground" : "text-accent"}`} />
          <div className="mt-2 text-5xl font-extrabold text-gradient">{pct}%</div>
          <div className="mt-1 font-bold">{badgeLabel}</div>
          <div className="mt-4 flex justify-center gap-3">
            {pct >= PASS && <Link to="/certificate" className="bg-brand rounded-xl px-5 py-2 font-bold text-primary-foreground">{t("احصل على الشهادة", "Get certificate")}</Link>}
            <button onClick={() => { setAnswers({}); setDone(false); }} className="rounded-xl bg-secondary px-5 py-2 font-bold">{t("إعادة", "Retry")}</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="glass p-5">
            <h3 className="mb-3 font-bold">{i + 1}. {t(q.ar, q.en)}</h3>
            {q.code && <div className="mb-3"><CodeBlock code={q.code} /></div>}
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, j) => {
                const sel = answers[i] === j;
                const show = answers[i] !== undefined;
                const right = j === q.answer;
                const cls = show && right ? "border-success bg-success/15" : sel ? "border-destructive bg-destructive/15" : "border-border hover:border-primary";
                return (
                  <button key={j} disabled={done} onClick={() => setAnswers({ ...answers, [i]: j })}
                    className={`flex items-center justify-between rounded-xl border-2 p-3 text-start text-sm ${cls}`}>
                    <span dir="ltr">{o}</span>
                    {show && right && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {sel && !right && <XCircle className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!done && (
        <button disabled={answered < questions.length} onClick={submit}
          className="bg-brand mt-6 w-full rounded-xl py-4 text-lg font-bold text-primary-foreground disabled:opacity-40">
          {t("تسليم الامتحان", "Submit exam")}
        </button>
      )}
    </Section>
  );
}
