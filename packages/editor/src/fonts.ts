export type ThaanaFont = { label: string; family: string | null };

export const thaanaFonts: ThaanaFont[] = [
  { label: "AK Rasmee", family: null },
  { label: "MV Faseyha", family: "MV Faseyha" },
  { label: "MV Kelaa", family: "MV Kelaa" },
  { label: "MV Typewriter", family: "MV Typewriter" },
  { label: "MV A Waheed", family: "MV A Waheed" },
];

export const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 40];

export const fontStack = (family: string) =>
  `"${family}", var(--font-dm-sans), sans-serif`;

export const familyOf = (stack: string | null | undefined) =>
  stack?.match(/^"([^"]+)"/)?.[1] ?? stack ?? null;
