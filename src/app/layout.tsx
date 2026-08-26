import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "부울경 아트·전시 나들이 | 부산·울산·경남 전시 및 미술관 가이드",
  description: "부산, 울산, 경남 지역의 최신 미술관 전시, 미디어아트, 갤러리 소식과 AI 도슨트 추천 코스를 한눈에 만나보세요.",
  keywords: ["부산전시", "울산전시", "경남전시", "부산시립미술관", "울산시립미술관", "경남도립미술관", "클레이아크김해미술관", "부울경데이트", "주말나들이"],
  openGraph: {
    title: "부울경 아트·전시 나들이",
    description: "부산, 울산, 경남의 특별한 전시와 문화 예술 소식",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
