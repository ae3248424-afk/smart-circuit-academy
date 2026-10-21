import { createFileRoute } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { Section, Card } from "@/components/Section";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Video Library — Smart Lab" },
      { name: "description", content: "Curated YouTube tutorials for hands-on Arduino and mechatronics experiments." },
      { property: "og:title", content: "Video Library — Smart Lab" },
      { property: "og:description", content: "Hands-on mechatronics experiments on video." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Videos,
});

const videos = [
  { id: "nL34zDTPkcs", ar: "مقدمة في الأردوينو", en: "Arduino Introduction" },
  { id: "fJWR7dBuc18", ar: "ما هو الأردوينو؟", en: "What is Arduino?" },
  { id: "6F1B_N6LuKw", ar: "حساس المسافة بالموجات فوق الصوتية", en: "Ultrasonic Sensor Tutorial" },
  { id: "kUHmYKWwuWs", ar: "التحكم في محرك السيرفو", en: "Servo Motor Control" },
  { id: "x7zZf3SYQgM", ar: "قانون أوم ببساطة", en: "Ohm's Law Explained" },
  { id: "W2Rd6EE-jH4", ar: "ما هي الميكاترونكس؟", en: "What is Mechatronics?" },
];

function Videos() {
  const { t } = useApp();
  const [play, setPlay] = useState<string | null>(null);
  return (
    <Section icon={<PlayCircle />} title={t("مكتبة الفيديوهات التعليمية", "Educational Video Library")}
      subtitle={t("تجارب عملية مختارة من يوتيوب", "Curated hands-on YouTube experiments")}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <Card key={v.id} className="!p-3">
            <div className="aspect-video overflow-hidden rounded-xl bg-code">
              {play === v.id ? (
                <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${v.id}?autoplay=1`} title={v.en} allow="autoplay; encrypted-media" allowFullScreen />
              ) : (
                <button onClick={() => setPlay(v.id)} className="group relative h-full w-full">
                  <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={v.en} loading="lazy" className="h-full w-full object-cover" />
                  <PlayCircle className="absolute inset-0 m-auto h-14 w-14 text-primary transition group-hover:scale-110" />
                </button>
              )}
            </div>
            <h3 className="mt-3 px-1 font-bold">{t(v.ar, v.en)}</h3>
          </Card>
        ))}
      </div>
    </Section>
  );
}
