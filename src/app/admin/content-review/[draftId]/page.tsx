import { redirect } from "next/navigation";

export async function generateStaticParams() {
  return [
    { draftId: "today-am" },
    { draftId: "today-pm" },
    { draftId: "2026-09-30-am" },
    { draftId: "2026-09-30-pm" }
  ];
}

interface PageProps {
  params: Promise<{ draftId: string }>;
}

export default async function DraftReviewDetailPage({ params }: PageProps) {
  const { draftId } = await params;
  redirect(`/admin/content-review/?draftId=${encodeURIComponent(draftId)}`);
}
