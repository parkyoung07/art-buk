import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FloatingChatbot from "@/components/FloatingChatbot";
import VisitorTracker from "@/components/VisitorTracker";
import BottomNav from "@/components/BottomNav";
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
  metadataBase: new URL("https://nadriai.com"),
  title: {
    default: "나드리 AI | 부산·울산·경남 AI 문화·나들이 플랫폼",
    template: "%s | 나드리 AI",
  },
  description: "부산·울산·경남에서 오늘과 이번 주말 갈 곳을 AI가 찾아주는 지역 문화·나들이 플랫폼. 전시 · 5일장 · 도서관 · AI 코스 추천",
  keywords: [
    "나드리AI",
    "부산전시",
    "울산전시",
    "경남전시",
    "부산5일장",
    "울산5일장",
    "경남5일장",
    "부울경도서관",
    "부산나들이",
    "주말나들이",
    "부울경데이트",
    "AI나들이추천"
  ],
  authors: [{ name: "나드리 AI 팀" }],
  creator: "nadriai",
  publisher: "nadriai",
  openGraph: {
    title: "나드리 AI | 부산·울산·경남 AI 문화·나들이 플랫폼",
    description: "이번 주말 어디 갈까? 부산·울산·경남의 전시, 5일장, 도서관을 AI가 취향에 맞춰 찾아드립니다.",
    url: "https://nadriai.com",
    siteName: "나드리 AI",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "나드리 AI | 부산·울산·경남 AI 문화·나들이 플랫폼",
    description: "이번 주말 어디 갈까? 부산·울산·경남의 전시, 5일장, 도서관을 AI가 취향에 맞춰 찾아드립니다.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
        <VisitorTracker />
        {children}
        <FloatingChatbot />
        <BottomNav />
      </body>
    </html>
  );
}


