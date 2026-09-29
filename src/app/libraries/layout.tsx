import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "부산·울산·경남 공공도서관 전체보기 | 나드리 AI (nadriai.com)",
  },
  description: "부산·울산·경남 지역 공공도서관, 어린이 특화 도서관, 숲속 복합문화 도서관의 시설 및 운영 정보, 주차 팁을 확인하세요. (나드리 nadriai.com)",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "부울경도서관",
    "부산도서관",
    "울산도서관",
    "경남도서관",
    "김해지혜의바다",
    "마산지혜의바다",
    "부산시립시민도서관",
    "국회부산도서관",
    "어린이도서관",
    "북캉스",
    "주말아이와가볼만한곳",
    "가족나들이",
    "독서문화프로그램"
  ],
  openGraph: {
    title: "부산·울산·경남 공공도서관 전체보기 | 나드리 AI (nadriai.com)",
    description: "부산·울산·경남 지역 공공도서관 및 복합문화 도서관 정보를 확인하세요. 나드리ai.com",
    url: "https://nadriai.com/libraries/",
    siteName: "나드리 AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "부산·울산·경남 공공도서관 전체보기 | 나드리 AI",
    description: "부산·울산·경남 대표 공공도서관 및 이색 북캉스 명소 안내",
  },
};

export default function LibrariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
