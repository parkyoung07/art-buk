import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전시 전체보기",
  description: "부산·울산·경남 지역 미술관과 갤러리에서 현재 진행 중인 주요 전시, 무료 관람 정보, AI 추천 포인트를 한눈에 확인하세요.",
  openGraph: {
    title: "부산·울산·경남 전시 전체보기 | 나드리 AI",
    description: "부산·울산·경남 지역 미술관과 갤러리에서 현재 진행 중인 주요 전시를 한눈에 확인하세요.",
  },
};

export default function ExhibitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
