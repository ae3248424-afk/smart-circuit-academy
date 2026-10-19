import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CircuitBoard, Cog, Radar, Zap, Code2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Section } from "@/components/Section";
import { CodeBlock } from "@/components/CodeBlock";
import { VoicePlayer } from "@/components/VoicePlayer";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons & Arduino Simulator — Smart Lab" },
      { name: "description", content: "Electronics basics, sensors, motors and Arduino with code and pin diagrams." },
      { property: "og:title", content: "Lessons & Arduino Simulator" },
      { property: "og:description", content: "Interactive mechatronics modules with an Arduino pin simulator." },
    ],
  }),
  component: Lessons,
});

const modules = [
  { icon: Zap, ar: "أساسيات الإلكترونيات", en: "Electronics Basics",
    bodyAr: "قانون أوم: الجهد = التيار × المقاومة (V = I × R). المقاومة تحدّ من التيار لحماية الليد.",
    bodyEn: "Ohm's law: V = I × R. A resistor limits current to protect the LED.",
    code: `// Blink an LED on pin 13\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}` },
  { icon: Radar, ar: "الحساسات", en: "Sensors",
    bodyAr: "حساس الموجات فوق الصوتية HC-SR04 يقيس المسافة عبر زمن ارتداد الصوت.",
    bodyEn: "The HC-SR04 ultrasonic sensor measures distance using echo time.",
    code: `const int trig = 9, echo = 10;\nvoid setup() {\n  pinMode(trig, OUTPUT);\n  pinMode(echo, INPUT);\n  Serial.begin(9600);\n}\nvoid loop() {\n  digitalWrite(trig, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  long d = pulseIn(echo, HIGH) * 0.034 / 2;\n  Serial.println(d); // cm\n}` },
  { icon: Cog, ar: "المحركات", en: "Motors",
    bodyAr: "محرك السيرفو يتحرك لزاوية محددة بين 0 و180 درجة باستخدام إشارة PWM.",
    bodyEn: "A servo moves to a precise angle (0–180°) using a PWM signal.",
    code: `#include <Servo.h>\nServo s;\nvoid setup() {\n  s.attach(6);\n}\nvoid loop() {\n  for (int a = 0; a <= 180; a++) {\n    s.write(a);\n    delay(15);\n  }\n}` },
  { icon: Code2, ar: "برمجة الأردوينو", en: "Arduino Programming",
    bodyAr: "كل برنامج يحتوي على setup() تُنفّذ مرة واحدة، و loop() تتكرر للأبد.",
    bodyEn: "Every sketch has setup() which runs once and loop() which repeats forever.",
    code: `int btn = 2, led = 13;\nvoid setup() {\n  pinMode(btn, INPUT);\n  pinMode(led, OUTPUT);\n}\nvoid loop() {\n  if (digitalRead(btn) == HIGH) {\n    digitalWrite(led, HIGH);\n  } else {\n    digitalWrite(led, LOW);\n  }\n}` },
];

function Lessons() {
  const { t } = useApp();
  const [active, setActive] = useState(0);
  const m = modules[active] ?? modules[0]!;
  return (
    <Section icon={<CircuitBoard />} title={t("الشروحات الشاملة ومحاكي الأردوينو", "Lessons & Arduino Simulator")}
      subtitle={t("اختر وحدة، اقرأ الشرح، وجرّب المحاكاة", "Pick a module, read, and try the simulator")}>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {modules.map((mm, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${i === active ? "bg-brand text-primary-foreground" : "glass"}`}>
            <mm.icon className="h-4 w-4" />{t(mm.ar, mm.en)}
          </button>
        ))}
      </div>
      <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid gap-6 lg:grid-cols-2">
        <div className="glass space-y-4 p-5">
          <h2 className="text-xl font-bold">{t(m.ar, m.en)}</h2>
          <p className="text-muted-foreground">{t(m.bodyAr, m.bodyEn)}</p>
          <VoicePlayer text={t(m.bodyAr, m.bodyEn)} />
          <CodeBlock code={m.code} />
        </div>
        <Simulator />
      </motion.div>
    </Section>
  );
}

function Simulator() {
  const { t } = useApp();
  const pins = [2, 3, 5, 6, 9, 10, 11, 13];
  const [wired, setWired] = useState<number[]>([13]);
  const [on, setOn] = useState(false);
  const toggle = (p: number) => setWired((w) => (w.includes(p) ? w.filter((x) => x !== p) : [...w, p]));
  return (
    <div className="glass p-5">
      <h3 className="mb-1 text-lg font-bold">{t("مخطط توصيل الأطراف التفاعلي", "Interactive Pin Diagram")}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{t("اضغط على الطرف لتوصيل ليد، ثم شغّل الإشارة", "Tap a pin to wire an LED, then toggle the signal")}</p>
      <div dir="ltr" className="rounded-2xl bg-code p-4">
        <div className="rounded-xl border-2 border-primary/50 bg-primary/10 p-3">
          <div className="mb-3 text-center font-mono text-xs text-primary">ARDUINO UNO</div>
          <div className="grid grid-cols-8 gap-2">
            {pins.map((p) => (
              <button key={p} onClick={() => toggle(p)} className="flex flex-col items-center gap-1">
                <span className={`h-5 w-5 rounded-sm border-2 ${wired.includes(p) ? "border-accent bg-accent" : "border-muted-foreground"}`} />
                <span className="font-mono text-[10px] text-secondary">D{p}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-8 gap-2">
          {pins.map((p) => (
            <div key={p} className="flex flex-col items-center">
              {wired.includes(p) && (
                <>
                  <span className="h-6 w-0.5 bg-accent" />
                  <motion.span animate={{ opacity: on ? 1 : 0.25, scale: on ? 1.15 : 1 }}
                    className={`h-5 w-5 rounded-full bg-destructive ${on ? "shadow-[0_0_16px_var(--color-destructive)]" : ""}`} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => setOn(!on)} className="bg-brand mt-4 w-full rounded-xl py-3 font-bold text-primary-foreground">
        digitalWrite(..., {on ? "LOW" : "HIGH"})
      </button>
    </div>
  );
}
