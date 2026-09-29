const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');

function parsePost(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
  if (!match) return null;
  return {
    rawFrontmatter: match[1],
    body: match[2]
  };
}

function extractTags(rawFrontmatter) {
  const tags = [];
  const singleLineMatch = rawFrontmatter.match(/^tags:\s*\[(.*?)\]/m);
  if (singleLineMatch) {
    singleLineMatch[1].split(',').forEach(t => {
      const clean = t.trim().replace(/^["']|["']$/g, '');
      if (clean) tags.push(clean);
    });
    return tags;
  }

  const multiLineMatch = rawFrontmatter.match(/^tags:\s*\r?\n((?:\s*-\s*[^\r\n]+\r?\n?)+)/m);
  if (multiLineMatch) {
    multiLineMatch[1].split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*-\s*["']?(.*?)["']?$/);
      if (m && m[1]) tags.push(m[1].trim());
    });
    return tags;
  }

  return tags;
}

function cleanFrontmatterTags(rawFrontmatter) {
  let cleaned = rawFrontmatter.replace(/^tags:\s*\[.*?\]\r?\n?/gm, '');
  cleaned = cleaned.replace(/^tags:\s*\r?\n((?:\s*-\s*[^\r\n]+\r?\n?)+)/gm, '');
  return cleaned.trim();
}

function processAllPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  console.log(`🚀 총 ${files.length}개의 포스트 깔끔한 구분선 및 해시태그 마무리 작업...`);

  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parsePost(content);

    if (!parsed) continue;

    const { rawFrontmatter, body } = parsed;

    const titleMatch = rawFrontmatter.match(/^title:\s*["']?(.*?)["']?$/m);
    const regionMatch = rawFrontmatter.match(/^region:\s*["']?(.*?)["']?$/m);
    const categoryMatch = rawFrontmatter.match(/^category:\s*["']?(.*?)["']?$/m);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const region = regionMatch ? regionMatch[1].trim() : '부산';
    const category = categoryMatch ? categoryMatch[1].trim() : '전시 리뷰';

    const existingTags = extractTags(rawFrontmatter);

    // 필수 및 브랜드 해시태그
    const newTagsSet = new Set([
      '나드리',
      '나드리AI',
      'nadriai.com',
      '나드리ai.com'
    ]);

    for (const t of existingTags) {
      if (t) newTagsSet.add(t);
    }

    newTagsSet.add(`${region}가볼만한곳`);
    newTagsSet.add(`${region}나들이`);
    newTagsSet.add(`${region}데이트`);

    if (category.includes('시장') || /5일장|시장|장터/i.test(title + file)) {
      newTagsSet.add(`${region}5일장`);
      newTagsSet.add('부울경전통시장');
      newTagsSet.add('전통시장먹거리');
    } else if (category.includes('도서관') || /도서관|도서/i.test(title + file)) {
      newTagsSet.add(`${region}도서관`);
      newTagsSet.add('부울경도서관');
      newTagsSet.add('아이와가볼만한곳');
      newTagsSet.add('북캉스');
    } else if (category.includes('힐링') || /healing|드라이브|산책|공원|습지/i.test(title + file)) {
      newTagsSet.add(`${region}드라이브`);
      newTagsSet.add('가을힐링로드');
      newTagsSet.add('인생샷명소');
    } else {
      newTagsSet.add(`${region}전시`);
      newTagsSet.add('부울경전시');
      newTagsSet.add('미술관나들이');
    }

    newTagsSet.add('부울경나들이');
    newTagsSet.add('주말가볼만한곳');
    newTagsSet.add('가을나들이');
    newTagsSet.add('AI도슨트');

    const enrichedTags = Array.from(newTagsSet).slice(0, 16);

    const cleanFm = cleanFrontmatterTags(rawFrontmatter);
    const formattedTags = `tags: [${enrichedTags.map(t => `"${t}"`).join(', ')}]`;
    const newFrontmatter = `${cleanFm}\n${formattedTags}`;

    // 본문 끝 해시태그 섹션 및 트레일링 대시 깔끔 제거
    let cleanBody = body
      .replace(/\r?\n---\r?\n### 🏷️.*$/s, '')
      .replace(/\r?\n### 🏷️.*$/s, '')
      .trim();

    // 혹시 끝에 남은 연속 --- 도 정리
    while (cleanBody.endsWith('---')) {
      cleanBody = cleanBody.slice(0, -3).trim();
    }

    const hashString = enrichedTags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
    const newTagSection = `\n\n---\n\n### 🏷️ 나드리 AI 추천 태그 & SNS 해시태그 (nadriai.com)\n${hashString}\n`;

    const finalContent = `---\n${newFrontmatter}\n---\n\n${cleanBody}${newTagSection}`;

    fs.writeFileSync(filePath, finalContent, 'utf8');
    updatedCount++;
  }

  console.log(`✨ [완료] ${updatedCount}개 파일 모두 깔끔한 구분선과 풍부한 해시태그로 정리 완료!`);
}

processAllPosts();
