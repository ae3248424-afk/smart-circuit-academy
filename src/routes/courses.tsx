import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Globe } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Section, Card } from "@/components/Section";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Global Tech Courses — Smart Lab" },
      { name: "description", content: "Curated mechatronics and AI courses from Google, Microsoft, MIT and Coursera." },
      { property: "og:title", content: "Global Tech Courses — Smart Lab" },
      { property: "og:description", content: "The best global courses in mechatronics and AI." },
    ],
  }),
  component: Courses,
});

const courses = [
  { org: "Google", ar: "أساسيات الذكاء الاصطناعي", en: "Google AI Essentials", url: "https://grow.google/ai-essentials/" },
  { org: "Google", ar: "دورة تعلم الآلة المكثفة", en: "Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
  { org: "Microsoft", ar: "الذكاء الاصطناعي للمبتدئين", en: "AI for Beginners", url: "https://microsoft.github.io/AI-For-Beginners/" },
  { org: "Microsoft", ar: "إنترنت الأشياء للمبتدئين", en: "IoT for Beginners", url: "https://microsoft.github.io/IoT-For-Beginners/" },
  { org: "MIT", ar: "مقدمة في الروبوتات", en: "Introduction to Robotics", url: "https://ocw.mit.edu/courses/2-12-introduction-to-robotics-fall-2005/" },
  { org: "MIT", ar: "الإلكترونيات العملية", en: "Practical Electronics", url: "https://ocw.mit.edu/search/?q=electronics" },
  { org: "Coursera", ar: "تخصص الروبوتات", en: "Robotics Specialization (UPenn)", url: "https://www.coursera.org/specializations/robotics" },
  { org: "Coursera", ar: "مقدمة في الأردوينو", en: "Arduino Platform (UC Irvine)", url: "https://www.coursera.org/learn/arduino-platform" },
];

function Courses() {
  const { t } = useApp();
  return (
    <Section icon={<Globe />} title={t("الكورسات العالمية", "Global Tech Courses")}
      subtitle={t("أفضل الكورسات في الميكاترونكس والذكاء الاصطناعي", "Top mechatronics & AI courses worldwide")}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c) => (
          <a key={c.url} href={c.url} target="_blank" rel="noreferrer">
            <Card className="h-full">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">{c.org}</span>
              <h3 className="mt-3 font-bold">{t(c.ar, c.en)}</h3>
              <span className="mt-3 flex items-center gap-1 text-sm text-accent">{t("زيارة الكورس", "Visit course")} <ExternalLink className="h-3 w-3" /></span>
            </Card>
          </a>
        ))}
      </div>
    </Section>
  );
}
