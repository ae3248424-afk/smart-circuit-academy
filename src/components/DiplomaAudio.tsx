import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useApp } from '@/lib/app-context';

export function DiplomaAudio({ paragraphs }: { paragraphs: string[] }) {
  const { t } = useApp();
  const [state, setState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  const stop = () => { window.speechSynthesis?.cancel(); setState('stopped'); setCurrent(0); };
  const start = () => {
    if (!window.speechSynthesis) { setError(t('الاستماع غير متاح في هذا المتصفح.', 'Narration is unavailable in this browser.')); return; }
    if (state === 'paused') { window.speechSynthesis.resume(); setState('playing'); return; }
    window.speechSynthesis.cancel(); setError(''); setState('playing');
    const play = (index: number) => {
      const text = paragraphs[index];
      if (!text) { setState('stopped'); setCurrent(0); return; }
      setCurrent(index);
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'ar-SA'; speech.rate = 0.9;
      const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('ar'));
      if (voice) speech.voice = voice;
      speech.onend = () => play(index + 1);
      speech.onerror = e => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') { setError(t('تعذر تشغيل الصوت؛ جرّب متصفحًا يدعم صوتًا عربيًا.', 'Audio failed; try a browser with Arabic voices.')); setState('stopped'); }
      };
      window.speechSynthesis.speak(speech);
    };
    play(0);
  };
  return <div className="my-6 flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
    <Volume2 className="text-primary" />
    <div className="min-w-0 flex-1"><p className="font-bold">{t('الشرح الصوتي العربي', 'Arabic narration')}</p><p className="text-sm text-muted-foreground">{state === 'stopped' ? t(`${paragraphs.length} مقاطع`, `${paragraphs.length} sections`) : t(`المقطع ${current + 1} من ${paragraphs.length}`, `Section ${current + 1} of ${paragraphs.length}`)}</p></div>
    <Button aria-label={state === 'playing' ? t('إيقاف مؤقت', 'Pause') : t('تشغيل الشرح', 'Play narration')} onClick={() => { if (state === 'playing') { window.speechSynthesis.pause(); setState('paused'); } else start(); }} size="icon">{state === 'playing' ? <Pause /> : <Play />}</Button>
    <Button aria-label={t('إيقاف الصوت', 'Stop narration')} variant="outline" size="icon" onClick={stop}><Square /></Button>
    {error && <p role="alert" className="w-full text-sm text-destructive">{error}</p>}
  </div>;
}