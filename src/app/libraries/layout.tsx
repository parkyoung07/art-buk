import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공공도서관 전체보기",
  description: "부산·울산·경남 지역 공공도서관, 어린이 특화 도서관, 숲속 복합문화 도서관의 시설 및 운영 정보를 확인하세요.",
  openGraph: {
    title: "부산·울산·경남 공공도서관 전체보기 | 나드리 AI",
    description: "부산·울산·경남 지역 공공도서관 및 복합문화 도서관 정보를 확인하세요.",
  },
};

export default function LibrariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
