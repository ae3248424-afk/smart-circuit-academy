import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Lock, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { Section } from "@/components/Section";
import { PASS } from "@/lib/quiz";

export const Route = createFileRoute("/certificate")({
  head: () => ({
    meta: [
      { title: "Certificate of Completion — Smart Lab" },
      { name: "description", content: "Generate your printable mechatronics certificate after passing the final exam." },
      { property: "og:title", content: "Certificate of Completion — Smart Lab" },
      { property: "og:description", content: "Signed by Full-stack Ashraf Elsayed - Smart Lab." },
    ],
  }),
  component: Certificate,
});

function Certificate() {
  const { t } = useApp();
  const [score, setScore] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setScore(Number(localStorage.getItem("finalScore") ?? 0)), []);
  const date = new Date().toLocaleDateString();

  if (score === null) return null;
  return (
    <Section icon={<Award />} title={t("شهادة التخرج والإتمام", "Graduation Certificate")}>
      {score < PASS ? (
        <div className="glass p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3">{t(`نتيجتك الحالية ${score}%. تحتاج ${PASS}% على الأقل.`, `Your score is ${score}%. You need at least ${PASS}%.`)}</p>
          <Link to="/quiz" className="bg-brand mt-4 inline-block rounded-xl px-5 py-2 font-bold text-primary-foreground">{t("ادخل الامتحان", "Take the exam")}</Link>
        </div>
      ) : !ready ? (
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) setReady(true); }} className="glass mx-auto max-w-md space-y-4 p-6">
          <p className="font-bold">{t(`مبروك! نتيجتك ${score}%. أدخل اسمك الكامل:`, `Congrats! You scored ${score}%. Enter your full name:`)}</p>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required
            className="w-full rounded-xl border border-input bg-background px-4 py-3" placeholder={t("الاسم الكامل", "Full name")} />
          <button className="bg-brand w-full rounded-xl py-3 font-bold text-primary-foreground">{t("إنشاء الشهادة", "Generate certificate")}</button>
        </form>
      ) : (
        <>
          <div id="certificate" className="mx-auto aspect-[1.414] max-w-4xl bg-cert p-3 text-cert-ink shadow-2xl md:p-6">
            <div className="flex h-full flex-col items-center justify-center gap-2 border-4 border-double border-accent p-4 text-center md:gap-4">
              <Award className="h-10 w-10 text-accent md:h-16 md:w-16" />
              <h2 className="text-xl font-extrabold md:text-4xl">{t("شهادة إتمام", "Certificate of Completion")}</h2>
              <p className="text-xs md:text-base">{t("تشهد هذه الشهادة بأن", "This certifies that")}</p>
              <p className="font-[Amiri] text-2xl font-bold text-primary md:text-5xl">{name}</p>
              <p className="max-w-xl text-xs md:text-base">
                {t(`قد أتم بنجاح دورة الميكاترونكس والإلكترونيات بنسبة ${score}%`, `has successfully completed the Mechatronics & Electronics course with a score of ${score}%`)}
              </p>
              <div className="mt-2 flex w-full justify-between px-2 text-[10px] md:mt-6 md:px-10 md:text-sm">
                <div><div className="border-t border-cert-ink/40 pt-1">{date}</div><div>{t("التاريخ", "Date")}</div></div>
                <div><div className="font-[Amiri] text-sm md:text-xl">Ashraf Elsayed</div>
                  <div className="border-t border-cert-ink/40 pt-1">Full-stack Ashraf Elsayed - Smart Lab</div></div>
              </div>
            </div>
          </div>
          <button onClick={() => window.print()} className="bg-brand mx-auto mt-6 flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-primary-foreground">
            <Printer className="h-5 w-5" />{t("طباعة / حفظ PDF", "Print / Save PDF")}
          </button>
        </>
      )}
    </Section>
  );
}
