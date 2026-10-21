import { Link } from '@tanstack/react-router';
import { ArrowRight, Award, BookOpen, CircuitBoard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';
import type { Level } from '@/lib/diploma';

export function DiplomaNav({ level }: { level?: Level }) {
  const { t } = useApp();
  return <nav aria-label={t('تنقل الدبلومة', 'Diploma navigation')} className="mb-8 flex flex-wrap items-center gap-2 border-b pb-4">
    <Button asChild variant="ghost" size="sm"><Link to="/diploma"><ArrowRight />{t('الدبلومة', 'Diploma')}</Link></Button>
    {level && <Button asChild variant="secondary" size="sm"><Link to="/diploma/$level" params={{ level: level.id }}><BookOpen />{t(`المستوى ${level.title}`, level.english)}</Link></Button>}
    <Button asChild variant="ghost" size="sm"><Link to="/lab"><CircuitBoard />{t('المختبر', 'Lab')}</Link></Button>
    <Button asChild variant="ghost" size="sm"><Link to="/diploma/certificates"><Award />{t('شهاداتي', 'My certificates')}</Link></Button>
  </nav>;
}