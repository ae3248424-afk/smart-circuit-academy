import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckCircle2, CircuitBoard, Play, RotateCcw, Square, Trash2, Undo2, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiplomaNav } from '@/components/DiplomaNav';
import { CodeBlock } from '@/components/CodeBlock';
import { advanceUno, circuitReady, createUno, LAB_MODES, REQUIRED_BUTTON_WIRES, REQUIRED_LED_WIRES, safeWire, sameWire, type LabMode, type Wire } from '@/lib/arduino-lab';
import { pageHead } from '@/lib/page-head';
import { useApp } from '@/lib/app-context';
import { levels } from '@/lib/diploma';

export const Route = createFileRoute('/lab')({ head: () => pageHead('مختبر أردوينو التفاعلي', 'محاكاة ATmega328P مع أطراف Arduino UNO وأسلاك ومقاومة وLED وزر، وتجارب خطوة بخطوة.'), component: Lab });
const labels: Record<LabMode, [string, string]> = { blink: ['وميض LED', 'LED blink'], button: ['زر ومدخل رقمي', 'Digital button'], pwm: ['التحكم في السطوع', 'LED brightness'], safety: ['تشابك الأمان', 'Safety interlock'] };
const points: Record<string, [number, number]> = { D13: [110, 190], D2: [245, 190], GND: [280, 370], '5V': [245, 370], R1: [480, 205], R2: [580, 205], 'LED+': [665, 260], 'LED-': [725, 260], BTN1: [520, 385], BTN2: [610, 385] };
function Lab() {
  const { t } = useApp();
  const [mode, setMode] = useState<LabMode>('blink');
  const [wires, setWires] = useState<Wire[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [high, setHigh] = useState(false);
  const [period, setPeriod] = useState(500);
  const [duty, setDuty] = useState(50);
  const [pressed, setPressed] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [error, setError] = useState('');
  const uno = useRef<ReturnType<typeof createUno> | null>(null);
  const ready = circuitReady(wires, mode);
  const buttonMode = mode === 'button' || mode === 'safety';
  useEffect(() => {
    if (!running) return;
    const board = createUno(mode, period, duty); uno.current = board;
    let frame = 0; let last = 0;
    const tick = (time: number) => {
      const elapsed = last ? Math.min(time - last, 50) : 1; last = time;
      setHigh(advanceUno(board, Math.round(elapsed * 16000))); setCycles(board.cpu.cycles);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); uno.current = null; };
  }, [running, mode, period, duty]);
  useEffect(() => { uno.current?.portD.setPin(2, !pressed); }, [pressed]);
  const stop = () => { setRunning(false); setHigh(false); setPressed(false); };
  const terminal = (id: string) => {
    if (running) return;
    setError('');
    if (!selected) { setSelected(id); return; }
    if (selected === id) { setSelected(null); return; }
    const wire = { from: selected, to: id };
    if (!safeWire(wire)) setError(t('هذا التوصيل غير آمن أو لا يطابق الدائرة. راجع مسار الأسلاك أدناه.', 'This connection is unsafe or does not match the circuit. Check the wiring steps below.'));
    else if (!wires.some(w => sameWire(w, wire))) setWires(w => [...w, wire]);
    setSelected(null);
  };
  const requirements = [...REQUIRED_LED_WIRES, ...(buttonMode ? REQUIRED_BUTTON_WIRES : [])];
  const ledOn = running && ready && high;
  const code = buttonMode ? `const int led = 13, button = 2;\nvoid setup() {\n  pinMode(led, OUTPUT);\n  pinMode(button, INPUT_PULLUP);\n}\nvoid loop() {\n  bool pressed = digitalRead(button) == LOW;\n  digitalWrite(led, ${mode === 'button' ? 'pressed' : '!pressed'} ? HIGH : LOW);\n}` : mode === 'pwm' ? `// Software PWM on D13, period 2000 us\nvoid setup() { pinMode(13, OUTPUT); }\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delayMicroseconds(${duty * 20});\n  digitalWrite(13, LOW);\n  delayMicroseconds(${(100 - duty) * 20});\n}` : `void setup() { pinMode(13, OUTPUT); }\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(${period});\n  digitalWrite(13, LOW);\n  delay(${period});\n}`;
  return <main className="mx-auto max-w-7xl px-4 py-8"><DiplomaNav /><h1 className="flex items-center gap-3 text-3xl font-extrabold"><CircuitBoard className="text-primary" />{t('مختبر أردوينو', 'Arduino lab')}</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">{t('محاكاة تعليمية منخفضة الجهد لأطراف UNO ومعالج ATmega328P؛ لا تتصل بأجهزة فعلية ولا تعتمد سلامة الدائرة الحقيقية.', 'Low-voltage educational simulation of UNO pins and ATmega328P; no physical hardware connection or real-circuit safety certification.')}</p>
    <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label={t('التجربة', 'Experiment')}>{LAB_MODES.map((m, i) => <Button key={m} variant={mode === m ? 'default' : 'outline'} aria-pressed={mode === m} onClick={() => { stop(); setMode(m); setWires([]); setSelected(null); setError(''); setCycles(0); }}>{i + 1}. {t(...labels[m])}</Button>)}</div>
    <div className="mt-6 grid items-start gap-7 xl:grid-cols-[1fr_320px]">
      <section className="min-w-0"><div className="mb-4 flex flex-wrap items-center gap-2"><Button onClick={() => { if (!ready) { setError(t('أكمل توصيلات الدائرة أولًا.', 'Complete the circuit first.')); return; } setError(''); setRunning(true); }} disabled={running}><Play />{t('تشغيل', 'Run')}</Button><Button variant="outline" onClick={stop} disabled={!running}><Square />{t('إيقاف', 'Stop')}</Button><Button variant="outline" disabled={running} onClick={() => { setWires(requirements); setSelected(null); setError(''); }}><Zap />{t('توصيل النموذج', 'Wire example')}</Button><Button size="icon" variant="ghost" title={t('تراجع عن آخر سلك', 'Undo last wire')} aria-label={t('تراجع عن آخر سلك', 'Undo last wire')} disabled={running || !wires.length} onClick={() => setWires(w => w.slice(0, -1))}><Undo2 /></Button><Button size="icon" variant="ghost" title={t('مسح الأسلاك', 'Clear wires')} aria-label={t('مسح الأسلاك', 'Clear wires')} disabled={running} onClick={() => { setWires([]); setSelected(null); }}><Trash2 /></Button></div>
        <div className="lab-scene" dir="ltr"><svg viewBox="0 0 800 480" role="img" aria-label={t('لوحة أردوينو ومكونات الدائرة', 'Arduino board and circuit components')}>
          <rect x="45" y="90" width="310" height="330" rx="12" className="lab-board" /><rect x="75" y="75" width="70" height="65" rx="4" className="lab-metal" /><rect x="65" y="345" width="45" height="65" rx="4" className="lab-chip" />
          <text x="85" y="245" className="lab-board-label lab-title">ARDUINO</text><text x="85" y="278" className="lab-board-label">UNO / ATmega328P</text><rect x="125" y="300" width="175" height="25" className="lab-chip" />
          {Array.from({ length: 14 }, (_, i) => <g key={i}><rect x={100 + i * 15} y="155" width="11" height="15" className="lab-chip" /><text x={105 + i * 15} y="147" className="lab-pin-label" textAnchor="middle">{13 - i}</text></g>)}
          <text x="285" y="400" className="lab-board-label">A0 A1 A2 A3 A4 A5</text>
          <rect x="495" y="193" width="70" height="24" rx="6" className="lab-resistor" /><path d="M512 193v24m12-24v24m12-24v24" className="lab-resistor-band" /><text x="530" y="175" textAnchor="middle" className="lab-text">220Ω</text>
          <path d="M665 245v-25a30 30 0 0 1 60 0v25z" className={ledOn ? 'lab-led-on' : 'lab-led-off'} /><path d="M665 245v15m60-15v15" className="lab-lead" /><text x="695" y="165" textAnchor="middle" className="lab-text">LED</text>
          <rect x="530" y="355" width="70" height="60" rx="5" className="lab-metal" /><circle cx="565" cy="382" r="18" className={pressed ? 'lab-led-on' : 'lab-chip'} /><text x="565" y="340" textAnchor="middle" className="lab-text">{mode === 'safety' ? 'STOP' : 'BUTTON'}</text>
          {wires.map((wire, i) => { const a = points[wire.from]; const b = points[wire.to]; if (!a || !b) return null; return <path key={`${wire.from}-${wire.to}`} d={`M${a[0]} ${a[1]} V${60 + i * 22} H${b[0]} V${b[1]}`} className={`lab-wire wire-${i % 3}`} />; })}
          {Object.entries(points).filter(([id]) => buttonMode || !id.startsWith('BTN')).map(([id, [x, y]]) => <g key={id} className="lab-terminal" role="button" aria-label={`${t('طرف', 'Terminal')} ${id}`} tabIndex={running ? -1 : 0} onClick={() => terminal(id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); terminal(id); } }}><circle cx={x} cy={y} r="10" className={selected === id ? 'lab-terminal-selected' : 'lab-terminal-dot'} /><text x={x} y={y + 27} textAnchor="middle" className={x < 355 ? 'lab-board-label' : 'lab-text'}>{id}</text></g>)}
        </svg></div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md bg-muted p-3 font-mono text-xs" dir="ltr"><span className={running ? 'text-success' : 'text-muted-foreground'}>{running ? 'RUNNING' : 'STOPPED'}</span><span>D13 / PB5: {running ? (high ? 'HIGH · 5V' : 'LOW · 0V') : '—'}</span><span>16 MHz · {cycles.toLocaleString('en-US')} cycles</span><span>LED {ledOn ? 'ON' : 'OFF'}</span></div>
        {selected && <p className="mt-3 text-sm text-primary">{t(`الطرف المحدد: ${selected}؛ اختر الطرف الآخر.`, `Selected: ${selected}; choose the other terminal.`)}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="my-6 flex flex-wrap gap-5">{mode === 'blink' && <label className="flex-1 text-sm">{t('زمن كل حالة', 'State duration')}: {period} ms<input type="range" min="100" max="1000" step="100" value={period} disabled={running} onChange={e => setPeriod(Number(e.target.value))} className="mt-3 block w-full accent-primary" /></label>}{mode === 'pwm' && <label className="flex-1 text-sm">{t('نسبة التشغيل', 'Duty cycle')}: {duty}%<input type="range" min="5" max="95" step="5" value={duty} disabled={running} onChange={e => setDuty(Number(e.target.value))} className="mt-3 block w-full accent-primary" /></label>}{buttonMode && <Button variant={pressed ? 'destructive' : 'outline'} disabled={!running} aria-pressed={pressed} onClick={() => setPressed(!pressed)}>{t(pressed ? 'تحرير الزر' : 'ضغط الزر', pressed ? 'Release button' : 'Press button')}</Button>}</div>
        <h2 className="mb-3 text-lg font-bold">{t('البرنامج المكافئ للتجربة', 'Equivalent experiment sketch')}</h2><CodeBlock code={code} />
      </section>
      <aside className="border-s ps-5"><h2 className="text-lg font-bold">{t('التوصيل خطوة بخطوة', 'Wiring step by step')}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{t('افصل التغذية أثناء التوصيل. صل المقاومة على التوالي مع LED، ولا تصل 5V بالأرضي.', 'Disconnect power when wiring. Put a resistor in series with the LED. Never short 5V to ground.')}</p><ol className="mt-4 space-y-4">{requirements.map((wire, i) => <li key={`${wire.from}-${wire.to}`} className="flex items-center gap-3"><span className={`grid size-7 shrink-0 place-items-center rounded-md text-xs ${wires.some(w => sameWire(w, wire)) ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{wires.some(w => sameWire(w, wire)) ? <CheckCircle2 className="size-4" /> : i + 1}</span><span dir="ltr" className="font-mono text-sm">{wire.from} → {wire.to}</span></li>)}</ol><p className="mt-6 text-sm leading-7">{mode === 'blink' ? t('بعد التوصيل: شغّل، راقب تغير D13، وقارن دورة الوميض بضعف زمن الحالة.', 'Run and compare the blink period to twice the state duration.') : mode === 'pwm' ? t('جرّب نسب تشغيل مختلفة. الوميض سريع 500Hz؛ نسبة التشغيل هي نسبة زمن HIGH وليست جهد مصدر جديدًا.', 'Try different duty cycles. Software PWM runs near 500Hz; duty is time spent HIGH, not a new supply voltage.') : mode === 'safety' ? t('شغّل ثم اضغط STOP؛ يجب أن ينخفض D13 وينطفئ LED. هذا تشابك تعليمي، وليس توقف طوارئ صناعيًا.', 'Run, then press STOP: D13 should go LOW. This is an educational interlock, not an industrial emergency stop.') : t('الزر يستخدم INPUT_PULLUP: غير مضغوط HIGH؛ عند الضغط LOW ويضيء LED.', 'INPUT_PULLUP: released HIGH; pressed LOW turns the LED on.')}</p><Button variant="ghost" className="mt-4" onClick={() => { stop(); setCycles(0); setError(''); }}><RotateCcw />{t('إعادة ضبط', 'Reset')}</Button><div className="mt-7 border-t pt-5"><h3 className="mb-3 font-bold">{t('المستويات', 'Levels')}</h3>{levels.map((level, i) => <Link key={level.id} to="/diploma/$level" params={{ level: level.id }} className={`block py-2 text-sm ${LAB_MODES[i] === mode ? 'text-primary' : 'text-muted-foreground'}`}>{t(`المستوى ${level.title}`, level.english)}</Link>)}</div></aside>
    </div>
  </main>;
}