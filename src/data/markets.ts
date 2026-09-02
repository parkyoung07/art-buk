export interface TraditionalMarket {
  id: string;
  name: string;
  region: '부산' | '울산' | '경남';
  subRegion: string;
  marketType: '5일장' | '상설시장' | '새벽시장' | '야시장';
  scheduleDays: number[]; // 5일장 날짜 끝자리 (예: [3, 8] -> 3일, 8일, 13일, 18일, 23일, 28일). 상설시장은 빈 배열 []
  scheduleDescription: string;
  specialties: string[];
  address: string;
  description: string;
  tips: string;
}

export const TRADITIONAL_MARKETS: TraditionalMarket[] = [
  // =========================================================================
  // [1] 부산광역시 대표 5일장 & 상설 전통시장
  // =========================================================================
  {
    id: "busan-bukgu-gupo-5day",
    name: "구포 5일장 (구포시장)",
    region: "부산",
    subRegion: "북구",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["70년 전통 구포국수", "가마솥 족발", "묵채", "어묵거리", "옛날 튀김"],
    address: "부산광역시 북구 구포시장1길 17",
    description: "400여 년의 장구한 역사를 자랑하는 영남 최대의 전통 5일장입니다. 낙동강 수운의 거점으로 발달하여 장날(3·8일)이면 수만 명의 인파로 활기가 넘칩니다.",
    tips: "장날에 방문하면 갓 삶아낸 쫄깃한 구포국수와 따끈한 가마솥 족발을 착한 가격에 즐기실 수 있습니다."
  },
  {
    id: "busan-gijang-market-5day",
    name: "기장 5일장 (기장시장)",
    region: "부산",
    subRegion: "기장군",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["기장 대게 & 킹크랩", "활어회", "기장 미역·다시마", "짚불곰장어", "갈치"],
    address: "부산광역시 기장군 기장읍 읍내로104번길 16",
    description: "동해 청정 해역에서 갓 잡은 싱싱한 수산물과 전국적으로 유명한 기장 대게 골목이 형성되어 있는 대표 해양 5일장입니다.",
    tips: "대게를 직접 골라 즉석에서 쪄 먹는 코스가 일품이며, 4·9일 장날에는 해풍 맞은 싱싱한 채소와 과일 노점이 풍성합니다."
  },
  {
    id: "busan-gangseo-daejeo-5day",
    name: "대저 5일장 (대저시장)",
    region: "부산",
    subRegion: "강서구",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["대저 짭짤이 토마토", "명지 갈삼구이", "가을 전어회", "장터 국밥"],
    address: "부산광역시 강서구 대저1동 2343-4",
    description: "낙동강 하구 비옥한 삼각주 평야의 농산물과 강서 바다의 싱싱한 해산물이 모여드는 서부산의 정겨운 장터입니다.",
    tips: "봄철 짭짤이토마토와 가을철 전어 시즌에 4·9일 장날을 맞춰 방문하면 산지 직송 최고의 맛을 경험할 수 있습니다."
  },
  {
    id: "busan-junggu-jagalchi",
    name: "자갈치시장 & 국제시장",
    region: "부산",
    subRegion: "중구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (새벽 05:00 ~ 밤 22:00)",
    specialties: ["자갈치 꼼장어구이", "생선구이 골목", "씨앗호떡", "비빔당면", "유부전골"],
    address: "부산광역시 중구 자갈치해안로 52 (자갈치시장)",
    description: "‘오이소! 보이소! 사이소!’ 부산의 상징이자 대한민국 최대의 수산시장 자갈치시장과 영화로도 유명한 만물상 국제시장이 마주하고 있습니다.",
    tips: "자갈치시장 옥상 하늘전망대에서 부산항 전경을 감상하고, 비프광장 씨앗호떡과 남포동 먹자골목 투어를 추천합니다."
  },
  {
    id: "busan-busanjin-bujeon",
    name: "부전마켓타운 (부전시장)",
    region: "부산",
    subRegion: "부산진구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (새벽 04:00 ~ 저녁 19:00)",
    specialties: ["부전 명란김밥", "인삼골목", "가마솥 곰탕", "수제 어묵", "산꼼장어"],
    address: "부산광역시 부산진구 중앙대로 783번길 23",
    description: "부전역 앞에 자리한 부산 최대 규모의 종합 상설 전통시장 복합체입니다. 신선한 농수산물, 건어물, 약초, 먹거리가 끝없이 펼쳐집니다.",
    tips: "SNS에서 폭발적인 인기를 끌고 있는 두툼한 계란과 통명란이 들어간 명란김밥은 필수 코스입니다."
  },
  {
    id: "busan-dongnae-market",
    name: "동래시장",
    region: "부산",
    subRegion: "동래구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (매월 1·3주 일요일 정기휴무)",
    specialties: ["동래파전", "손칼국수 골목", "옛날 팥죽", "신선 떡골목", "수제만두"],
    address: "부산광역시 동래구 동래시장길 14",
    description: "조선시대 동래읍성 장터에서 유래하여 250년이 넘는 유구한 전통을 간직한 부산의 대표적인 상설 전통시장입니다.",
    tips: "시장 1층 칼국수 골목에서 진한 멸치 육수의 손칼국수를 맛보고, 인근 동래부 동헌 산책을 즐겨보세요."
  },
  {
    id: "busan-haeundae-market",
    name: "해운대전통시장",
    region: "부산",
    subRegion: "해운대구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (오전 09:00 ~ 자정 24:00)",
    specialties: ["짚불 산꼼장어", "상국이네 떡볶이 & 튀김", "씨앗호떡", "돼지국밥", "가마솥 통닭"],
    address: "부산광역시 해운대구 구남로41번길 22-1",
    description: "해운대 해수욕장 구남로 문화광장 바로 옆에 위치하여 바다 산책과 야식을 동시에 즐길 수 있는 부산 대표 관광형 상설시장입니다.",
    tips: "부산시립미술관이나 영화의전당 전시를 본 후 해질녘 해운대 바다를 거닐고 꼼장어에 볶음밥으로 마무리해보세요."
  },
  {
    id: "busan-yeongdo-namhang",
    name: "남항시장 (영도 전통시장)",
    region: "부산",
    subRegion: "영도구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (오전 08:00 ~ 저녁 21:00)",
    specialties: ["영도 돼지국밥", "제주복국", "조내기 고구마빵", "수제 어묵", "활어회"],
    address: "부산광역시 영도구 절영로35번길 34",
    description: "영도다리를 건너면 만나는 영도 최대의 상설 전통시장입니다. 뱃사람들과 조선소 노동자들의 애환이 담긴 든든한 먹거리가 가득합니다.",
    tips: "시장 구경 후 흰여울문화마을 해안 절벽 산책로와 깡깡이예술마을 골목 투어를 연계하기에 최고입니다."
  },
  {
    id: "busan-geumjeong-seodong",
    name: "서동 미로시장",
    region: "부산",
    subRegion: "금정구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (오전 09:00 ~ 저녁 20:00)",
    specialties: ["원조 맛나분식 계란만두", "손칼국수", "순대볶음", "가마솥 통닭"],
    address: "부산광역시 금정구 서동시장길 44",
    description: "골목골목 미로처럼 얽힌 정겨운 골목길 상설시장으로, 부산의 명물 ‘계란만두’의 발상지입니다.",
    tips: "당면과 계란을 부쳐 떡볶이 국물을 얹어 먹는 별미 계란만두를 1인분 2~3천 원대의 착한 가격에 맛보세요."
  },
  {
    id: "busan-saha-goejeong",
    name: "괴정골목시장 & 다대씨파크",
    region: "부산",
    subRegion: "사하구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (오전 09:00 ~ 저녁 20:00)",
    specialties: ["다대포 생선회", "괴정 손칼국수", "가마솥 튀김", "아구찜", "모둠전"],
    address: "부산광역시 사하구 사하로197번길 19",
    description: "사하구 주민들의 식탁을 책임지는 활기찬 상설 골목시장으로 깔끔하고 풍성한 먹거리를 자랑합니다.",
    tips: "부산현대미술관 관람 후 다대포 해변 낙조를 보고 싱싱한 회와 장터 칼국수를 즐기기에 좋습니다."
  },
  {
    id: "busan-suyeong-paldo",
    name: "수영팔도시장",
    region: "부산",
    subRegion: "수영구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (야시장 저녁 18:00 ~ 23:00)",
    specialties: ["수영 돼지국밥", "장터 닭강정", "손칼국수", "팔도 야시장 퓨전 먹거리", "떡골목"],
    address: "부산광역시 수영구 수영성로 18",
    description: "조선시대 경상좌수영 수영성터 인근의 역사적인 상설시장으로, 복합문화공간 F1963 및 망미단길과 가깝습니다.",
    tips: "F1963 대나무숲길과 현대미술 전시를 감상한 뒤 저녁에 팔도시장 야시장에서 맛있는 길거리 음식을 즐겨보세요."
  },
  {
    id: "busan-namgu-motgol",
    name: "못골골목시장",
    region: "부산",
    subRegion: "남구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (오전 08:00 ~ 저녁 20:30)",
    specialties: ["못골 수제 떡갈비", "가마솥 통닭", "수제 꽈배기", "신선 횟감", "반찬거리"],
    address: "부산광역시 남구 못골로 59",
    description: "대연동 못골역 인근에 형성된 따뜻하고 정겨운 상설 골목시장으로, 부산문화회관과 UN기념공원에서 가깝습니다.",
    tips: "부산문화회관 공연·전시 관람 후 들러 장터 특유의 인심 가득한 떡갈비와 바삭한 통닭을 포장하기 좋습니다."
  },
  {
    id: "busan-donggu-choryang",
    name: "초량전통시장 & 부산진시장",
    region: "부산",
    subRegion: "동구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (부산진시장 매월 1·3주 일요일 휴무)",
    specialties: ["초량 돼지갈비", "초량 불백", "부산 어묵 본점", "비빔당면", "팥빙수"],
    address: "부산광역시 동구 중앙대로221번길 9-1",
    description: "부산역 맞은편 초량 이바구길 초입에 위치한 대표적인 상설 도심 전통시장입니다.",
    tips: "동구문화플랫폼(구 부산진역) 전시 관람 후 초량 168계단 모노레일을 타고 내려와 불백거리를 맛보세요."
  },
  {
    id: "busan-sasang-station-market",
    name: "사상기차역전통시장 & 괘법시장",
    region: "부산",
    subRegion: "사상구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (오전 08:00 ~ 저녁 21:00)",
    specialties: ["삼락 삼계탕", "재첩국 백반", "사상 꼬꼬아찌 숯불치킨", "손두부", "가마솥 족발"],
    address: "부산광역시 사상구 사상로 200번길",
    description: "경부선 사상역과 서부시외버스터미널 인근의 교통 요충지에 위치한 실속 넘치는 상설 로컬 시장입니다.",
    tips: "삼락생태공원 갈대숲 산책과 사상생활문화센터 전시를 둘러본 후 시원하고 구수한 낙동강 재첩국 한 그릇을 추천합니다."
  },
  {
    id: "busan-yeonje-yeonil",
    name: "연일전통시장 & 거제시장",
    region: "부산",
    subRegion: "연제구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (오전 08:30 ~ 저녁 20:30)",
    specialties: ["거제리 손칼국수", "연일 족발", "장터 튀김", "가마솥 순대국", "제철 과일"],
    address: "부산광역시 연제구 연수로11번길 45",
    description: "온천천 수변공원과 배산 인근 주민들의 오랜 사랑을 받는 활기찬 생활밀착형 상설 전통시장입니다.",
    tips: "온천천 카페거리에서 브런치를 즐기고 연제문화원 전시 관람 후 정겨운 손칼국수로 든든하게 배를 채워보세요."
  },
  {
    id: "busan-seogu-chungmu",
    name: "충무동 새벽시장 & 해안시장",
    region: "부산",
    subRegion: "서구",
    marketType: "새벽시장",
    scheduleDays: [],
    scheduleDescription: "매일 새벽 03:00 ~ 오후 14:00 (새벽 특화)",
    specialties: ["선지국밥 골목", "고등어구이 백반", "제철 활어·선어", "해초류"],
    address: "부산광역시 서구 충무대로282번길 15",
    description: "남해안과 제주도에서 들어오는 산지 직송 해산물이 가장 먼저 도착하는 새벽의 활력이 살아 숨 쉬는 활어·선어 전문 새벽시장입니다.",
    tips: "이른 아침 방문해 갓 구운 바삭한 고등어구이 백반이나 얼큰한 가마솥 선지국밥으로 든든하게 아침 식사를 즐겨보세요."
  },

  // =========================================================================
  // [2] 울산광역시 대표 5일장 & 상설 전통시장
  // =========================================================================
  {
    id: "ulsan-junggu-taehwa-5day",
    name: "태화 5일장 (태화종합시장)",
    region: "울산",
    subRegion: "중구",
    marketType: "5일장",
    scheduleDays: [5, 10],
    scheduleDescription: "매월 5일 · 10일 5일장 (5일, 10일, 15일, 20일, 25일, 말일)",
    specialties: ["태화 5일장 선지국밥", "가마솥 즉석 족발", "장터 찹쌀도넛", "손만두", "태화강 재첩"],
    address: "울산광역시 중구 신기길 115",
    description: "태화강 국가정원 십리대숲 바로 옆에 열리는 울산 도심 최대의 정기 5일장입니다. 장날이면 도로변을 따라 수백 개의 정겨운 노점이 늘어섭니다.",
    tips: "울산시립미술관 전시 관람 후 태화강 국가정원 대나무숲 산책과 함께 5·10일 장터 먹거리 투어를 즐기세요."
  },
  {
    id: "ulsan-ulju-eonyang-5day",
    name: "언양 5일장 (언양알프스시장)",
    region: "울산",
    subRegion: "울주군",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (2일, 7일, 12일, 17일, 22일, 27일)",
    specialties: ["언양 한우 불고기", "언양 소머리곰탕", "장터 미나리", "단술(식혜)", "손두부"],
    address: "울산광역시 울주군 언양읍 장터2길 11-5",
    description: "영남알프스 자락 100년 역사를 지닌 영남 대표 5일장터로, 대한민국 대표 명품 언양불고기와 진한 소머리곰탕 골목이 유명합니다.",
    tips: "영남알프스 억새 등산이나 반구대 암각화 탐방 전후 2·7일 장날 곰탕 골목에서 든든한 식사를 추천합니다."
  },
  {
    id: "ulsan-ulju-namchang-5day",
    name: "남창 5일장 (남창옹기종기시장)",
    region: "울산",
    subRegion: "울주군",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["남창 장터 선지소머리국밥", "외고산 옹기", "가마솥 족발", "장터 국수", "간절곶 해산물"],
    address: "울산광역시 울주군 온양읍 남창장터길 24",
    description: "국내 최대 전통 옹기마을인 외고산 옹기마을 인근 남창역 앞에 열리는 활기찬 정기 5일장으로 소머리국밥거리가 명물입니다.",
    tips: "외고산 옹기박물관 관람과 간절곶 일출을 감상한 뒤 3·8일 장날 남창 장터국밥 한 그릇을 맛보세요."
  },
  {
    id: "ulsan-ulju-deokha-5day",
    name: "덕하 5일장 (덕하시장)",
    region: "울산",
    subRegion: "울주군",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (2일, 7일, 12일, 17일, 22일, 27일)",
    specialties: ["덕하 장터 소고기국밥", "수제 묵채", "가마솥 순대", "제철 신선 채소"],
    address: "울산광역시 울주군 청량읍 덕하로 225-1",
    description: "동해선 덕하역 바로 앞에 위치한 정겨운 시골 5일장입니다. 울산 남부권 주민들과 나들이객이 즐겨 찾는 활력 넘치는 장터입니다.",
    tips: "선암호수공원 산책 후 2·7일 장날 덕하역에 들러 구수한 장터 소고기국밥을 즐겨보세요."
  },
  {
    id: "ulsan-bukgu-hogye-5day",
    name: "호계 5일장 (호계시장)",
    region: "울산",
    subRegion: "북구",
    marketType: "5일장",
    scheduleDays: [1, 6],
    scheduleDescription: "매월 1일 · 6일 5일장 (1일, 6일, 11일, 16일, 21일, 26일)",
    specialties: ["호계 장터 순대국밥", "즉석 찹쌀 꽈배기", "정자항 활어·돌미역", "가마솥 옛날통닭"],
    address: "울산광역시 북구 호계동 850-2",
    description: "동해남부선 호계역 앞 100년 전통의 정기 5일장입니다. 정자항 바다 해산물과 영남 내륙 농산물이 교차하는 풍성한 장터입니다.",
    tips: "울산북구문화예술회관 전시를 보고 강동 몽돌해변 드라이브 후 1·6일 장날 호계시장에 들러보세요."
  },
  {
    id: "ulsan-namgu-suam-sinjeong",
    name: "신정상설시장 & 수암한우야시장",
    region: "울산",
    subRegion: "남구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (수암 한우야시장: 매주 금·토 저녁)",
    specialties: ["신정시장 칼국수 골목", "돼지국밥 골목", "수암시장 한우 초장집", "보리밥"],
    address: "울산광역시 남구 월평로47번길 15 (신정시장)",
    description: "신정시장의 유명한 칼국수 골목과 국내 최초 한우 특화 야시장으로 전국적인 명성을 얻은 수암상가시장이 인접한 울산 대표 상설시장입니다.",
    tips: "울산문화예술회관 전시 관람 후 신정시장 손칼국수나 수암시장에서 가성비 최고의 한우 구이를 맛보세요."
  },
  {
    id: "ulsan-junggu-jungang",
    name: "울산중앙전통시장 (성남동)",
    region: "울산",
    subRegion: "중구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (큰애기 야시장 저녁 상시 운영)",
    specialties: ["울산 곰장어 골목", "통닭거리", "수제 만두", "큰애기 야시장 퓨전 푸드"],
    address: "울산광역시 중구 번영로 329",
    description: "울산 원도심 성남동 문화의거리 옆에 위치한 가장 유서 깊은 상설 전통시장으로, 곰장어 골목과 옛날 통닭거리가 성업 중입니다.",
    tips: "울산시립미술관 관람 후 문화의거리 카페투어를 거쳐 저녁에 곰장어 골목에서 매콤한 곰장어구이를 즐기세요."
  },
  {
    id: "ulsan-donggu-bangeojin",
    name: "방어진항 수산시장 (동울산종합시장)",
    region: "울산",
    subRegion: "동구",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (새벽 활어판장 ~ 저녁)",
    specialties: ["방어진 활어회 & 대게", "용가자미 미역국", "성게비빔밥", "해녀 해산물"],
    address: "울산광역시 동구 중진길 39",
    description: "동해안 대표 국가어항 방어진항에 위치한 싱싱한 상설 수산시장입니다. 대왕암공원과 슬도 바위길과 인접해 있습니다.",
    tips: "대왕암공원 출렁다리와 해맞이 전시를 감상한 뒤 방어진 활어회센터에서 갓 잡은 싱싱한 회를 즐겨보세요."
  },

  // =========================================================================
  // [3] 경상남도 18개 시·군 대표 5일장 & 상설 전통시장 (전 시군 체계화)
  // =========================================================================

  // --- [1. 밀양시] ---
  {
    id: "gyeongnam-miryang-arirang",
    name: "밀양아리랑시장",
    region: "경남",
    subRegion: "밀양시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (새벽 06:00 ~ 저녁 20:00)",
    specialties: ["원조 밀양 돼지국밥 (단골집·동부식당)", "보리밥 골목", "전통 장터 순대", "밀양 대추빵", "얼음골 사과"],
    address: "경상남도 밀양시 상설시장3길 18-16",
    description: "조선시대 성남장터에서 시작되어 500여 년의 역사를 품은 밀양 대표 상설시장입니다. 백년가게 단골집 등 원조 밀양 돼지국밥 골목과 보리밥 거리가 매일 상시 열려 있습니다.",
    tips: "국보 영남루와 밀양아리랑아트센터 전시를 둘러본 뒤 사계절 언제 방문해도 뜨끈한 원조 돼지국밥을 맛보실 수 있는 상설 전통시장입니다."
  },
  {
    id: "gyeongnam-miryang-gago-5day",
    name: "밀양 5일장 (가곡시장 / 밀양역·터미널)",
    region: "경남",
    subRegion: "밀양시",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (2일, 7일, 12일, 17일, 22일, 27일)",
    specialties: ["장터 소머리국밥", "가마솥 통닭", "얼음골 사과", "제철 산나물", "장터 찹쌀도넛"],
    address: "경상남도 밀양시 가곡13길 12 (가곡동 일대)",
    description: "밀양역과 시외버스터미널 인근 가곡동 일대에 2일과 7일마다 대규모로 서는 밀양 대표 정기 5일장입니다. 시골 어르신들이 직접 가꾼 싱싱한 농산물과 풍성한 장터 먹거리가 열립니다.",
    tips: "2·7일 장날에 맞춰 밀양역에 내리면 기차 여행과 함께 흥겨운 시골 5일장의 정취를 만끽할 수 있습니다."
  },
  {
    id: "gyeongnam-miryang-samnangjin-5day",
    name: "삼랑진 5일장 (송지시장)",
    region: "경남",
    subRegion: "밀양시",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["전국 1등 삼랑진 딸기", "낙동강 민물 매운탕", "가마솥 팥칼국수", "시골 장터 촌국수", "안태호 제철 채소"],
    address: "경상남도 밀양시 삼랑진읍 송지백인길 16 (삼랑진역 앞)",
    description: "경부선과 경전선 철도가 만나는 교통의 요충지 삼랑진역 앞 송지리에 서는 70년 전통 5일장입니다. 삼랑진 명품 딸기와 낙동강 민물고기, 정겨운 장터 국수를 만날 수 있습니다.",
    tips: "만어사 너덜경 돌강과 안태호 드라이브를 즐기고, 4·9일 삼랑진 장날에 들러 달콤한 삼랑진 딸기와 촌국수를 맛보세요."
  },
  {
    id: "gyeongnam-miryang-muan-5day",
    name: "무안 5일장 (밀양 무안시장)",
    region: "경남",
    subRegion: "밀양시",
    marketType: "5일장",
    scheduleDays: [1, 6],
    scheduleDescription: "매월 1일 · 6일 5일장 (1일, 6일, 11일, 16일, 21일, 26일)",
    specialties: ["원조 무안 돼지국밥 (동부식당·무안식당)", "표충비각 장터 떡", "무안 고추·마늘 농산물"],
    address: "경상남도 밀양시 무안면 무안리 803-1",
    description: "땀 흘리는 표충비각으로 유명한 무안면에 서는 1·6일 5일장입니다. 소뼈와 돼지뼈를 맑게 고아낸 70년 원조 무안 돼지국밥의 본고장입니다.",
    tips: "표충비각을 둘러보고 1·6일 장날 맑고 깊은 국물의 원조 무안 돼지국밥을 즐겨보세요."
  },
  {
    id: "gyeongnam-miryang-susan-5day",
    name: "수산 5일장 (하남 수산시장)",
    region: "경남",
    subRegion: "밀양시",
    marketType: "5일장",
    scheduleDays: [5, 10],
    scheduleDescription: "매월 5일 · 10일 5일장 (5일, 10일, 15일, 20일, 25일, 30일)",
    specialties: ["수산 국수", "낙동강 민물 웅어회", "수산 가마솥 선지국", "하남 참외·멜론"],
    address: "경상남도 밀양시 하남읍 수산중앙로 45",
    description: "낙동강 수산대교 옆 하남들판의 풍요로움을 담은 유서 깊은 5·10일 5일장입니다.",
    tips: "명례성지 성당과 낙동강 자전거길 라이딩 후 5·10일 수산 장날 장터 촌국수를 즐겨보세요."
  },

  // --- [2. 창원시] ---
  {
    id: "gyeongnam-changwon-masan-fish",
    name: "마산어시장",
    region: "경남",
    subRegion: "창원시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (새벽 05:00 ~ 저녁 21:00)",
    specialties: ["마산 아구찜 골목", "통술거리 먹거리", "마산 가을 전어회", "장어구이"],
    address: "경상남도 창원시 마산합포구 복요리로 37",
    description: "260년 역사를 자랑하는 전국 굴지의 상설 수산물 시장으로 마산만 해안을 따라 거대한 어시장이 형성되어 있습니다.",
    tips: "경남도립미술관 관람 후 용지호수를 거쳐 마산어시장 아구찜 골목에서 원조 건아구찜을 맛보세요."
  },
  {
    id: "gyeongnam-changwon-jinhae-jungang",
    name: "진해중앙시장",
    region: "경남",
    subRegion: "창원시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (오전 08:00 ~ 저녁 20:30)",
    specialties: ["진해 피자칼국수", "진해 벚꽃빵", "장터 어묵", "활어회"],
    address: "경상남도 창원시 진해구 벚꽃로60번길 19-2",
    description: "진해 군항제와 벚꽃의 중심에 위치한 활기찬 도심 상설시장입니다.",
    tips: "진해루 해변공원 산책과 여좌천 로망스다리를 구경하고 중앙시장 먹거리 골목을 둘러보세요."
  },
  {
    id: "gyeongnam-changwon-masan-station-5day",
    name: "마산 번개 5일장 (마산역)",
    region: "경남",
    subRegion: "창원시",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (새벽 05:00 ~ 정오 12:00 번개장)",
    specialties: ["장터 촌두부", "제철 신선 채소", "가마솥 도넛", "장터 국밥"],
    address: "경상남도 창원시 마산회원구 마산역광장로 18",
    description: "마산역 광장 일대에 2일과 7일 새벽부터 열리는 생동감 넘치는 번개 5일장입니다.",
    tips: "이른 아침 마산역에 도착해 번개 장터의 활기를 느끼고 갓 부친 촌두부를 맛보세요."
  },
  {
    id: "gyeongnam-changwon-jindong-5day",
    name: "진동 5일장 (진동시장)",
    region: "경남",
    subRegion: "창원시",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["진동 미더덕 & 오만둥이", "불꽃 낙지", "진동 활어회", "장터 국밥"],
    address: "경상남도 창원시 마산합포구 진동면 진동시장길 47",
    description: "미더덕의 전국 최대 산지 진동만에 열리는 해양 5일장입니다.",
    tips: "광암해수욕장 산책 후 4·9일 장날 진동시장에서 향긋한 미더덕된장찌개와 비빔밥을 즐겨보세요."
  },

  // --- [3. 김해시] ---
  {
    id: "gyeongnam-gimhae-dongsang",
    name: "김해동상시장 (칼국수타운)",
    region: "경남",
    subRegion: "김해시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (오전 08:00 ~ 저녁 20:00)",
    specialties: ["김해 칼국수타운 손칼국수", "김해 뒷고기", "다문화 글로벌 푸드", "장터 족발"],
    address: "경상남도 김해시 분성로335번길 22",
    description: "가야 왕도 김해의 원도심 상설 전통시장으로, 9개 칼국수 집이 모인 칼국수타운이 명물입니다.",
    tips: "클레이아크김해미술관 관람 후 동상시장 칼국수타운에서 착한 가격의 푸짐한 손칼국수를 즐기세요."
  },
  {
    id: "gyeongnam-gimhae-jinyeong-5day",
    name: "진영 5일장 (진영대창시장)",
    region: "경남",
    subRegion: "김해시",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["진영 명품 단감", "진영 갈비", "장터 가마솥 족발", "옛날 통닭"],
    address: "경상남도 김해시 진영읍 진영로160번길 13",
    description: "단감의 본고장 진영읍에 열리는 100년 전통 5일장터입니다.",
    tips: "봉하마을과 화포천습지생태공원 나들이 후 4·9일 진영 장날 달콤한 단감과 장터 먹거리를 맛보세요."
  },

  // --- [4. 진주시] ---
  {
    id: "gyeongnam-jinju-jungang",
    name: "진주중앙유등시장 & 논개시장",
    region: "경남",
    subRegion: "진주시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "매일 상설 운영 (올빰야시장: 매주 토요일 저녁)",
    specialties: ["진주 육회비빔밥 (천황식당·제일식당)", "진주 꿀빵", "수복빵집 찐빵", "장터 땡초김밥"],
    address: "경상남도 진주시 진양호로547번길 8-1",
    description: "1884년 개설된 140년 역사의 서부 경남 최대 상설 전통시장입니다. 진주성 촉석루와 가깝습니다.",
    tips: "국립진주박물관 특별전을 본 후 중앙시장에서 칠보화반 진주 육회비빔밥과 달콤한 꿀빵을 즐기세요."
  },
  {
    id: "gyeongnam-jinju-munsan-5day",
    name: "문산 5일장 (문산시장)",
    region: "경남",
    subRegion: "진주시",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["문산 전통 생막걸리", "장터 소고기국밥", "문산 배", "가마솥 순대"],
    address: "경상남도 진주시 문산읍 삼곡길 4-1",
    description: "진주 동부권 문산읍에 서는 5일장으로, 전국적으로 유명한 문산 막걸리와 시골 인심이 넘칩니다.",
    tips: "진주성 관람 후 4·9일 문산 장날에 들러 알싸한 문산 막걸리에 장터 전을 곁들여보세요."
  },
  {
    id: "gyeongnam-jinju-banseong-5day",
    name: "반성 5일장 (일반성시장)",
    region: "경남",
    subRegion: "진주시",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["반성 장터 수육국밥", "경상남도수목원 나물", "장터 팥죽", "옛날 찐빵"],
    address: "경상남도 진주시 일반성면 동부로1960번길 6",
    description: "경상남도수목원(반성수목원) 바로 인근에 열리는 고즈넉한 정통 시골 5일장터입니다.",
    tips: "경상남도수목원 숲길을 산책한 뒤 3·8일 반성 장날 따끈한 국밥 한 그릇을 추천합니다."
  },

  // --- [5. 양산시] ---
  {
    id: "gyeongnam-yangsan-nambu",
    name: "양산남부시장 (상설 + 1·6일 5일장)",
    region: "경남",
    subRegion: "양산시",
    marketType: "5일장",
    scheduleDays: [1, 6],
    scheduleDescription: "매월 1일 · 6일 5일장 (상설 점포는 매일 운영)",
    specialties: ["양산 가마솥 팥죽", "남부 손칼국수", "장터 족발", "원동 미나리삼겹살", "수제 어묵"],
    address: "경상남도 양산시 탑골길 7",
    description: "양산천변에 위치한 양산 최대의 전통시장으로, 상설 상가와 함께 1·6일이면 거대한 5일장이 더해집니다.",
    tips: "양산 쌍벽루아트홀과 황산공원을 거닐고 1·6일 장터 팥죽골목에서 달콤한 팥죽 한 그릇을 추천합니다."
  },
  {
    id: "gyeongnam-yangsan-deokgye-5day",
    name: "덕계 5일장 (웅상시장)",
    region: "경남",
    subRegion: "양산시",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["웅상 소머리국밥", "가마솥 통닭", "회야강 제철 채소", "장터 손두부"],
    address: "경상남도 양산시 덕계2길 11",
    description: "양산 웅상출장소 도심 회야강변에 3일과 8일에 크게 서는 활기찬 5일장입니다.",
    tips: "웅상문화체육센터 전시 관람 후 3·8일 덕계 장날 푸짐한 장터 국밥을 즐겨보세요."
  },

  // --- [6. 통영시] ---
  {
    id: "gyeongnam-tongyeong-seoho",
    name: "통영 서호전통시장 & 중앙전통시장",
    region: "경남",
    subRegion: "통영시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "서호시장: 새벽 04:00 ~ 오후 / 중앙시장: 매일 오전 ~ 밤 (상설)",
    specialties: ["통영 훈이네 시락국", "충무김밥", "통영 꿀빵", "멍게비빔밥", "동피랑 활어회", "졸복국"],
    address: "경상남도 통영시 새터길 42-9 (서호시장)",
    description: "새벽 바다를 여는 서호시장(시락국·복국)과 동피랑 아래 활어회가 넘치는 중앙시장이 통영의 상설 미식을 대표합니다.",
    tips: "통영옻칠미술관 전시 관람 후 서호시장에서 구수한 시락국 한 그릇과 중앙시장 꿀빵 골목을 탐방해보세요."
  },

  // --- [7. 사천시] ---
  {
    id: "gyeongnam-sacheon-samcheonpo",
    name: "삼천포용궁수산시장",
    region: "경남",
    subRegion: "사천시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (새벽 활어판장 ~ 밤 22:00)",
    specialties: ["삼천포 쥐치포 & 건어물", "삼천포 활어회", "바지락 해물칼국수", "사천 멸치쌈밥"],
    address: "경상남도 사천시 어시장길 64",
    description: "400여 개 수산 점포가 바다와 맞닿아 있는 남해안 최고의 상설 어시장입니다.",
    tips: "사천미술관 바다 전시와 바다케이블카 탑승 후 용궁시장에서 노릇하게 구운 쥐포와 활어회를 즐기세요."
  },
  {
    id: "gyeongnam-sacheon-eup-5day",
    name: "사천읍 5일장 (사천읍시장)",
    region: "경남",
    subRegion: "사천시",
    marketType: "5일장",
    scheduleDays: [5, 10],
    scheduleDescription: "매월 5일 · 10일 5일장 (5일, 10일, 15일, 20일, 25일, 30일)",
    specialties: ["사천 멸치쌈밥", "사천 장터 촌국수", "가마솥 족발", "단감·참다래"],
    address: "경상남도 사천시 사천읍 시장1길 16",
    description: "사천 항공우주박물관 인근 사천읍에 5일과 10일마다 서는 70년 전통 5일장입니다.",
    tips: "항공우주박물관 관람 후 5·10일 사천읍 장날 칼칼한 멸치쌈밥과 장터 촌국수를 맛보세요."
  },
  {
    id: "gyeongnam-sacheon-gonyang-5day",
    name: "곤양 5일장 (곤양시장)",
    region: "경남",
    subRegion: "사천시",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["곤양 막걸리", "지리산 자락 장터 나물", "수제 손두부", "가마솥 순대"],
    address: "경상남도 사천시 곤양면 구호서길 14",
    description: "조선시대 서부 경남 교통 요충지였던 곤양면에 3일과 8일마다 서는 고즈넉한 5일장입니다.",
    tips: "다솔사 숲길을 걷고 3·8일 곤양 장날 구수한 손두부와 막걸리를 곁들여보세요."
  },

  // --- [8. 거제시] ---
  {
    id: "gyeongnam-geoje-gohyeon",
    name: "거제 고현시장",
    region: "경남",
    subRegion: "거제시",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (오전 08:00 ~ 저녁 21:00)",
    specialties: ["거제 멍게비빔밥", "도다리쑥국 & 굴구이", "고현 충무김밥", "순대국밥 골목", "바람의 핫도그"],
    address: "경상남도 거제시 거제중앙로17길 6",
    description: "에메랄드빛 거제 바다의 제철 수산물과 활력 넘치는 먹거리 장터가 어우러진 거제도 최대 상설 전통시장입니다.",
    tips: "거제문화예술회관 오션뷰 전시 관람 후 고현시장에 들러 제철 자연산 횟감과 향긋한 멍게비빔밥을 맛보세요."
  },
  {
    id: "gyeongnam-geoje-myeon-5day",
    name: "거제면 5일장 (거제장터)",
    region: "경남",
    subRegion: "거제시",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["거제 굴구이", "장터 보리밥", "활어 막회", "유자 빵"],
    address: "경상남도 거제시 거제면 옥산로 10",
    description: "거제향교와 거제식물원 정글돔 인근 옛 거제현 관아 자리에 열리는 4·9일 전통 5일장입니다.",
    tips: "거제식물원 정글돔을 관람하고 4·9일 거제면 장날 싱싱한 해산물 장터를 둘러보세요."
  },

  // --- [9. 창녕군] ---
  {
    id: "gyeongnam-changnyeong-5day",
    name: "창녕 5일장 (창녕전통시장)",
    region: "경남",
    subRegion: "창녕군",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["창녕 수구레국밥 (수문장국밥)", "창녕 양파빵", "우포늪 논고동국", "장터 튀김"],
    address: "경상남도 창녕군 창녕읍 창녕장터로 28",
    description: "유네스코 세계유산 교동·송현동 고분군 바로 옆에 위치하며, 쫄깃하고 얼큰한 수구레국밥으로 전국적인 5일장 미식 성지입니다.",
    tips: "창녕박물관 비화가야 특별전 관람 후 3·8일 장날 가마솥에서 펄펄 끓는 매콤한 수구레국밥을 꼭 드셔보세요."
  },
  {
    id: "gyeongnam-changnyeong-yeongsan-5day",
    name: "영산 5일장 (영산시장)",
    region: "경남",
    subRegion: "창녕군",
    marketType: "5일장",
    scheduleDays: [5, 10],
    scheduleDescription: "매월 5일 · 10일 5일장 (5일, 10일, 15일, 20일, 25일, 30일)",
    specialties: ["영산 장터 선지국밥", "창녕 양파", "부곡온천 두부", "수제 도넛"],
    address: "경상남도 창녕군 영산면 영산시장길 15",
    description: "부곡온천과 영산 만년교 인근에 서는 유서 깊은 5·10일 5일장터입니다.",
    tips: "부곡온천 힐링욕 후 5·10일 영산 장날 만년교를 둘러보고 장터 선지국밥을 맛보세요."
  },
  {
    id: "gyeongnam-changnyeong-namji-5day",
    name: "남지 5일장 (남지시장)",
    region: "경남",
    subRegion: "창녕군",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (2일, 7일, 12일, 17일, 22일, 27일)",
    specialties: ["남지 낙동강 메기매운탕", "낙동강 유채꿀", "장터 국수", "수제 어묵"],
    address: "경상남도 창녕군 남지읍 남지중앙2길 21",
    description: "낙동강 유채축제로 유명한 남지철교 옆에 2일과 7일마다 열리는 풍요로운 5일장터입니다.",
    tips: "남지 유채밭 수변공원 산책 후 2·7일 남지 장날 메기매운탕을 즐겨보세요."
  },

  // --- [10. 함안군] ---
  {
    id: "gyeongnam-haman-gaya-5day",
    name: "가야 5일장 (함안가야시장)",
    region: "경남",
    subRegion: "함안군",
    marketType: "5일장",
    scheduleDays: [5, 10],
    scheduleDescription: "매월 5일 · 10일 5일장 (5일, 10일, 15일, 20일, 25일, 30일)",
    specialties: ["함안 한우 소고기국밥 (대구식당·한양식당)", "아라홍련 연잎밥", "가야 수박", "장터 튀김"],
    address: "경상남도 함안군 가야읍 가야시장길 41",
    description: "아라가야 말이산 고분군 인근의 유서 깊은 5일장으로, 60년 넘게 가마솥에 푹 고아낸 얼큰하고 진한 한우 소고기국밥거리가 명품입니다.",
    tips: "함안박물관 세계유산 전시와 악양생태공원 나들이 후 5·10일 장날 소고기국밥에 밥과 국수를 함께 말아 즐기세요."
  },
  {
    id: "gyeongnam-haman-gunbuk-5day",
    name: "군북 5일장 (군북시장)",
    region: "경남",
    subRegion: "함안군",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["군북 백이산 막걸리", "가마솥 순대국", "제철 밭나물", "장터 옛날꽈배기"],
    address: "경상남도 함안군 군북면 중암8길 18",
    description: "경전선 군북역 앞에 4일과 9일마다 열리는 정겨운 시골 5일장입니다.",
    tips: "대암 이태준 기념관 관람 후 4·9일 군북 장날에 들러 푸짐한 장터 순대국을 맛보세요."
  },

  // --- [11. 의령군] ---
  {
    id: "gyeongnam-uiryeong-5day",
    name: "의령 5일장 (의령전통시장)",
    region: "경남",
    subRegion: "의령군",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["원조 의령소바 (메밀국수)", "의령 망개떡 (남산떡간)", "의령 가마솥 소고기국밥", "가례 불고기"],
    address: "경상남도 의령군 의령읍 의병로20길 4-6",
    description: "의병의 고장 의령읍 중심의 5일장으로, 전국 3대 메밀국수인 의령소바 본점과 향긋한 망개떡의 원조입니다.",
    tips: "의병박물관과 남강 솥바위(부자명당) 투어 후 3·8일 장날 온소바와 갓 쪄낸 쫄깃한 망개떡을 맛보세요."
  },
  {
    id: "gyeongnam-uiryeong-sinban-5day",
    name: "신반 5일장 (신반시장)",
    region: "경남",
    subRegion: "의령군",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["신반 한지", "가마솥 선지국밥", "의령 밭마늘", "장터 촌두부"],
    address: "경상남도 의령군 부림면 신반로 91",
    description: "전통 한지마을로 유명한 부림면 신반리에 서는 4·9일 5일장터입니다.",
    tips: "한우산 드라이브 후 4·9일 신반 장날 들러 구수한 선지국밥 한 그릇을 즐겨보세요."
  },

  // --- [12. 고성군] ---
  {
    id: "gyeongnam-goseong-5day",
    name: "고성 5일장 (고성시장)",
    region: "경남",
    subRegion: "고성군",
    marketType: "5일장",
    scheduleDays: [1, 6],
    scheduleDescription: "매월 1일 · 6일 5일장 (1일, 6일, 11일, 16일, 21일, 26일)",
    specialties: ["고성 청정 가리비찜", "바다장어구이", "장터 팥칼국수", "고성 갯장어(하모)회", "해물뚝배기"],
    address: "경상남도 고성군 고성읍 중앙로 43",
    description: "해상왕국 소가야의 역사와 자란만 청정 바다의 해산물이 집결하는 남해안 대표 5일장입니다.",
    tips: "고성박물관과 송학동 고분군을 탐방한 후 1·6일 장날 싱싱한 가리비와 바다장어구이로 원기를 보충하세요."
  },
  {
    id: "gyeongnam-goseong-baedun-5day",
    name: "배둔 5일장 (배둔시장)",
    region: "경남",
    subRegion: "고성군",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["당항포 굴구이", "장터 보리밥", "가마솥 순대", "바다 해조류"],
    address: "경상남도 고성군 회화면 배둔로 23",
    description: "당항포 관광지 인근 회화면 배둔리에 4일과 9일마다 열리는 정겨운 어촌 5일장입니다.",
    tips: "당항포 이순신 테마파크를 둘러보고 4·9일 배둔 장날 싱싱한 굴과 회를 맛보세요."
  },

  // --- [13. 하동군] ---
  {
    id: "gyeongnam-hadong-hwagae",
    name: "화개장터",
    region: "경남",
    subRegion: "하동군",
    marketType: "상설시장",
    scheduleDays: [],
    scheduleDescription: "연중무휴 매일 상설 운영 (오전 09:00 ~ 저녁 18:30)",
    specialties: ["섬진강 재첩국 & 재첩회무침", "참게가리장국", "은어튀김", "하동 녹차호떡", "지리산 산나물"],
    address: "경상남도 하동군 화개면 쌍계로 15",
    description: "‘전라도와 경상도를 가로지르는’ 노래로 유명한 대한민국 대표 관광 상설시장입니다. 지리산 청정 임산물이 모입니다.",
    tips: "지리산아트팜 대지예술 전시를 둘러보고 화개장터에서 섬진강 맑은 물에 잡은 시원한 재첩국과 녹차호떡을 즐겨보세요."
  },
  {
    id: "gyeongnam-hadong-gongseol-5day",
    name: "하동 5일장 (하동공설시장)",
    region: "경남",
    subRegion: "하동군",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (2일, 7일, 12일, 17일, 22일, 27일)",
    specialties: ["지리산 야생 고사리", "참게탕", "섬진강 재첩", "가마솥 옛날통닭"],
    address: "경상남도 하동군 하동읍 중앙로 52",
    description: "하동읍 중심 섬진강변에 2일과 7일마다 열리는 100년 전통의 대형 정기 5일장입니다.",
    tips: "송림공원 솔숲 산책 후 2·7일 하동 장날 지리산 산나물과 참게탕의 진한 맛을 느껴보세요."
  },
  {
    id: "gyeongnam-hadong-jingyo-5day",
    name: "진교 5일장 (진교시장)",
    region: "경남",
    subRegion: "하동군",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["남해안 활어회", "진교 막걸리", "가마솥 순대국밥", "장터 촌두부"],
    address: "경상남도 하동군 진교면 민다리길 45",
    description: "남해고속도로 진교IC 인근 남해와 하동의 길목에 서는 활력 넘치는 3·8일 5일장입니다.",
    tips: "금오산 짚와이어 체험 후 3·8일 진교 장날 들러 푸짐한 장터 순대국밥을 즐겨보세요."
  },

  // --- [14. 남해군] ---
  {
    id: "gyeongnam-namhae-market-5day",
    name: "남해 5일장 (남해전통시장)",
    region: "경남",
    subRegion: "남해군",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (수산물 상가는 상시 운영)",
    specialties: ["남해 죽방렴 멸치쌈밥", "남해 유자빵 & 유자막걸리", "전복물회", "돌문어숙회", "시금치(보물초)"],
    address: "경상남도 남해군 남해읍 화전로 110",
    description: "남해 보물섬의 중심 120년 전통시장으로, 죽방렴 멸치와 청정 남해 바다의 싱싱한 해산물이 모여듭니다.",
    tips: "바람흔적미술관과 독일마을을 여행한 뒤 2·7일 장날 남해시장에서 매콤 짭조름한 멸치쌈밥을 맛보세요."
  },
  {
    id: "gyeongnam-namhae-jijok-5day",
    name: "지족 5일장 (지족시장)",
    region: "경남",
    subRegion: "남해군",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["죽방렴 생멸치회", "지족 바지락칼국수", "돌미역", "남해 마늘"],
    address: "경상남도 남해군 삼동면 지족로 152",
    description: "국가명승 제71호 남해 지족해협 죽방렴 바로 옆에 열리는 아담하고 정겨운 3·8일 어촌 5일장터입니다.",
    tips: "창선교 위에서 죽방렴 원시 어업을 감상하고 3·8일 지족 장날 싱싱한 멸치회무침을 맛보세요."
  },

  // --- [15. 산청군] ---
  {
    id: "gyeongnam-sancheong-5day",
    name: "산청 5일장 (산청시장)",
    region: "경남",
    subRegion: "산청군",
    marketType: "5일장",
    scheduleDays: [1, 6],
    scheduleDescription: "매월 1일 · 6일 5일장 (1일, 6일, 11일, 16일, 21일, 26일)",
    specialties: ["지리산 산청 흑돼지 구이", "지리산 산채비빔밥 & 약초튀김", "메뚜기쌀 떡", "산청 곶감"],
    address: "경상남도 산청군 산청읍 꽃봉산로79번길 19",
    description: "동의보감의 고향 산청의 1,000여 종 약초와 지리산 청정 임산물이 직거래되는 대한민국 대표 약초 5일장터입니다.",
    tips: "동의보감촌 한의학박물관 관람 후 1·6일 장날 쫄깃한 지리산 흑돼지 소금구이와 향긋한 약초 반찬을 즐겨보세요."
  },
  {
    id: "gyeongnam-sancheong-deoksan-5day",
    name: "덕산 5일장 (덕산시장)",
    region: "경남",
    subRegion: "산청군",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["산청 덕산 명품 곶감", "지리산 고로쇠물", "산청 흑돼지 국밥", "당귀·둥굴레 약초"],
    address: "경상남도 산청군 시천면 남명로 212",
    description: "지리산 천왕봉으로 향하는 중산리 입구 시천면에 열리는 4·9일 지리산 관문 5일장입니다.",
    tips: "남명 조식 기념관과 지리산 등산 후 4·9일 덕산 장날 달콤쫀득한 덕산 곶감을 꼭 맛보세요."
  },

  // --- [16. 함양군] ---
  {
    id: "gyeongnam-hamyang-jirisang-5day",
    name: "함양지리산 5일장 (함양시장)",
    region: "경남",
    subRegion: "함양군",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (2일, 7일, 12일, 17일, 22일, 27일)",
    specialties: ["지리산 흑돼지 순대국밥", "함양 산삼막걸리", "지리산 산나물", "장터 촌두부"],
    address: "경상남도 함양군 함양읍 중앙시장길 11-1",
    description: "지리산과 덕유산의 맑은 정기 아래 2일과 7일마다 열리는 영남 서부권의 대표 5일장입니다.",
    tips: "함양 상림공원 천년숲과 문화예술회관 전시를 관람한 뒤 푸짐한 흑돼지 순대국밥과 산삼막걸리를 맛보세요."
  },
  {
    id: "gyeongnam-hamyang-anui-5day",
    name: "안의 5일장 (안의시장)",
    region: "경남",
    subRegion: "함양군",
    marketType: "5일장",
    scheduleDays: [5, 10],
    scheduleDescription: "매월 5일 · 10일 5일장 (5일, 10일, 15일, 20일, 25일, 30일)",
    specialties: ["안의 원조 갈비찜 & 갈비탕 (삼원수라간·안의갈비)", "화림동 메밀국수", "장터 조청"],
    address: "경상남도 함양군 안의면 당본길 17",
    description: "전국적으로 명성이 자자한 푸짐한 안의 소갈비찜의 본고장 안의면에 5일과 10일마다 열리는 장터입니다.",
    tips: "화림동계곡 농월정과 거연정을 거닐고 5·10일 안의 장날 부드러운 원조 소갈비찜을 맛보세요."
  },

  // --- [17. 거창군] ---
  {
    id: "gyeongnam-geochang-5day",
    name: "거창 5일장 (거창전통시장)",
    region: "경남",
    subRegion: "거창군",
    marketType: "5일장",
    scheduleDays: [1, 6],
    scheduleDescription: "매월 1일 · 6일 5일장 (1일, 6일, 11일, 16일, 21일, 26일)",
    specialties: ["거창 명품 애우(한우)", "어탕국수 & 어탕밥", "거창 피순대국밥", "거창 사과빵 & 사과즙"],
    address: "경상남도 거창군 거창읍 시장1길 33",
    description: "지리산·덕유산·가야산 3대 국립공원에 둘러싸인 거창의 중심 장터로, 어탕국수와 피순대 골목이 유명한 1·6일 5일장입니다.",
    tips: "거창박물관 수승대 특별전과 감악산 풍력단지를 구경하고 1·6일 장날 구수한 어탕국수를 맛보세요."
  },
  {
    id: "gyeongnam-geochang-gajo-5day",
    name: "가조 5일장 (가조시장)",
    region: "경남",
    subRegion: "거창군",
    marketType: "5일장",
    scheduleDays: [4, 9],
    scheduleDescription: "매월 4일 · 9일 5일장 (4일, 9일, 14일, 19일, 24일, 29일)",
    specialties: ["가조 온천 미나리", "가조 손두부", "우두산 약초", "가마솥 장터국밥"],
    address: "경상남도 거창군 가조면 지산로 1438",
    description: "우두산 Y자형 출렁다리와 백두산천지온천 인근 가조분지에 4일과 9일마다 열리는 온천 5일장터입니다.",
    tips: "우두산 Y자 출렁다리 트레킹 후 4·9일 가조 장날 장터국밥과 온천욕을 즐겨보세요."
  },

  // --- [18. 합천군] ---
  {
    id: "gyeongnam-hapcheon-wanghu-5day",
    name: "합천왕후 5일장 (합천왕후시장)",
    region: "경남",
    subRegion: "합천군",
    marketType: "5일장",
    scheduleDays: [3, 8],
    scheduleDescription: "매월 3일 · 8일 5일장 (3일, 8일, 13일, 18일, 23일, 28일)",
    specialties: ["합천 토종 돼지국밥", "합천 황매산 밤묵밥", "합천 양파라면", "장터 옛날순대"],
    address: "경상남도 합천군 합천읍 옥산로 38",
    description: "가야산 해인사와 황강변에 자리한 유서 깊은 장터로, 3일과 8일에 크게 열리는 합천 대표 5일장입니다.",
    tips: "합천영상테마파크와 정양늪 생태공원 관람 후 3·8일 왕후시장 장날 따끈한 토종 돼지국밥을 맛보세요."
  },
  {
    id: "gyeongnam-hapcheon-samga-5day",
    name: "삼가 5일장 (삼가시장 한우거리)",
    region: "경남",
    subRegion: "합천군",
    marketType: "5일장",
    scheduleDays: [2, 7],
    scheduleDescription: "매월 2일 · 7일 5일장 (2일, 7일, 12일, 17일, 22일, 27일)",
    specialties: ["삼가 명품 한우구이 거리 (삼가식당)", "무쇠판 한우 된장찌개", "삼가 장터국밥", "합천 율피떡"],
    address: "경상남도 합천군 삼가면 삼가중앙길 26",
    description: "가성비 최고의 마블링 한우로 전국 미식가들이 몰려드는 삼가 한우거리가 위치한 2·7일 정기 5일장입니다.",
    tips: "합천박물관 옥전고분군 전시 관람 후 삼가 한우마을에서 무쇠 돌판에 구워 먹는 명품 한우와 된장찌개를 추천합니다."
  }
];
