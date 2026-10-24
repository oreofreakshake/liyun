import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const rasmee = localFont({
  src: "../fonts/ak-rasmee-regular.woff2",
  variable: "--font-rasmee",
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "unicode-range", value: "U+0780-07BF, U+060C, U+061B, U+061F" },
    { prop: "size-adjust", value: "115%" },
  ],
});

const description = "An intuitive Dhivehi text editor";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Liyun",
  description,
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  openGraph: {
    title: "Liyun",
    description,
    siteName: "Liyun",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Liyun",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${dmSans.variable} ${rasmee.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
