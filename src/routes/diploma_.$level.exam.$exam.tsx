import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Award, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiplomaNav } from '@/components/DiplomaNav';
import { DIPLOMA_PASS, examQuestions, getLevel, gradeExam } from '@/lib/diploma';
import { parseExam, saveAttempt, type DiplomaAttempt } from '@/lib/diploma-progress';
import { pageHead } from '@/lib/page-head';
import { useApp } from '@/lib/app-context';

export const Route = createFileRoute('/diploma_/$level/exam/$exam')({
  loader: ({ params }) => {
    const level = getLevel(params.level); const partIndex = parseExam(params.exam);
    if (!level || partIndex === undefined) throw notFound();
    return { level, partIndex, exam: params.exam };
  },
  head: ({ loaderData: d }) => pageHead(d ? `امتحان ${d.partIndex === null ? 'المستوى' : `الجزء ${d.partIndex + 1}`} ${d.level.title}` : 'امتحان غير متاح', 'اختبر معرفتك في الميكاترونكس؛ النجاح من ٨٠٪ للحصول على شهادة إتمام.'),
  component: ExamPage,
});
function ExamPage() { const data = Route.useLoaderData(); return <Exam key={`${data.level.id}-${data.exam}`} {...data} />; }
function Exam({ level, partIndex, exam }: ReturnType<typeof Route.useLoaderData>) {
  const { t } = useApp();
  const questions = examQuestions(level, partIndex);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [name, setName] = useState('');
  const [result, setResult] = useState<DiplomaAttempt | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const question = questions[current];
  if (!question) return null;
  const answered = Object.keys(answers).length;
  const title = partIndex === null ? t(`امتحان المستوى ${level.title}`, `${level.english} level exam`) : `${t('امتحان الجزء', 'Part exam')} ${Number(partIndex) + 1}: ${level.parts[partIndex]?.title}`;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError(t('أدخل اسمك كما تريده على الشهادة.', 'Enter your name for the certificate.')); return; }
    if (answered !== questions.length) { setError(t('أجب عن كل الأسئلة أولًا.', 'Answer every question first.')); return; }
    const score = gradeExam(level, partIndex, questions.map((_, i) => answers[i] ?? -1));
    const attempt: DiplomaAttempt = { ...score, id: crypto.randomUUID(), levelId: level.id, partIndex, name: name.trim(), date: new Date().toISOString() };
    try { saveAttempt(attempt); setSaved(true); setError(''); } catch { setError(t('تعذر الحفظ على الجهاز. اسمح بتخزين البيانات ثم حاول حفظ النتيجة.', 'Device storage is unavailable. Allow storage, then retry saving.')); }
    setResult(attempt); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <main className="mx-auto max-w-5xl px-4 py-8"><DiplomaNav level={level} /><h1 className="text-2xl font-extrabold leading-relaxed md:text-3xl">{title}</h1><p className="mt-3 text-sm text-muted-foreground">{questions.length} {t('سؤالًا · النجاح من ٨٠٪ · النتائج محفوظة على هذا الجهاز', 'questions · 80% pass mark · results saved on this device')}</p>
    {result ? <section className="mt-8">
      <div className="border-y py-8 text-center"><Trophy className={`mx-auto size-10 ${result.score >= DIPLOMA_PASS ? 'text-accent' : 'text-muted-foreground'}`} /><p className="mt-4 font-mono text-6xl font-bold">{result.score}%</p><h2 className="mt-3 text-xl font-bold">{result.score >= DIPLOMA_PASS ? t('مبارك، اجتزت الامتحان!', 'Congratulations, you passed!') : t('محاولة جيدة؛ راجع المفاهيم وحاول مجددًا', 'Review the concepts and try again')}</h2><p className="mt-3 text-muted-foreground">{result.correct}/{result.total} {t('إجابة صحيحة', 'correct answers')} · {result.name}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{saved && result.score >= DIPLOMA_PASS && <Button asChild size="lg"><Link to="/diploma/$level/certificate/$exam" params={{ level: level.id, exam }}><Award />{t('عرض الشهادة وتنزيلها', 'View & download certificate')}</Link></Button>}<Button variant="outline" onClick={() => { setResult(null); setAnswers({}); setCurrent(0); setError(''); }}><RotateCcw />{t('محاولة جديدة', 'Try again')}</Button>{!saved && <Button onClick={() => { try { saveAttempt(result); setSaved(true); setError(''); } catch { setError(t('ما زال الحفظ غير متاح.', 'Storage is still unavailable.')); } }}>{t('حفظ النتيجة', 'Save result')}</Button>}</div></div>
      {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      <h2 className="mt-8 text-xl font-bold">{t('مراجعة الإجابات', 'Answer review')}</h2><ol className="mt-4 divide-y">{questions.map((q, i) => <li key={q.question} className="py-5"><p className="font-bold">{i + 1}. {q.question}</p><p className={`mt-2 text-sm ${answers[i] === q.answer ? 'text-success' : 'text-destructive'}`}>{t('إجابتك:', 'Your answer:')} {q.options[answers[i] ?? -1]}</p><p className="mt-2 text-sm">{t('الإجابة الصحيحة:', 'Correct answer:')} {q.options[q.answer]}</p><p className="mt-2 text-sm leading-7 text-muted-foreground">{q.explanation}</p></li>)}</ol>
    </section> : <form onSubmit={submit} className="mt-8">
      <div className="flex items-center justify-between gap-3 text-sm"><span>{t('الأسئلة المجابة', 'Answered questions')}</span><span className="font-mono">{answered}/{questions.length}</span></div><progress value={answered} max={questions.length} className="diploma-progress mt-3 h-2 w-full" />
      <div className="mt-5 flex flex-wrap gap-2" aria-label={t('اختيار السؤال', 'Choose question')}>{questions.map((_, i) => <Button key={i} size="icon" variant={i === current ? 'default' : 'outline'} onClick={() => setCurrent(i)} type="button" aria-label={`${t('السؤال', 'Question')} ${i + 1}`} aria-current={i === current ? 'step' : undefined} className={`size-8 text-xs ${i !== current && answers[i] !== undefined ? 'border-success text-success' : ''}`}>{i + 1}</Button>)}</div>
      <fieldset className="mt-8 min-h-80 rounded-lg border bg-card p-5 md:p-8"><legend className="px-2 text-sm text-muted-foreground">{t('السؤال', 'Question')} {current + 1}/{questions.length}</legend><h2 className="mb-6 text-xl font-bold leading-9">{question.question}</h2><div className="space-y-3">{question.options.map((option, i) => <label key={`${current}-${i}`} className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${answers[current] === i ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}><input type="radio" name={`question-${current}`} value={i} checked={answers[current] === i} onChange={() => { setAnswers(a => ({ ...a, [current]: i })); setError(''); }} className="mt-1 size-4 shrink-0 accent-primary" /><span className="text-sm leading-7">{option}</span></label>)}</div></fieldset>
      <div className="mt-5 flex justify-between gap-3"><Button variant="outline" type="button" disabled={current === 0} onClick={() => setCurrent(current - 1)}><ChevronRight />{t('السابق', 'Previous')}</Button><Button type="button" disabled={current === questions.length - 1} onClick={() => setCurrent(current + 1)}>{t('التالي', 'Next')}<ChevronLeft /></Button></div>
      <div className="mt-8 border-t pt-6"><label htmlFor="learner-name" className="font-bold">{t('الاسم على الشهادة', 'Certificate name')}</label><input id="learner-name" value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder={t('الاسم الكامل', 'Full name')} className="mt-3 block w-full max-w-md rounded-md border bg-background px-4 py-3" required /><Button className="mt-5" size="lg" type="submit" disabled={answered !== questions.length}><CheckCircle2 />{t('إنهاء الامتحان وعرض النتيجة', 'Finish exam & view result')}</Button>{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}</div>
    </form>}
  </main>;
}