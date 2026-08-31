import https from "https";

export interface NaverSearchItem {
  title: string;
  link: string;
  description: string;
  bloggername?: string;
  bloggerlink?: string;
  postdate?: string;
  cafename?: string;
  cafeurl?: string;
  category?: string;
  address?: string;
  roadAddress?: string;
  mapx?: string;
  mapy?: string;
}

export interface NaverSearchResult {
  total: number;
  items: NaverSearchItem[];
}

function cleanHtmlTags(str: string): string {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, "").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
}

/**
 * NAVER API HUB 통합 검색 호출 함수
 */
async function callNaverApiHub(apiPath: string): Promise<NaverSearchResult> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { total: 0, items: [] };
  }

  return new Promise((resolve) => {
    const req = https.request({
      hostname: "naverapihub.apigw.ntruss.com",
      path: apiPath,
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            const items = (parsed.items || []).map((item: NaverSearchItem) => ({
              ...item,
              title: cleanHtmlTags(item.title),
              description: cleanHtmlTags(item.description),
            }));
            resolve({ total: parsed.total || 0, items });
          } else {
            resolve({ total: 0, items: [] });
          }
        } catch {
          resolve({ total: 0, items: [] });
        }
      });
    });

    req.on("error", () => resolve({ total: 0, items: [] }));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ total: 0, items: [] });
    });
    req.end();
  });
}

/**
 * 1. 실제 관람객 네이버 블로그 후기 검색
 */
export async function getNaverBlogReviews(query: string, count: number = 3): Promise<NaverSearchItem[]> {
  const q = encodeURIComponent(query);
  const result = await callNaverApiHub(`/search/v1/blog?query=${q}&display=${count}&sort=sim`);
  return result.items;
}

/**
 * 2. 네이버 카페 방문 후기 및 커뮤니티 글 검색
 */
export async function getNaverCafeReviews(query: string, count: number = 3): Promise<NaverSearchItem[]> {
  const q = encodeURIComponent(query);
  const result = await callNaverApiHub(`/search/v1/cafearticle?query=${q}&display=${count}&sort=sim`);
  return result.items;
}

/**
 * 3. 미술관 주변 네이버 인기 장소/맛집 검색
 */
export async function getNaverLocalPlaces(query: string, count: number = 3): Promise<NaverSearchItem[]> {
  const q = encodeURIComponent(query);
  const result = await callNaverApiHub(`/search/v1/local?query=${q}&display=${count}&sort=comment`);
  return result.items;
}

/**
 * 4. 전시 관련 최신 언론 뉴스 검색
 */
export async function getNaverNews(query: string, count: number = 3): Promise<NaverSearchItem[]> {
  const q = encodeURIComponent(query);
  const result = await callNaverApiHub(`/search/v1/news?query=${q}&display=${count}&sort=sim`);
  return result.items;
}
