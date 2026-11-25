import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBS Connect | Téléphones et accessoires à Dakar",
  description:
    "BBS Connect, le spécialiste du téléphone à Dakar : iPhone, Samsung Galaxy, Google Pixel et accessoires authentiques, garantis et livrés partout au Sénégal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-ink">{children}</body>
    </html>
  );
}
