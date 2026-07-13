"use client";

import { useState } from "react";
import { useRoadX } from "@/contexts/roadx-context";
import { cleanStr } from "@/lib/roadx/data";
import { Card, Button, SectionTitle, cx, inputClass } from "./ui";
import { IconMail, IconSend, IconMusicNote } from "./icons";

const CONTACTS = [
  { label: "البريد الإلكتروني", value: "hello@roadx.music" },
  { label: "الدعم", value: "support@roadx.music" },
  { label: "أوقات الرد", value: "يومياً من ٩ صباحاً حتى ٦ مساءً" },
];

export function ContactView() {
  const { pushToast } = useRoadX();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    const n = cleanStr(name, 80).trim();
    const m = cleanStr(message, 800).trim();
    if (n.length < 2 || m.length < 3) {
      pushToast("يرجى إكمال الاسم والرسالة", "error");
      return;
    }
    setName("");
    setEmail("");
    setMessage("");
    pushToast("تم إرسال رسالتك، شكراً لتواصلك", "success");
  };

  return (
    <div className="rx-fade-in flex flex-col gap-5 px-4 py-6 pb-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/50 bg-navy-deep text-gold">
          <IconMail size={26} />
        </span>
        <h1 className="text-2xl font-bold text-foreground">تواصل معنا</h1>
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">
          يسعدنا سماع رأيك واقتراحاتك حول أحدث الإصدارات الموسيقية.
        </p>
      </div>

      <Card className="flex flex-col divide-y divide-border">
        {CONTACTS.map((c) => (
          <div key={c.label} className="flex items-center justify-between gap-3 p-3.5">
            <span className="text-sm text-muted-foreground">{c.label}</span>
            <span className="text-sm font-bold text-foreground">{c.value}</span>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <SectionTitle className="mb-1">أرسل رسالة</SectionTitle>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="الاسم"
          className={inputClass}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني (اختياري)"
          className={inputClass}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 800))}
          rows={4}
          placeholder="رسالتك..."
          className={cx(inputClass, "resize-none")}
        />
        <Button variant="gold" onClick={submit} className="mt-1">
          <IconSend size={18} /> إرسال
        </Button>
      </Card>

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <IconMusicNote size={14} className="text-gold" />
        RoadX — منصة الموسيقى العالمية
      </div>
    </div>
  );
}
