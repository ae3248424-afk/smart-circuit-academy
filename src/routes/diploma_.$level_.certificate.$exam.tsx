import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Award, Download, Image, Loader2, Lock, Printer, Trophy } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiplomaNav } from '@/components/DiplomaNav';
import { DiplomaCertificate } from '@/components/DiplomaCertificate';
import { getLevel } from '@/lib/diploma';
import { certificateAttempt, parseExam, useDiplomaProgress } from '@/lib/diploma-progress';
import { pageHead } from '@/lib/page-head';
import { useApp } from '@/lib/app-context';

export const Route = createFileRoute('/diploma_/$level_/certificate/$exam')({
  loader: ({ params }) => { const level = getLevel(params.level); const partIndex = parseExam(params.exam); if (!level || partIndex === undefined) throw notFound(); return { level, partIndex, exam: params.exam }; },
  head: ({ loaderData: d }) => pageHead(d ? `شهادة ${d.partIndex === null ? 'المستوى' : `الجزء ${d.partIndex + 1}`} ${d.level.title}` : 'شهادة غير متاحة', 'شهادة إتمام تعليمية بتوقيع Full-stack Ashraf Elsayed - Smart Lab، قابلة للتنزيل والطباعة.'),
  component: CertificatePage,
});
function CertificatePage() {
  const { level, partIndex, exam } = Route.useLoaderData();
  const { t } = useApp(); const { attempts, loaded } = useDiplomaProgress();
  const attempt = certificateAttempt(attempts, level.id, partIndex);
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [prepared, setPrepared] = useState<{ format: 'pdf' | 'png'; blob: Blob; filename: string } | null>(null);
  const download = async (format: 'pdf' | 'png') => {
    const node = ref.current?.querySelector<HTMLElement>('#certificate');
    if (!node || !attempt) return;
    setBusy(true); setError('');
    try {
      await document.fonts.ready;
      const { toPng } = await import('html-to-image');
      const data = await toPng(node, { width: 1120, height: 792, pixelRatio: 2, style: { width: '1120px', height: '792px' } });
      const filename = `Smart-Lab-${level.id}-${exam}-${attempt.id.slice(0, 8)}`;
      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
        pdf.addImage(data, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
        setPrepared({ format, blob: pdf.output('blob'), filename: `${filename}.pdf` });
      } else {
        const blob = await (await fetch(data)).blob();
        setPrepared({ format, blob, filename: `${filename}.png` });
      }
    } catch { setError(t('تعذر التنزيل؛ يمكنك الطباعة أو الحفظ PDF من نافذة الطباعة.', 'Download failed; use Print / Save PDF instead.')); }
    finally { setBusy(false); }
  };
  const deliver = async () => {
    if (!prepared) return;
    const file = new File([prepared.blob], prepared.filename, { type: prepared.blob.type });
    if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: prepared.filename }); return; }
      catch (e) { if (e instanceof DOMException && e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(prepared.blob);
    const a = document.createElement('a'); a.href = url; a.download = prepared.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
  return <main className="mx-auto max-w-7xl px-4 py-8"><DiplomaNav level={level} /><h1 className="mb-3 flex items-center gap-3 text-2xl font-extrabold md:text-3xl"><Award className="text-accent" />{t(`شهادة ${partIndex === null ? 'المستوى' : `الجزء ${partIndex + 1}`} ${level.title}`, `${level.english} ${partIndex === null ? 'level' : `part ${partIndex + 1}`} certificate`)}</h1>
    {!loaded ? <p className="py-10 text-muted-foreground">{t('جارٍ قراءة النتائج…', 'Loading results…')}</p> : !attempt ? <section className="my-8 border-y py-10 text-center"><Lock className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-bold">{t('الشهادة متاحة بعد النجاح بنسبة ٨٠٪', 'Pass with 80% to earn this certificate')}</h2><p className="mt-3 text-sm text-muted-foreground">{t('لم تُحفظ نتيجة ناجحة لهذا الامتحان على هذا الجهاز بعد.', 'No passing result for this exam is saved on this device yet.')}</p><Button asChild className="mt-6"><Link to="/diploma/$level/exam/$exam" params={{ level: level.id, exam }}><Trophy />{t('دخول الامتحان', 'Take exam')}</Link></Button></section> : <>
      <p className="mb-6 text-sm text-muted-foreground">{attempt.name} · {attempt.score}%</p><div ref={ref} className="certificate-viewport"><DiplomaCertificate level={level} attempt={attempt} /></div>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Button disabled={busy} onClick={() => prepared?.format === 'pdf' ? deliver() : download('pdf')}>{busy ? <Loader2 className="animate-spin" /> : <Download />}{t(prepared?.format === 'pdf' ? 'تنزيل PDF' : 'تجهيز PDF', prepared?.format === 'pdf' ? 'Download PDF' : 'Prepare PDF')}</Button><Button variant="outline" disabled={busy} onClick={() => prepared?.format === 'png' ? deliver() : download('png')}><Image />{t(prepared?.format === 'png' ? 'تنزيل صورة' : 'تجهيز صورة', prepared?.format === 'png' ? 'Download PNG' : 'Prepare PNG')}</Button><Button variant="outline" onClick={() => window.print()}><Printer />{t('طباعة / حفظ PDF', 'Print / Save PDF')}</Button></div>{error && <p role="alert" className="mt-4 text-center text-sm text-destructive">{error}</p>}
    </>}
  </main>;
}