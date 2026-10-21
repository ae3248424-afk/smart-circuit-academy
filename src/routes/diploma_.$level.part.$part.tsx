import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { BookOpen, Headphones, Trophy, CircuitBoard, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiplomaNav } from '@/components/DiplomaNav';
import { DiplomaAudio } from '@/components/DiplomaAudio';
import { getLevel } from '@/lib/diploma';
import { pageHead } from '@/lib/page-head';
import { useApp } from '@/lib/app-context';

export const Route = createFileRoute('/diploma_/$level/part/$part')({
  loader: ({ params }) => {
    const level = getLevel(params.level);
    const index = /^[1-4]$/.test(params.part) ? Number(params.part) - 1 : -1;
    const part = level?.parts[index];
    if (!level || !part) throw notFound();
    return { level, part, index };
  },
  head: ({ loaderData: d }) => pageHead(d ? `${d.part.title} | المستوى ${d.level.title}` : 'الجزء غير متاح', d?.part.introduction ?? 'دروس الدبلومة بالقراءة والاستماع.'),
  component: PartPage,
});
function PartPage() {
  const { level, part, index } = Route.useLoaderData();
  const { t } = useApp();
  const [mode, setMode] = useState<'read' | 'listen'>('read');
  const [expanded, setExpanded] = useState(false);
  const paragraphs = [part.title, part.introduction, ...part.steps, ...part.concepts.map(c => `${c.question} ${c.explanation}`)];
  return <main className="mx-auto max-w-7xl px-4 py-8"><DiplomaNav level={level} /><div className="grid items-start gap-8 lg:grid-cols-[1fr_280px]">
    <article className="min-w-0"><p className="text-sm font-bold text-primary">{t(`المستوى ${level.title} / الجزء ${index + 1}`, `${level.english} / part ${index + 1}`)}</p><h1 className="mt-3 text-3xl font-extrabold leading-relaxed md:text-4xl">{part.title}</h1>
      <div className="mt-6 inline-flex gap-1 rounded-lg border bg-muted p-1" role="group" aria-label={t('طريقة الشرح', 'Lesson mode')}><Button variant={mode === 'read' ? 'default' : 'ghost'} onClick={() => setMode('read')} aria-pressed={mode === 'read'}><BookOpen />{t('قراءة', 'Read')}</Button><Button variant={mode === 'listen' ? 'default' : 'ghost'} onClick={() => setMode('listen')} aria-pressed={mode === 'listen'}><Headphones />{t('استماع', 'Listen')}</Button></div>
      {mode === 'listen' && <DiplomaAudio key={`${level.id}-${index}`} paragraphs={paragraphs} />}
      <p className="mt-6 text-lg leading-9">{part.introduction}</p>
      <h2 className="mt-8 text-xl font-bold">{t('الشرح خطوة بخطوة', 'Step by step')}</h2><ol className="mt-5 space-y-5">{part.steps.map((step, i) => <li className="flex gap-4" key={step}><span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-sm text-primary">{i + 1}</span><p className="leading-8">{step}</p></li>)}</ol>
      <section className="mt-10 border-t pt-7"><h2 className="text-xl font-bold">{t('المفاهيم الأساسية', 'Key concepts')}</h2><dl className="mt-5 divide-y">{part.concepts.slice(0, expanded ? undefined : 5).map(c => <div key={c.question} className="py-4"><dt className="font-bold">{c.question}</dt><dd className="mt-2 leading-8 text-muted-foreground">{c.explanation}</dd></div>)}</dl><Button variant="outline" onClick={() => setExpanded(!expanded)}>{t(expanded ? 'عرض أقل' : 'كل المفاهيم', expanded ? 'Show less' : 'All concepts')}</Button></section>
      <div className="mt-8 flex flex-wrap gap-3 border-t pt-6"><Button asChild size="lg"><Link to="/diploma/$level/exam/$exam" params={{ level: level.id, exam: String(index + 1) }}><Trophy />{t('ابدأ امتحان هذا الجزء', 'Take this part exam')}</Link></Button>{index < 3 && <Button asChild variant="outline" size="lg"><Link to="/diploma/$level/part/$part" params={{ level: level.id, part: String(index + 2) }}>{t('الجزء التالي', 'Next part')}<ArrowLeft /></Link></Button>}</div>
      <p className="mt-8 text-xs leading-6 text-muted-foreground">{t('مرجع الموضوعات:', 'Topic reference:')} «الشامل في هندسة الميكاترونكس» — أ.م. عبدالجبار حسين الظفري؛ {t('صفحات', 'pages')} {part.pages}. {t('الشرح والتطبيقات من إعداد Smart Lab.', 'Explanations and exercises authored by Smart Lab.')}</p>
    </article>
    <aside className="border-s ps-5"><h2 className="mb-4 font-bold">{t('أجزاء المستوى', 'Level parts')}</h2><nav className="space-y-2">{level.parts.map((p, i) => <Link key={p.title} to="/diploma/$level/part/$part" params={{ level: level.id, part: String(i + 1) }} className={`flex gap-2 rounded-md p-3 text-sm leading-6 ${i === index ? 'bg-primary/10 font-bold text-primary' : 'text-muted-foreground hover:bg-muted'}`}><span className="font-mono">0{i + 1}</span>{p.title}</Link>)}</nav><Button asChild variant="outline" className="mt-6 w-full"><Link to="/lab"><CircuitBoard />{t('مختبر أردوينو', 'Arduino lab')}</Link></Button></aside>
  </div></main>;
}