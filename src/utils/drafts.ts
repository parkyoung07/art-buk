type DraftSortKey = {
  id: string;
  date: string;
  slot: string;
  createdAt?: string;
};

export function compareDraftsNewestFirst(a: DraftSortKey, b: DraftSortKey): number {
  const byDate = b.date.localeCompare(a.date);
  if (byDate !== 0) return byDate;

  const slotRank = (slot: string) => (slot === "pm" ? 1 : 0);
  const bySlot = slotRank(b.slot) - slotRank(a.slot);
  if (bySlot !== 0) return bySlot;

  const byCreated = (b.createdAt || "").localeCompare(a.createdAt || "");
  if (byCreated !== 0) return byCreated;
  return b.id.localeCompare(a.id);
}
