import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, BookOpen, CircuitBoard, Globe, PlayCircle, Trophy, GraduationCap, ArrowUpLeft } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Card } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { levels } from "@/lib/diploma";
import cover from "@/assets/mechatronics-book-cover.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Lab — دورة الميكاترونكس | Ashraf Elsayed" },
      { name: "description", content: "Interactive mechatronics, electronics and Arduino course with quizzes and certificate." },
      { property: "og:title", content: "Smart Lab — Mechatronics Course" },
      { property: "og:description", content: "Learn electronics, sensors, motors and Arduino interactively." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useApp();
  const cards = [
    { to: "/reader", icon: BookOpen, title: t("قارئ الكتب الذكي", "AI Book Reader"), d: t("ارفع كتابك وحوّله لدروس مبسطة", "Upload a book, get simple lessons") },
    { to: "/lessons", icon: CircuitBoard, title: t("الشروحات والمحاكاة", "Lessons & Simulator"), d: t("إلكترونيات، حساسات، محركات، أردوينو", "Electronics, sensors, motors, Arduino") },
    { to: "/videos", icon: PlayCircle, title: t("مكتبة الفيديوهات", "Video Library"), d: t("تجارب عملية مختارة", "Curated hands-on experiments") },
    { to: "/quiz", icon: Trophy, title: t("الاختبارات الشاملة", "Quizzes & Final Exam"), d: t("أسئلة وتحديات برمجية وشارات", "MCQs, coding challenges, badges") },
    { to: "/certificate", icon: Award, title: t("شهادة الإتمام", "Certificate"), d: t("احصل على 80% أو أكثر", "Score 80%+ to earn it") },
    { to: "/courses", icon: Globe, title: t("الكورسات العالمية", "Global Courses"), d: "Google · Microsoft · MIT · Coursera" },
  ] as const;
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center md:py-16">
        <span className="inline-block rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">Smart Lab · المعمل الذكي</span>
        <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-extrabold leading-tight md:text-6xl">
          {t("ابنِ روبوتك الأول مع", "Build your first robot with")} <span className="text-gradient">{t("دورة الميكاترونكس", "Mechatronics")}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
          {t("من Full-stack Ashraf Elsayed — تعلّم الإلكترونيات والحساسات والمحركات وبرمجة الأردوينو بشكل تفاعلي.",
            "By Full-stack Ashraf Elsayed — learn electronics, sensors, motors and Arduino programming interactively.")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/lessons" className="bg-brand rounded-xl px-6 py-3 font-bold text-primary-foreground">{t("ابدأ التعلم", "Start learning")}</Link>
          <Link to="/quiz" className="glass px-6 py-3 font-bold">{t("الامتحان النهائي", "Final exam")}</Link>
        </div>
      </motion.section>
      <section className="mb-8 grid gap-6 border-y py-7 md:grid-cols-[150px_1fr]">
        <Link to="/diploma" className="hidden md:block"><img src={cover.url} alt="الشامل في هندسة الميكاترونكس" className="h-52 w-36 rounded-md object-cover" /></Link>
        <div className="min-w-0"><p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary"><GraduationCap />{t("دبلومة المعمل الذكي", "Smart Lab diploma")}</p>
          <h2 className="text-2xl font-extrabold leading-relaxed md:text-3xl"><Link to="/diploma">{t("دبلومة في ميكاترونيكس من الصفر إلى الاحتراف", "Mechatronics diploma: zero to professional")}</Link></h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("٤ مستويات · ٤ أجزاء لكل مستوى · قراءة واستماع · امتحانات وشهادات", "4 levels · 4 parts per level · reading & listening · exams & certificates")}</p>
          <div className="mt-5 flex flex-wrap gap-2">{levels.map((level, i) => <Button asChild variant="outline" key={level.id}><Link to="/diploma/$level" params={{ level: level.id }}><span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>{t(level.title, level.english)}<ArrowUpLeft /></Link></Button>)}</div>
          <div className="mt-4 flex flex-wrap gap-2"><Button asChild><Link to="/diploma"><BookOpen />{t("الدبلومة كاملة", "Full diploma")}</Link></Button><Button asChild variant="ghost"><Link to="/lab"><CircuitBoard />{t("مختبر أردوينو", "Arduino lab")}</Link></Button><Button asChild variant="ghost"><Link to="/diploma/certificates"><Award />{t("شهادات الدبلومة", "Diploma certificates")}</Link></Button></div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div key={c.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={c.to}>
              <Card className="h-full">
                <c.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-3 text-lg font-bold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
