import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (relativePath) => fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('message storage API is fail-closed for all data methods', async () => {
  const handlers = await import('../functions/api/messages.js');
  for (const handler of [handlers.onRequestGet, handlers.onRequestPost, handlers.onRequestDelete]) {
    const response = await handler();
    assert.equal(response.status, 410);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const payload = await response.json();
    assert.deepEqual(Object.keys(payload).sort(), ['error', 'message']);
  }
});

test('N4 disables consultation and feedback UI while preserving AI chat and N5 baseline', () => {
  const chatbot = read('src/components/FloatingChatbot.tsx');
  const intro = read('src/app/intro/page.tsx');

  assert.doesNotMatch(chatbot, /\/api\/messages/);
  assert.doesNotMatch(intro, /\/api\/messages/);
  assert.match(chatbot, /1:1 상담은 보안 점검 중/);
  assert.doesNotMatch(chatbot, /onClick=\{handleConnectAgent\}/);
  assert.doesNotMatch(intro, /1:1 상담원 연결/);
  assert.match(intro, /피드백 접수는 보안 점검 중/);
  assert.doesNotMatch(intro, /href="#feedback-section"/);
  assert.doesNotMatch(intro, /handleCopyPromo\('feedback'\)/);
  assert.match(intro, /<fieldset[\s\S]*?disabled/);
  assert.match(chatbot, /fetch\("\/api\/chat"/);

  assert.match(chatbot, /Load chat-data\.json and search-index\.json on mount/);
  assert.match(chatbot, /fetch\("\/data\/search-index\.json"\)/);
  assert.doesNotMatch(chatbot, /if \(!isOpen \|\| searchIndexRef\.current\.length > 0\) return/);
});
