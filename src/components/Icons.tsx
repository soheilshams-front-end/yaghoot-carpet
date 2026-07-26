type IconProps = {
  className?: string;
  size?: number;
};

function Svg({
  children,
  className = "",
  size = 20,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function IconUser(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </Svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m4 10.5 8-6.5 8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </Svg>
  );
}

export function IconCart(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 5h2l1.5 11h11l2-8H7" />
      <circle cx="9" cy="19" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconTruck(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 7h11v10H3V7Z" />
      <path d="M14 10h4l3 3v4h-7v-7Z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </Svg>
  );
}

export function IconChat(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
    </Svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3 5 6v5c0 5 3.2 8.2 7 9.5 3.8-1.3 7-4.5 7-9.5V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function IconTag(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 13.2 12.8 20.4a2 2 0 0 1-2.8 0L3.6 14A2 2 0 0 1 3 12.6V5.5A1.5 1.5 0 0 1 4.5 4H11a2 2 0 0 1 1.4.6L20 12a2 2 0 0 1 0 2.8Z" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconChevronLeft(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m15 6-6 6 6 6" />
    </Svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconPhone(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 4.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 6.5a2 2 0 0 1 2-2Z" />
    </Svg>
  );
}

export function IconMenu(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m5 12 5 5L20 7" />
    </Svg>
  );
}

export function IconHeart(p: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = p;
  return (
    <Svg {...rest}>
      <path
        d="M19.5 12.6 12 20l-7.5-7.4a4.4 4.4 0 0 1 6.3-6.1L12 7l1.2-1.5a4.4 4.4 0 0 1 6.3 6.1Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Svg>
  );
}

/** Newest / sparkle */
export function IconSparkles(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5 13.2 8.5 18 9.7 13.2 10.9 12 16 10.8 10.9 6 9.7 10.8 8.5 12 3.5Z" />
      <path d="m18.5 14.5.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
    </Svg>
  );
}

/** Price low to high */
export function IconSortAsc(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 16V6M8 6 5.5 8.5M8 6l2.5 2.5" />
      <path d="M13 8h6M13 12h4.5M13 16h3" />
    </Svg>
  );
}

/** Price high to low */
export function IconSortDesc(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 8v10M8 18l-2.5-2.5M8 18l2.5-2.5" />
      <path d="M13 8h3M13 12h4.5M13 16h6" />
    </Svg>
  );
}

/** Brand mark — diamond ring logo */
export function LogoMark({ className = "", size = 40 }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.webp"
      alt=""
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
      draggable={false}
    />
  );
}
