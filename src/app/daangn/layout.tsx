import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "당근 이웃 추천 부울경 나들이 코스 | 나드리 AI (nadriai.com)",
  },
  description: "당근 이웃들을 위한 부산비엔날레 및 을숙도, 영도, 초량 문화 감성 나들이 가이드! (나드리 nadriai.com)",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "당근동네생활",
    "부산비엔날레",
    "을숙도나들이",
    "부산가볼만한곳",
    "부산주말데이트",
    "아이와함께가볼만한곳",
    "부산카페투어"
  ],
  openGraph: {
    title: "당근 이웃 추천 부울경 나들이 코스 | 나드리 AI (nadriai.com)",
    description: "2026 부산비엔날레 & 을숙도 감성 나들이 가이드. 나드리ai.com",
    url: "https://nadriai.com/daangn/",
    siteName: "나드리 AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "당근 이웃 추천 부울경 나들이 코스 | 나드리 AI",
    description: "부산비엔날레 & 문화 나들이 코스 총정리",
  },
};

export default function DaangnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
