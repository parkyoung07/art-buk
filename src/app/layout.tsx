import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nadriai.com"),
  title: {
    default: "나드리 AI | 부산·울산·경남 AI 문화·나들이 플랫폼 (nadriai.com)",
    template: "%s | 나드리 AI",
  },
  description: "부산·울산·경남에서 오늘과 이번 주말 갈 곳을 AI가 찾아주는 지역 문화·나들이 플랫폼 (nadriai.com). 전시 · 5일장 · 도서관 · AI 코스 추천",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "nadriai",
    "부울경나드리",
    "부산나드리",
    "울산나드리",
    "경남나드리",
    "부산전시",
    "부산전시회",
    "울산전시",
    "울산전시회",
    "경남전시",
    "경남전시회",
    "부산5일장",
    "울산5일장",
    "경남5일장",
    "부울경전통시장",
    "부울경도서관",
    "부산도서관",
    "부산가볼만한곳",
    "울산가볼만한곳",
    "경남가볼만한곳",
    "부산주말나들이",
    "울산데이트코스",
    "경남드라이브",
    "AI나들이추천",
    "부울경문화행사",
    "미술관도슨트",
    "부울경여행"
  ],
  authors: [{ name: "나드리 AI 팀", url: "https://nadriai.com" }],
  creator: "nadriai",
  publisher: "나드리 AI (nadriai.com)",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "나드리 AI (nadriai.com) | 부산·울산·경남 AI 문화·나들이 플랫폼",
    description: "이번 주말 어디 갈까? 부산·울산·경남의 전시, 5일장, 도서관을 AI가 취향에 맞춰 찾아드립니다. 나드리ai.com",
    url: "https://nadriai.com",
    siteName: "나드리 AI (nadriai.com)",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "나드리 AI (nadriai.com) | 부산·울산·경남 AI 문화·나들이 플랫폼",
    description: "이번 주말 어디 갈까? 부산·울산·경남의 전시, 5일장, 도서관을 AI가 취향에 맞춰 찾아드립니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://nadriai.com",
  },
  verification: {
    google: "google51f0949a73c1e8e5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://nadriai.com/#website",
        "url": "https://nadriai.com",
        "name": "나드리 AI",
        "alternateName": ["나드리", "nadriai", "nadriai.com", "나드리ai.com", "부울경나드리"],
        "description": "부산·울산·경남 AI 문화·나들이 플랫폼 (전시, 5일장, 전통시장, 도서관, AI 코스 추천)",
        "inLanguage": "ko-KR",
        "publisher": {
          "@id": "https://nadriai.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://nadriai.com/#organization",
        "name": "나드리 AI",
        "alternateName": ["nadriai", "nadriai.com", "나드리ai.com"],
        "url": "https://nadriai.com",
        "logo": "https://nadriai.com/favicon.ico",
        "sameAs": [
          "https://nadriai.com",
          "https://nadriai.com/blog",
          "https://nadriai.com/intro"
        ]
      }
    ]
  };

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
        <VisitorTracker />
        {children}
        <FloatingChatbot />
        <BottomNav />
      </body>
    </html>
  );
}


