export type DraftStatus =
  | "draft_generated"
  | "review_required"
  | "approved"
  | "rejected"
  | "on_hold"
  | "published";

export type DraftSlot = "am" | "pm";

export interface VenueDetail {
  name: string;
  address: string;
  period?: string;
  hours?: string;
  closedDays?: string;
  price?: string;
  marketDays?: string;
  parking?: string;
  homepage?: string;
  isVerified?: boolean;
  notes?: string;
}

export interface VerifiedImageItem {
  id: string;
  url: string;
  alt: string;
  theme: "architecture" | "exhibition" | "interior" | "exterior" | "cafe" | "nature" | "scenery" | "market" | "food" | "general";
  isCover: boolean; // 대표 사진 여부
  stage1Selected: boolean; // 1단계 통과 여부
  stage2Verified: boolean; // 2단계 통과 여부 (stage2_verified)
  humanVerified: boolean; // 관리자/휴먼 검증 여부 (human_verified)
  coverApproved: boolean; // 대표 이미지 적합 승인 여부
  status: "approved" | "pending" | "rejected";
  priorityRank: "1순위 (2단계 검수 통과)" | "2순위 (공식 레지스트리)" | "3순위 (공식기관/공공데이터)" | "4순위 (신규 수집)";
  verificationStage: string; // e.g. "2단계 검수 완료", "1단계 통과", "공식 아카이브"
  source: string; // 출처 표기 (e.g. "부산시립미술관 공식", "한국관광공사 TourAPI", "네이버 검증 완료")
  sourceDomain?: string;
  photographer?: string;
  matchReason: string; // 왜 글 내용과 맞는지에 대한 명확한 사유 (e.g. "장소 소개 글의 대표 이미지로 적합 (외관 실사)")
  venueName?: string;
}

export interface InfoSource {
  name: string;
  url?: string;
}

export interface ContentDraft {
  id: string; // e.g. "2026-09-30-am"
  slot: DraftSlot; // "am" (오전 09:00) | "pm" (오후 14:00)
  slotName: string; // "오전 09:00 (오늘 활용)" | "오후 14:00 (주말/내일 코스)"
  date: string; // "2026-09-30"
  targetDate: string; // "2026-09-30"
  createdAt: string;
  updatedAt: string;
  status: DraftStatus;
  slug: string;
  title: string;
  summary: string;
  category: string;
  region: string;
  subRegion?: string;
  tags: string[];
  thumbnail: string;
  thumbnailSource: string;
  content: string; // Full markdown body
  venues: VenueDetail[];
  images: VerifiedImageItem[]; // 1·2단계 검증 자산 메타데이터 목록 (대표 1장 + 보조 1~2장)
  availableImagePool?: VerifiedImageItem[]; // 해당 장소의 교체 가능한 1·2단계 검증 사진 풀
  infoSources: InfoSource[];
  expectedUrl: string;
  previewUrl: string;
  reviewUrl: string;
  approvedAt?: string | null;
  publishedAt?: string | null;
  rejectReason?: string | null;
  curatorNotes?: string;
}
