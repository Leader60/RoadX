import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

export const IconDisc = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export const IconList = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconStack = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);

export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconHeart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5.5 5.5 5.5c1.8 0 3 1 2.9 1.2C9.5 5.6 10.7 4.5 12 4.5c1.3 0 2.5 1.1 3.6 2.2 0-.2 1.1-1.2 2.9-1.2 3 0 4.5 3 3 6-2.5 4.15-9.5 8.5-9.5 8.5Z" />
  </svg>
);

export const IconHeartFill = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 20.5S3 15.4 3 9.6C3 6.9 5 5 7.4 5c1.7 0 3.3 1 4.6 2.6C13.3 6 14.9 5 16.6 5 19 5 21 6.9 21 9.6c0 5.8-9 10.9-9 10.9Z" />
  </svg>
);

export const IconComment = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.9-5A8 8 0 1 1 21 12Z" />
  </svg>
);

export const IconPlay = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 5-7 7 7 7" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const IconMusicNote = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="16" cy="16" r="3" />
  </svg>
);

export const IconSparkle = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
  </svg>
);

export const IconSend = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 4 3 11l7 3 3 7 8-17Z" />
    <path d="m10 14 4-4" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </svg>
);

export const IconSpinner = (p: IconProps) => (
  <svg {...base(p)} className={`rx-spin ${p.className ?? ""}`}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10" width="15" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconYoutube = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="6" width="19" height="12" rx="3" />
    <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSpotify = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M7.5 10c3-1 6.5-.7 9 1" />
    <path d="M8 13c2.5-.8 5.2-.5 7.2.9" />
    <path d="M8.5 16c2-.6 4-.4 5.5.7" />
  </svg>
);

export const IconApple = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15.5 3.5c.2 1.2-.3 2.3-1 3-.8.8-2 1.4-3 1.3-.2-1.1.3-2.3 1-3 .8-.8 2.1-1.4 3-1.3Z" />
    <path d="M18 16.5c-.5 1.2-1 2-1.8 3-.9 1-1.6 1.5-2.5 1.5-.9 0-1.2-.5-2.3-.5s-1.5.5-2.3.5c-.9 0-1.6-.7-2.5-1.7C3.5 17 2.8 13 4.4 10.4 5.3 9 6.7 8.2 8 8.2c1 0 1.8.6 2.6.6.7 0 1.7-.7 2.9-.6 1 0 2.4.4 3.2 1.6-2.6 1.6-2.1 5 .3 6.7Z" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 5 5.5v4.5c0 5.5 7 9 7 9s7-3.5 7-9V5.5L12 3Z" />
  </svg>
);
