import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 센터 - 나드리 AI",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
