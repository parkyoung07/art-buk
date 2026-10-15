import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { formatPostDateLabel } from '../src/utils/date-labels.ts';
import { compareDraftsNewestFirst } from '../src/utils/drafts.ts';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('post labels use actual KST today and yesterday', () => {
  const now = new Date('2026-10-15T03:00:00.000Z');
  assert.equal(formatPostDateLabel('2026-10-15', now), '오늘');
  assert.equal(formatPostDateLabel('2026-10-14', now), '어제');
  assert.equal(formatPostDateLabel('2026-10-06', now), '10월 6일');
});

test('post labels roll over at KST midnight', () => {
  assert.equal(formatPostDateLabel('2026-10-15', new Date('2026-10-14T14:59:59.000Z')), '내일');
  assert.equal(formatPostDateLabel('2026-10-15', new Date('2026-10-14T15:00:00.000Z')), '오늘');
});

test('drafts sort by date, pm before am, then createdAt', () => {
  const items = [
    { id: '2026-10-13-pm', date: '2026-10-13', slot: 'pm', createdAt: '2026-10-13T05:00:00Z' },
    { id: '2026-10-14-am', date: '2026-10-14', slot: 'am', createdAt: '2026-10-14T00:00:00Z' },
    { id: '2026-10-14-pm', date: '2026-10-14', slot: 'pm', createdAt: '2026-10-14T05:00:00Z' },
  ];
  assert.deepEqual(items.toSorted(compareDraftsNewestFirst).map(x => x.id), [
    '2026-10-14-pm', '2026-10-14-am', '2026-10-13-pm'
  ]);
});

test('date-sensitive UI has neutral pre-hydration rendering', () => {
  for (const path of [
    'src/components/ExhibitionSimpleCard.tsx',
    'src/components/MarketInfoCard.tsx',
    'src/components/MarketSection.tsx',
    'src/app/markets/page.tsx',
    'src/components/AiTripPlanner.tsx',
  ]) {
    const source = read(path);
    assert.match(source, /useHydrated/);
  }
  assert.match(read('src/components/ExhibitionSimpleCard.tsx'), /일정 확인 중/);
  assert.match(read('src/components/MarketInfoCard.tsx'), /장날 확인 중/);
  assert.match(read('src/components/AiTripPlanner.tsx'), /날짜 확인 중/);
});

test('market counts use the same today-and-tomorrow predicate as their lists', () => {
  const page = read('src/app/markets/page.tsx');
  assert.match(page, /todayAndTomorrowCount/);
  assert.match(page, /오늘·내일 장날 \(\{todayAndTomorrowCount\}\)/);

  const section = read('src/components/MarketSection.tsx');
  assert.match(section, /todayAndTomorrowCount/);
  assert.match(section, /badgeType === 'today' \|\| item\.status\.badgeType === 'tomorrow'/);
  assert.match(section, /오늘·내일 장날 \(\{todayAndTomorrowCount\}\)/);
  assert.doesNotMatch(section, /오늘 열린 장 \(\{todayCount\}\)/);
});
