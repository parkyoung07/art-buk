import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "1분 숏폼으로 만나는 부울경 나들이 | 나드리 AI (nadriai.com)",
  },
  description: "부산비엔날레와 부울경 핫플레이스를 1분 숏폼 영상과 내레이션으로 빠르게 만나보세요. (나드리 nadriai.com)",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "문화숏폼",
    "부산비엔날레숏츠",
    "1분나들이가이드",
    "부산핫플",
    "주말데이트",
    "영상가이드"
  ],
  openGraph: {
    title: "1분 숏폼으로 만나는 부울경 나들이 | 나드리 AI (nadriai.com)",
    description: "부산비엔날레와 부울경 핫플레이스 1분 숏폼 가이드. 나드리ai.com",
    url: "https://nadriai.com/shorts/",
    siteName: "나드리 AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1분 숏폼으로 만나는 부울경 나들이 | 나드리 AI",
    description: "생생한 숏폼 영상으로 즐기는 문화 나들이 가이드",
  },
};

export default function ShortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
