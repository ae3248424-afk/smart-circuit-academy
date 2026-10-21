import { Award, CircuitBoard, GraduationCap, ShieldCheck } from 'lucide-react';
import type { DiplomaAttempt } from '@/lib/diploma-progress';
import type { Level } from '@/lib/diploma';

const emblems = { beginner: CircuitBoard, intermediate: ShieldCheck, advanced: Award, expert: GraduationCap };
export function DiplomaCertificate({ level, attempt, sample = false }: { level: Level; attempt?: DiplomaAttempt; sample?: boolean }) {
  const Emblem = emblems[level.id];
  const part = attempt?.partIndex;
  const description = part !== null && part !== undefined ? `الجزء ${part + 1} — ${level.parts[part]?.title}` : `المستوى ${level.title}`;
  return <div id={sample ? undefined : 'certificate'} dir="rtl" className={`diploma-certificate cert-${level.id} ${sample ? 'certificate-sample' : ''}`}>
    <div className="cert-artwork" aria-hidden="true" /><div className="cert-inner">
      <header className="cert-header"><span className="cert-brand" dir="ltr">SMART LAB<span>MECHATRONICS ACADEMY</span></span><span className="cert-level">{level.english.toUpperCase()} / {level.title}</span></header>
      <div className="cert-body"><div className="cert-emblem"><Emblem /></div><p className="cert-kicker" dir="ltr">CERTIFICATE OF COMPLETION</p><h2>شهادة إتمام</h2><p className="cert-intro">يَشهد المعمل الذكي بأن</p><p className="cert-name">{attempt?.name ?? 'اسم المتعلّم'}</p><p className="cert-description">قد اجتاز بنجاح {description}</p><p className="cert-diploma">دبلومة في ميكاترونيكس من الصفر إلى الاحتراف</p><p className="cert-result">{sample ? 'نموذج تصميم · غير صالحة للإصدار' : `بتقدير ${attempt?.score}% — ${attempt?.correct} من ${attempt?.total} إجابة صحيحة`}</p></div>
      <footer className="cert-footer"><div><p className="cert-signature" dir="ltr">Ashraf Elsayed</p><p className="cert-signer" dir="ltr">Full-stack Ashraf Elsayed - Smart Lab</p></div><div className="cert-issue"><p>{attempt ? new Date(attempt.date).toLocaleDateString('ar-EG', { timeZone: 'UTC' }) : '—'}</p><p dir="ltr">{attempt ? `SL-${attempt.id.slice(0, 8).toUpperCase()}` : 'DESIGN PREVIEW'}</p></div></footer>
      <p className="cert-disclaimer">شهادة إتمام تعليمية · نتيجة محفوظة على جهاز المتعلّم</p>
    </div>
  </div>;
}