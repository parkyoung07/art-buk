import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "AI 맞춤 나들이 코스 플래너 | 나드리 AI",
  },
  description: "지역, 동행자, 소요시간, 예산에 맞춰 부산·울산·경남 전시·5일장·도서관 최적 동선을 AI가 약 1분 만에 구성해드립니다.",
  openGraph: {
    title: "AI 맞춤 나들이 코스 플래너 | 나드리 AI",
    description: "지역, 동행자, 소요시간, 예산 맞춤 나드리 코스를 AI가 추천합니다.",
  },
};

export default function AiTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
