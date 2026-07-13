"use client";

import { Card, SectionTitle } from "./ui";
import { IconMusicNote, IconSparkle, IconHeart, IconStack } from "./icons";

const VALUES = [
  {
    Icon: IconSparkle,
    title: "جودة عالية",
    text: "ننتقي أرقى الإصدارات العالمية لجمهور يقدّر التميّز الموسيقي.",
  },
  {
    Icon: IconStack,
    title: "قوائم منسّقة",
    text: "مجموعات حصرية مصمّمة بعناية لكل مزاج ولحظة.",
  },
  {
    Icon: IconHeart,
    title: "تفاعل حيّ",
    text: "شارك إعجابك وتعليقاتك، ويبقى تفاعلك محفوظاً معك دائماً.",
  },
];

export function AboutView() {
  return (
    <div className="rx-fade-in flex flex-col gap-5 px-4 py-6 pb-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/50 bg-navy-deep text-gold">
          <IconMusicNote size={32} />
        </span>
        <h1 className="text-3xl font-bold rx-gold-text tracking-wide">RoadX</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
          منصة موسيقية عربية تتابع وتنشر أحدث الإصدارات الموسيقية العالمية،
          موجّهة لجمهور مميّز مهتم بالموسيقى عالية الجودة.
        </p>
      </div>

      <Card className="p-4">
        <SectionTitle className="mb-2">رسالتنا</SectionTitle>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          نؤمن أن الموسيقى الراقية تستحق منصة تليق بها. نسعى لتكون RoadX وجهتك
          الأولى لاكتشاف أجمل المقطوعات العالمية، مع تجربة تصفّح أنيقة وبسيطة
          تجمع بين الأصالة والحداثة.
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        {VALUES.map(({ Icon, title, text }) => (
          <Card key={title} className="flex items-start gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-bold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground text-pretty">{text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
