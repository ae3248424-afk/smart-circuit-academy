import { createFileRoute, Link } from '@tanstack/react-router';
import { Award, BookOpen, CircuitBoard, GraduationCap, ArrowUpLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiplomaNav } from '@/components/DiplomaNav';
import { levels } from '@/lib/diploma';
import { useApp } from '@/lib/app-context';
import { pageHead } from '@/lib/page-head';
import { certificateAttempt, useDiplomaProgress } from '@/lib/diploma-progress';
import cover from '@/assets/mechatronics-book-cover.asset.json';
import source from '@/assets/mechatronics-source.asset.json';

export const Route = createFileRoute('/diploma')({
  head: () => pageHead('دبلومة في ميكاترونيكس من الصفر إلى الاحتراف', 'أربعة مستويات، وستة عشر جزءًا مع القراءة والاستماع واختبارات وشهادات إتمام ومختبر أردوينو.'),
  component: Diploma,
});
function Diploma() {
  const { t } = useApp();
  const { attempts } = useDiplomaProgress();
  return <main className="mx-auto max-w-7xl px-4 py-8">
    <DiplomaNav />
    <section className="mb-10 border-b pb-10">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary"><GraduationCap />SMART LAB / {t('مسار الدبلومة', 'Diploma track')}</p>
      <h1 className="max-w-4xl text-3xl font-extrabold leading-relaxed md:text-5xl">{t('دبلومة في ميكاترونيكس من الصفر إلى الاحتراف', 'Mechatronics diploma: zero to professional')}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{t('الميكانيكا، الإلكترونيات، البرمجة والتحكم — أساس علمي وتطبيقات منخفضة الجهد.', 'Mechanics, electronics, programming and control — scientific foundations and low-voltage experiments.')}</p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm"><span className="flex items-center gap-2"><BookOpen className="size-4 text-primary" />{t('٤ مستويات · ١٦ جزءًا', '4 levels · 16 parts')}</span><span className="flex items-center gap-2"><Award className="size-4 text-accent" />{t('٢٠ امتحانًا وشهادة', '20 exams and certificates')}</span><span className="flex items-center gap-2"><CircuitBoard className="size-4 text-success" />Arduino UNO</span></div>
    </section>
    <section className="grid gap-5 md:grid-cols-2">
      {levels.map((level, i) => {
        const passed = level.parts.filter((_, p) => certificateAttempt(attempts, level.id, p)).length;
        return <article key={level.id} className={`level-tile level-${level.id} rounded-lg border bg-card p-6`}>
          <div className="flex items-start justify-between"><span className="level-number font-mono text-4xl font-bold">0{i + 1}</span><span className="text-sm text-muted-foreground">{t('المستوى', 'Level')} / {level.english}</span></div>
          <h2 className="mt-4 text-2xl font-bold">{t(level.title, level.english)}</h2><p className="mt-2 text-muted-foreground">{level.subtitle}</p>
          <ul className="my-5 space-y-2 text-sm">{level.parts.map((part, p) => <li key={part.title} className="flex gap-2"><span className="text-muted-foreground">0{p + 1}</span><Link to="/diploma/$level/part/$part" params={{ level: level.id, part: String(p + 1) }} className="hover:text-primary">{part.title}</Link></li>)}</ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><span className="text-xs text-muted-foreground">{t(`${passed}/٤ أجزاء مجتازة · امتحان مستوى ٥٠ سؤالًا`, `${passed}/4 parts passed · 50-question level exam`)}</span><Button asChild><Link to="/diploma/$level" params={{ level: level.id }}>{t('دخول المستوى', 'Open level')}<ArrowUpLeft /></Link></Button></div>
        </article>;
      })}
    </section>
    <section className="mt-10 flex items-start gap-5 border-t pt-8">
      <img src={cover.url} alt="غلاف الشامل في هندسة الميكاترونكس" className="h-36 w-24 shrink-0 rounded-md object-cover" />
      <div><h2 className="font-bold">{t('المرجع العلمي', 'Source reference')}</h2><p className="mt-2 text-sm">الشامل في هندسة الميكاترونكس — تكنولوجيا العلم المعاصر</p><p className="mt-1 text-sm text-muted-foreground">أ.م. عبدالجبار حسين الظفري</p><p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t('شروح مؤلَّفة مستندة إلى موضوعات الكتاب مع تطبيقات عملية مكملة، وليست نقلًا حرفيًا. شهادة المنصة تعليمية وليست درجة جامعية أو ترخيصًا مهنيًا.', 'Original explanations based on the book’s topics, with supplementary exercises. Smart Lab certificates are educational completion certificates, not academic degrees or professional licenses.')}</p><Button asChild variant="link" className="mt-2 px-0"><a href={source.url} target="_blank" rel="noreferrer"><BookOpen />{t('الكتاب المرجعي PDF', 'Source book PDF')}</a></Button></div>
    </section>
  </main>;
}