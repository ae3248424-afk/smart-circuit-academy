export type Q = { ar: string; en: string; options: string[]; answer: number; code?: string };

export const questions: Q[] = [
  { ar: "ما هو قانون أوم؟", en: "What is Ohm's law?", options: ["V = I × R", "P = I × R", "V = R / I", "I = V × R"], answer: 0 },
  { ar: "ما وظيفة دالة setup() في الأردوينو؟", en: "What does setup() do in Arduino?", options: ["Runs forever", "Runs once at start", "Reads sensors", "Stops program"], answer: 1 },
  { ar: "أي حساس يقيس المسافة؟", en: "Which sensor measures distance?", options: ["DHT11", "LDR", "HC-SR04", "MQ-2"], answer: 2 },
  { ar: "أقصى زاوية لمحرك السيرفو القياسي؟", en: "Standard servo max angle?", options: ["90°", "180°", "270°", "360°"], answer: 1 },
  { ar: "ما الإشارة المستخدمة للتحكم في سرعة المحرك؟", en: "Which signal controls motor speed?", options: ["PWM", "I2C", "UART", "SPI"], answer: 0 },
  { ar: "تحدي برمجي: أكمل الكود لتشغيل الليد", en: "Coding challenge: complete the code to turn the LED on",
    code: "pinMode(13, OUTPUT);\ndigitalWrite(13, ____);", options: ["LOW", "HIGH", "INPUT", "0"], answer: 1 },
  { ar: "تحدي برمجي: ما ناتج 1023 من analogRead؟", en: "Coding challenge: analogRead returning 1023 means?",
    code: "int v = analogRead(A0); // v == 1023", options: ["0V", "2.5V", "5V", "Error"], answer: 2 },
  { ar: "ما وظيفة الترانزستور كمفتاح؟", en: "A transistor used as a switch does what?", options: ["Stores charge", "Controls large current with small one", "Measures voltage", "Generates PWM"], answer: 1 },
  { ar: "الميكاترونكس تجمع بين:", en: "Mechatronics combines:", options: ["Mechanics, electronics, software", "Chemistry and biology", "Only electronics", "Civil engineering"], answer: 0 },
  { ar: "أي دالة تنتظر بالمللي ثانية؟", en: "Which function waits in milliseconds?", options: ["wait()", "sleep()", "delay()", "pause()"], answer: 2 },
];

export const PASS = 80;
export const scorePercent = (correct: number, total: number) => Math.round((correct / total) * 100);
export const badgeFor = (pct: number) => (pct >= 90 ? "gold" : pct >= PASS ? "silver" : pct >= 50 ? "bronze" : "none");
