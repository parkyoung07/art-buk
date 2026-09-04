import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "부산·울산·경남 5일장 & 전통시장 전체보기 | 나드리 AI",
  },
  description: "부산·울산·경남 지역 5일장 및 전통시장의 오늘·내일 장날 주기, 대표 먹거리, 특산물 정보를 한눈에 확인하세요.",
  openGraph: {
    title: "부산·울산·경남 5일장 & 전통시장 전체보기 | 나드리 AI",
    description: "부산·울산·경남 지역 5일장 및 전통시장의 실시간 장날과 대표 먹거리를 확인하세요.",
  },
};

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
