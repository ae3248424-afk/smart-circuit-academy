import { createFileRoute, Link } from '@tanstack/react-router';
import { Award, CheckCircle2 } from 'lucide-react';
import { DiplomaNav } from '@/components/DiplomaNav';
import { DiplomaCertificate } from '@/components/DiplomaCertificate';
import { Button } from '@/components/ui/button';
import { levels } from '@/lib/diploma';
import { certificateAttempt, useDiplomaProgress } from '@/lib/diploma-progress';
import { pageHead } from '@/lib/page-head';
import { useApp } from '@/lib/app-context';

export const Route = createFileRoute('/diploma_/certificates')({ head: () => pageHead('شهادات دبلومة الميكاترونكس', 'شهادات الأجزاء والمستويات بأربعة تصاميم مميزة من المعمل الذكي.'), component: Certificates });
function Certificates() {
  const { t } = useApp(); const { attempts } = useDiplomaProgress();
  return <main className="mx-auto max-w-7xl px-4 py-8"><DiplomaNav /><h1 className="flex items-center gap-3 text-3xl font-extrabold"><Award className="text-accent" />{t('شهادات الدبلومة', 'Diploma certificates')}</h1><p className="mt-3 text-sm text-muted-foreground">{t('شهادة لكل جزء ولكل مستوى بعد النجاح من ٨٠٪. النتائج محفوظة على هذا الجهاز.', 'A certificate for each part and level after passing with 80%. Results are saved on this device.')}</p>
    <div className="mt-8 grid gap-8 xl:grid-cols-2">{levels.map(level => <section key={level.id} className="min-w-0 border-t pt-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">{t(`المستوى ${level.title}`, level.english)}</h2><span className="text-xs text-muted-foreground">{level.english}</span></div><div className="certificate-preview"><DiplomaCertificate level={level} sample /></div><div className="mt-4 divide-y">{[null, 0, 1, 2, 3].map(part => { const attempt = certificateAttempt(attempts, level.id, part); const exam = part === null ? 'level' : String(part + 1); return <div key={exam} className="flex items-center justify-between gap-3 py-3"><span className="flex items-center gap-2 text-sm">{attempt && <CheckCircle2 className="size-4 text-success" />}{part === null ? t('شهادة المستوى', 'Level certificate') : `${t('الجزء', 'Part')} ${part + 1}`}{attempt && <span className="text-muted-foreground">{attempt.score}%</span>}</span><Button asChild variant={attempt ? 'default' : 'ghost'} size="sm"><Link to="/diploma/$level/certificate/$exam" params={{ level: level.id, exam }}>{t(attempt ? 'عرض وتنزيل' : 'عرض الاستحقاق', attempt ? 'View & download' : 'Check eligibility')}</Link></Button></div>; })}</div></section>)}</div>
  </main>;
}