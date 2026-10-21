import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Award, BookOpen, CheckCircle2, CircuitBoard, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiplomaNav } from '@/components/DiplomaNav';
import { getLevel } from '@/lib/diploma';
import { certificateAttempt, useDiplomaProgress } from '@/lib/diploma-progress';
import { pageHead } from '@/lib/page-head';
import { useApp } from '@/lib/app-context';

export const Route = createFileRoute('/diploma_/$level')({
  loader: ({ params }) => { const level = getLevel(params.level); if (!level) throw notFound(); return level; },
  head: ({ loaderData }) => pageHead(`المستوى ${loaderData?.title ?? 'غير متاح'} | دبلومة الميكاترونكس`, loaderData?.subtitle ?? 'مستويات دبلومة الميكاترونكس في Smart Lab.'),
  component: LevelPage,
});
function LevelPage() {
  const level = Route.useLoaderData();
  const { t } = useApp();
  const { attempts } = useDiplomaProgress();
  return <main className="mx-auto max-w-7xl px-4 py-8"><DiplomaNav level={level} />
    <header className={`level-${level.id} mb-8 border-b pb-8`}><p className="level-number mb-2 font-mono text-sm">SMART LAB / {level.english.toUpperCase()}</p><h1 className="text-3xl font-extrabold md:text-4xl">{t(`المستوى ${level.title}`, `${level.english} level`)}</h1><p className="mt-3 text-lg text-muted-foreground">{level.subtitle}</p><p className="mt-3 flex items-center gap-2 text-sm"><CircuitBoard className="size-4 text-primary" />{t('المشروع التطبيقي:', 'Applied project:')} {level.project}</p></header>
    <div className="grid gap-5 md:grid-cols-2">{level.parts.map((part, index) => {
      const passed = certificateAttempt(attempts, level.id, index);
      return <article key={part.title} className="rounded-lg border bg-card p-6"><div className="flex justify-between gap-2 text-sm"><span className="font-mono text-primary">{t('الجزء', 'PART')} 0{index + 1}</span>{passed && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="size-4" />{passed.score}%</span>}</div><h2 className="mt-3 text-xl font-bold">{part.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">{part.introduction}</p><div className="mt-5 flex flex-wrap gap-2"><Button asChild><Link to="/diploma/$level/part/$part" params={{ level: level.id, part: String(index + 1) }}><BookOpen />{t('القراءة والاستماع', 'Read & listen')}</Link></Button><Button asChild variant="outline"><Link to="/diploma/$level/exam/$exam" params={{ level: level.id, exam: String(index + 1) }}><Trophy />{t('امتحان الجزء', 'Part exam')}</Link></Button>{passed && <Button asChild variant="ghost"><Link to="/diploma/$level/certificate/$exam" params={{ level: level.id, exam: String(index + 1) }}><Award />{t('الشهادة', 'Certificate')}</Link></Button>}</div></article>;
    })}</div>
    <section className="mt-10 flex flex-wrap items-center justify-between gap-6 border-y py-8"><div><h2 className="text-xl font-bold">{t('امتحان المستوى', 'Level exam')}</h2><p className="mt-2 text-sm text-muted-foreground">{t('٥٠ سؤالًا · النجاح من ٨٠٪ · شهادة مستقلة للمستوى', '50 questions · 80% pass mark · level certificate')}</p></div><div className="flex flex-wrap gap-2"><Button asChild><Link to="/diploma/$level/exam/$exam" params={{ level: level.id, exam: 'level' }}><Trophy />{t('ابدأ امتحان المستوى', 'Start level exam')}</Link></Button><Button asChild variant="outline"><Link to="/lab"><CircuitBoard />{t('التجربة العملية', 'Practical experiment')}</Link></Button><Button asChild variant="ghost"><Link to="/diploma/$level/certificate/$exam" params={{ level: level.id, exam: 'level' }}><Award />{t('شهادة المستوى', 'Level certificate')}</Link></Button></div></section>
  </main>;
}