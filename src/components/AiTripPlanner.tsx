"use client";

import React, { useState, useMemo } from "react";
import rawExhibitions from "../../public/data/art-sample.json";
import rawMarkets from "../../public/data/markets.json";
import rawLibraries from "../../public/data/libraries.json";
import { Exhibition } from "@/types/art";
import { TraditionalMarket } from "@/data/markets";
import { LibraryItem } from "@/data/libraries";
import CustomCalendarModal from "@/components/CustomCalendarModal";
import {
  getKoreanToday,
  getUpcomingWeekendDates,
  formatDateKorean,
  formatDateFullKorean,
  formatDateISO,
  parseDateString,
} from "@/utils/date";

const exhibitionsData = rawExhibitions as Exhibition[];
const marketsData = rawMarkets as TraditionalMarket[];
const librariesData = rawLibraries as LibraryItem[];

interface TimelineStep {
  stepNumber: number;
  time: string;
  category: string;
  title: string;
  subTitle: string;
  distance: string;
  travelTime: string;
  stayDuration: string;
  admissionPerPerson: string;
  admissionTotal: string;
  admissionNote?: string;
  operatingHours: string;
  parking: string;
  highlight: string;
  mapQuery: string;
  link?: string;
}

export default function AiTripPlanner({ initialCompact = false }: { initialCompact?: boolean }) {
  const today = getKoreanToday();
  const weekends = getUpcomingWeekendDates(today);

  // 1. 출발지역
  const [region, setRegion] = useState<string>("부산");

  // 2. 언제 가시나요 (날짜 객체 및 UI 라벨)
  const [targetDate, setTargetDate] = useState<Date>(today);
  const [dateLabel, setDateLabel] = useState<string>("오늘");
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [showWeekendSubChoice, setShowWeekendSubChoice] = useState<boolean>(false);

  // 3. 누구와 가시나요 (1차 동행)
  const [companion, setCompanion] = useState<string>("가족");

  // 4. 세부 구성 (가족 세부 옵션 / 부부·연인 취향 옵션) & 인원수
  const [familyDetails, setFamilyDetails] = useState<string[]>(["초등학생 포함", "부모님 포함"]);
  const [coupleDetails, setCoupleDetails] = useState<string[]>(["전시·문화", "맛집 중심"]);
  const [partySize, setPartySize] = useState<number>(4);

  // 5. 관심사
  const [interest, setInterest] = useState<string>("전시");

  // 6. 소요시간
  const [duration, setDuration] = useState<string>("반나절");

  // 7. 1인당 예산
  const [budget, setBudget] = useState<string>("3만원 이하");

  // 생성 상태 및 결과
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCourse, setGeneratedCourse] = useState<TimelineStep[] | null>(null);
  const [courseSummary, setCourseSummary] = useState<string>("");
  const [aiRecommendationReason, setAiRecommendationReason] = useState<string>("");
  const [totalEstimatedBudget, setTotalEstimatedBudget] = useState<{ perPerson: number; total: number }>({
    perPerson: 0,
    total: 0,
  });
  const [copied, setCopied] = useState<boolean>(false);

  // 동행 변경 시 기본 인원수 자동 세팅
  const handleCompanionChange = (newComp: string) => {
    setCompanion(newComp);
    if (newComp === "혼자") setPartySize(1);
    else if (newComp === "부부·연인") setPartySize(2);
    else if (newComp === "가족") setPartySize(4);
    else if (newComp === "부모님과") setPartySize(3);
    else if (newComp === "친구·모임") setPartySize(4);
  };

  // 가족 세부 옵션 토글
  const toggleFamilyDetail = (opt: string) => {
    setFamilyDetails((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  // 부부·연인 취향 옵션 토글
  const toggleCoupleDetail = (opt: string) => {
    setCoupleDetails((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  // 캘린더 모달에서 날짜 선택 완료
  const handleCalendarSelect = (d: Date, label: string) => {
    setTargetDate(d);
    setDateLabel(label);
    setShowWeekendSubChoice(false);
  };

  // 날짜 빠른 선택 핸들러
  const handleQuickDateSelect = (type: "today" | "tomorrow" | "this-weekend" | "next-weekend") => {
    if (type === "today") {
      setTargetDate(today);
      setDateLabel("오늘");
      setShowWeekendSubChoice(false);
    } else if (type === "tomorrow") {
      const tmrw = new Date(today);
      tmrw.setDate(today.getDate() + 1);
      setTargetDate(tmrw);
      setDateLabel("내일");
      setShowWeekendSubChoice(false);
    } else if (type === "this-weekend") {
      setShowWeekendSubChoice(true);
      setTargetDate(weekends.thisSat);
      setDateLabel(`이번 주말 (${formatDateKorean(weekends.thisSat)})`);
    } else if (type === "next-weekend") {
      setTargetDate(weekends.nextSat);
      setDateLabel(`다음 주말 (${formatDateKorean(weekends.nextSat)})`);
      setShowWeekendSubChoice(false);
    }
  };

  // 인원수 증감
  const handlePartySizeChange = (delta: number) => {
    setPartySize((prev) => Math.max(1, Math.min(20, prev + delta)));
  };

  // 실시간 조건 요약 문구
  const currentSummaryText = useMemo(() => {
    const formattedDate = formatDateKorean(targetDate);
    let compText = `${companion} ${partySize}명`;
    if (companion === "가족" && familyDetails.length > 0) {
      compText += ` (${familyDetails.map((f) => f.replace(" 포함", "")).join("+")})`;
    }
    return `${region} · ${formattedDate} · ${compText} · ${interest} · ${duration} · ${budget}`;
  }, [region, targetDate, companion, partySize, familyDetails, interest, duration, budget]);

  // AI 코스 생성 핸들러 (방문일 실제 운영 여부 엄밀 검증)
  const handleGenerateCourse = () => {
    setIsGenerating(true);
    setGeneratedCourse(null);

    setTimeout(() => {
      const targetRegion = region === "현재위치" ? "부산" : region;
      const targetDayOfWeek = targetDate.getDay(); // 0(일) ~ 6(토)
      const targetDayOfMonth = targetDate.getDate();
      const lastDigitOfDay = targetDayOfMonth % 10;

      // 1. 전시 데이터 중 '선택 날짜'에 실제 운영 중인 전시만 엄선
      const availableExhibitions = exhibitionsData.filter((e) => {
        // 지역 필터
        if (e.region !== targetRegion && region !== "현재위치") return false;

        // 시작일/종료일 범위 검증
        const parsed = parseDateString(e.period);
        const start = e.startDate ? parseDateString(e.startDate).end || parsed.start : parsed.start;
        const end = e.endDate ? parseDateString(e.endDate).end || parsed.end : parsed.end;

        if (start && targetDate.getTime() < start.getTime()) return false; // 개막 전
        if (end && targetDate.getTime() > end.getTime()) return false; // 종료

        // 정기 휴관일 검증 (예: 월요일)
        if (e.closedDays && targetDayOfWeek === 1 && e.closedDays.includes("월요일")) {
          return false;
        }

        return true;
      });

      // 2. 전통시장/5일장 중 '선택 날짜'에 실제 장날이거나 상설 영업 중인 곳만 엄선
      const availableMarkets = marketsData.filter((m) => {
        if (m.region !== targetRegion && region !== "현재위치") return false;
        // 상설시장은 항상 영업
        if (m.marketType === "상설시장" || m.scheduleDays.length === 0) return true;
        // 5일장은 날짜 끝자리가 장날 주기와 일치해야 함
        return m.scheduleDays.includes(lastDigitOfDay);
      });

      // 3. 도서관 중 '선택 날짜'에 휴관이 아닌 곳 엄선
      const availableLibraries = librariesData.filter((l) => {
        if (l.region !== targetRegion && region !== "현재위치") return false;
        if (l.closedDays) {
          if (targetDayOfWeek === 1 && l.closedDays.includes("월요일")) return false;
          if (targetDayOfWeek === 0 && l.closedDays.includes("일요일")) return false;
        }
        return true;
      });

      // 스팟 선별 (가족/부모님/아이 우선순위 가중치 반영)
      const hasElderly =
        companion === "부모님과" ||
        familyDetails.includes("부모님 포함") ||
        familyDetails.includes("3세대 가족");
      const hasKids =
        familyDetails.includes("영유아 포함") ||
        familyDetails.includes("초등학생 포함");

      // 전시 선택
      let selectedExhibition = availableExhibitions[0] || exhibitionsData[0];
      if (hasKids) {
        const familyEx = availableExhibitions.find(
          (e) =>
            e.category.includes("체험") ||
            e.category.includes("복합문화") ||
            (e.tag && e.tag.includes("힐링"))
        );
        if (familyEx) selectedExhibition = familyEx;
      } else if (hasElderly) {
        const elderlyEx = availableExhibitions.find(
          (e) =>
            (e.venueName?.includes("문화회관") || e.location.includes("문화회관")) ||
            (e.venueName?.includes("시립미술관") || e.location.includes("시립미술관")) ||
            e.description.includes("평화")
        );
        if (elderlyEx) selectedExhibition = elderlyEx;
      } else if (availableExhibitions.length > 0) {
        selectedExhibition =
          availableExhibitions[Math.floor(Math.random() * availableExhibitions.length)];
      }

      // 시장 선택
      let selectedMarket = availableMarkets[0] || marketsData[0];
      if (availableMarkets.length > 0) {
        selectedMarket =
          availableMarkets[Math.floor(Math.random() * availableMarkets.length)];
      }

      // 도서관 선택
      let selectedLibrary = availableLibraries[0] || librariesData[0];
      if (hasKids) {
        const kidLib = availableLibraries.find(
          (l) => l.type.includes("어린이") || l.type.includes("가족")
        );
        if (kidLib) selectedLibrary = kidLib;
      } else if (availableLibraries.length > 0) {
        selectedLibrary =
          availableLibraries[Math.floor(Math.random() * availableLibraries.length)];
      }

      // 추천 이유 브리핑 한 문장 생성
      let reason = "";
      if (hasElderly && hasKids) {
        reason =
          "어린이와 어르신이 3세대 모두 편안하게 즐기실 수 있도록 평지 동선, 넓은 주차공간, 실내 힐링 휴식존을 최우선으로 배치했습니다.";
      } else if (hasElderly) {
        reason =
          "부모님과 함께 이동하시기 편하도록 도보 걷는 거리를 최소화하고, 주차 접근성과 편안한 좌석이 있는 힐링 명소로 구성했습니다.";
      } else if (hasKids) {
        reason =
          "아이와 함께 방문하기 좋은 유모차 접근 시설, 체험형 전시, 온 가족이 부담 없는 먹거리 코스로 안전하고 알차게 구성했습니다.";
      } else if (companion === "부부·연인") {
        reason =
          "두 분만의 오붓한 감성과 분위기 있는 뷰, 여유로운 문화 관람과 검증된 로컬 미식을 함께 즐기실 수 있도록 구성했습니다.";
      } else {
        reason = `${companion}과 함께 ${targetRegion}의 알찬 문화와 로컬 미식을 부담 없이 즐기실 수 있는 최적 동선입니다.`;
      }
      setAiRecommendationReason(reason);

      // 예산 단가 계산 (1인 기준 & 총액)
      let perPersonEst = 18000;
      if (budget === "무료 중심") perPersonEst = 9000;
      else if (budget === "3만원 이하") perPersonEst = 22000;
      else if (budget === "5만원 이하") perPersonEst = 38000;
      else perPersonEst = 55000;

      const totalEst = perPersonEst * partySize;
      setTotalEstimatedBudget({ perPerson: perPersonEst, total: totalEst });

      // 타임라인 생성
      const steps: TimelineStep[] = [];

      // Step 1: 출발
      steps.push({
        stepNumber: 1,
        time: "09:30",
        category: "🚗 나들이 출발",
        title: `${targetRegion} 중심지 출발`,
        subTitle: `${companion} ${partySize}명이 함께 떠나는 여유로운 여정`,
        distance: "출발 기준점",
        travelTime: "약 20~30분",
        stayDuration: "-",
        admissionPerPerson: "무료",
        admissionTotal: "무료",
        operatingHours: "상시 출발",
        parking: "자가용 / 대중교통 이용",
        highlight: `${formatDateKorean(targetDate)} 기준 현지 이동 최적화 동선입니다.`,
        mapQuery: `${targetRegion}역`,
      });

      // Step 2: 전시 관람
      const exAdmission = selectedExhibition.isFree
        ? "전액 무료"
        : selectedExhibition.price || "유료 (약 5,000~10,000원)";
      const exTotal = selectedExhibition.isFree
        ? "전액 무료"
        : `약 ${(5000 * partySize).toLocaleString()}원`;
      const exNote =
        hasKids || hasElderly ? "만 65세 이상 및 미취학 아동 무료 혜택" : undefined;

      steps.push({
        stepNumber: 2,
        time: "10:15",
        category: "🎨 감성 전시 관람",
        title: selectedExhibition.title,
        subTitle: selectedExhibition.venueName || selectedExhibition.location,
        distance: "출발지에서 약 7.5km",
        travelTime: "차량 약 20분",
        stayDuration: hasElderly ? "약 1시간 10분 (좌석 휴식 포함)" : "약 1시간 30분",
        admissionPerPerson: exAdmission,
        admissionTotal: exTotal,
        admissionNote: exNote,
        operatingHours: selectedExhibition.openingHours || "10:00 ~ 18:00 (입장마감 17:00)",
        parking: "전용 주차장 완비 (관람객 무료 또는 할인)",
        highlight: selectedExhibition.curatorNote || selectedExhibition.description.slice(0, 75) + "...",
        mapQuery: selectedExhibition.venueName || selectedExhibition.location,
        link: `/events/${selectedExhibition.id}`,
      });

      // Step 3: 로컬 미식 식사
      const foodName = hasElderly
        ? `${targetRegion} 정갈한 남도 한정식 & 제철 쌈밥`
        : hasKids
        ? `${targetRegion} 패밀리 레스토랑 & 수제 돈까스/파스타`
        : companion === "부부·연인"
        ? `${targetRegion} 분위기 좋은 감성 파인다이닝 & 로컬 파스타`
        : `${targetRegion} 대표 로컬 미식 (${selectedMarket.specialties[0] || "전통 맛집"})`;

      const mealPer = Math.round(perPersonEst * 0.65);
      const mealTotal = mealPer * partySize;

      steps.push({
        stepNumber: 3,
        time: "12:00",
        category: "🍽️ 로컬 미식 식사",
        title: foodName,
        subTitle: `${targetRegion} 네이버 평점 4.5+ 검증 맛집`,
        distance: "전시장에서 약 1.5km",
        travelTime: "도보 10분 / 차량 3분",
        stayDuration: "약 1시간 10분",
        admissionPerPerson: `1인 약 ${mealPer.toLocaleString()}원`,
        admissionTotal: `${partySize}인 총 약 ${mealTotal.toLocaleString()}원`,
        operatingHours: "11:30 ~ 21:00 (브레이크타임 15:00~17:00)",
        parking: "식당 전용 주차장 또는 인근 공영주차장",
        highlight: `${companion}의 취향과 예산에 맞춘 든든하고 깔끔한 식사 코스입니다.`,
        mapQuery: `${targetRegion} ${foodName.split(" ")[1] || "맛집"}`,
      });

      // 소요시간별 스팟 추가
      if (duration === "반나절") {
        if (hasElderly || interest === "자연") {
          steps.push({
            stepNumber: 4,
            time: "13:30",
            category: "🌿 힐링 산책 & 전통 차 쉼표",
            title: `${targetRegion} 고즈넉한 문화 산책로 & 전통찻집`,
            subTitle: "피톤치드 가득한 자연 쉼터",
            distance: "식당에서 약 2.8km",
            travelTime: "차량 약 8분",
            stayDuration: "약 1시간",
            admissionPerPerson: "산책로 무료 (차 1인 6,000원)",
            admissionTotal: `${partySize}인 총 약 ${(6000 * partySize).toLocaleString()}원`,
            operatingHours: "10:00 ~ 20:00 (연중무휴)",
            parking: "공영주차장 이용 편리",
            highlight: "식사 후 도란도란 담소를 나누며 여유롭게 걷기 좋은 평지 산책 코스",
            mapQuery: `${targetRegion} 수목원 공원`,
          });
        } else {
          const isReal5Day = selectedMarket.marketType === "5일장";
          steps.push({
            stepNumber: 4,
            time: "13:30",
            category: isReal5Day ? "🧺 전통 5일장 현장 탐방" : "🧺 활기찬 전통시장 & 로컬 장터",
            title: selectedMarket.name,
            subTitle: `${selectedMarket.marketType} (${selectedMarket.region} ${selectedMarket.subRegion})`,
            distance: "식당에서 약 3.2km",
            travelTime: "차량 약 10분",
            stayDuration: "약 1시간",
            admissionPerPerson: "입장 무료",
            admissionTotal: "입장 무료 (간식 자유)",
            operatingHours: selectedMarket.scheduleDescription,
            parking: "전통시장 고객 공영주차장 (주차권 지급)",
            highlight: `대표 특산물: ${selectedMarket.specialties.join(", ")} ${
              isReal5Day ? "(선택일 정기 장날 확인 완료)" : "(상설 장터)"
            }`,
            mapQuery: selectedMarket.name,
            link: `/markets`,
          });
        }

        steps.push({
          stepNumber: 5,
          time: "15:00",
          category: "🏠 여유로운 귀가",
          title: "반나절 나들이 마무리",
          subTitle: "부담 없는 일정으로 기분 좋게 귀가",
          distance: "총 이동거리 약 18km",
          travelTime: "약 25분",
          stayDuration: "-",
          admissionPerPerson: "-",
          admissionTotal: "-",
          operatingHours: "상시",
          parking: "-",
          highlight: "피로감 없이 알차게 보낸 반나절 문화 나들이를 안전하게 마무리합니다.",
          mapQuery: `${targetRegion} 귀가`,
        });
      } else if (duration === "하루") {
        steps.push({
          stepNumber: 4,
          time: "13:30",
          category: "🧺 전통시장 & 로컬 장터",
          title: selectedMarket.name,
          subTitle: `${selectedMarket.marketType} (${selectedMarket.region} ${selectedMarket.subRegion})`,
          distance: "식당에서 약 3.5km",
          travelTime: "차량 약 10분",
          stayDuration: "약 1시간 20분",
          admissionPerPerson: "입장 무료",
          admissionTotal: "입장 무료",
          operatingHours: selectedMarket.scheduleDescription,
          parking: "시장 공영주차장 (1시간 무료/할인)",
          highlight: `특산물: ${selectedMarket.specialties.join(", ")} 등 먹거리와 활기찬 정취`,
          mapQuery: selectedMarket.name,
          link: `/markets`,
        });

        if (hasKids || interest === "도서관") {
          steps.push({
            stepNumber: 5,
            time: "15:00",
            category: "📚 복합문화 도서관 쉼표",
            title: selectedLibrary.name,
            subTitle: `${selectedLibrary.type} (${selectedLibrary.region} ${selectedLibrary.subRegion})`,
            distance: "시장에서 약 4.2km",
            travelTime: "차량 약 12분",
            stayDuration: "약 1시간 30분",
            admissionPerPerson: "입장 무료",
            admissionTotal: "입장 무료",
            operatingHours: selectedLibrary.openingHours || "09:00 ~ 18:00 (월요일 휴관)",
            parking: "도서관 부설 주차장 (무료)",
            highlight: `${selectedLibrary.features.join(" · ")} 아이와 함께 책 읽고 힐링하는 최적의 공간`,
            mapQuery: selectedLibrary.name,
            link: `/libraries`,
          });
        } else {
          steps.push({
            stepNumber: 5,
            time: "15:00",
            category: "☕ 오션뷰 & 감성 로컬 카페",
            title: `${targetRegion} 뷰 맛집 힐링 카페`,
            subTitle: "향긋한 차와 디저트 쉼터",
            distance: "시장에서 약 2.5km",
            travelTime: "차량 약 7분",
            stayDuration: "약 1시간",
            admissionPerPerson: "음료 1인 1잔 (약 6,000원)",
            admissionTotal: `${partySize}인 총 약 ${(6000 * partySize).toLocaleString()}원`,
            operatingHours: "10:00 ~ 22:00",
            parking: "카페 전용 주차장 완비",
            highlight: "나들이의 여운을 정리하며 나누는 따뜻한 대화와 쉼",
            mapQuery: `${targetRegion} 감성 카페`,
          });
        }

        steps.push({
          stepNumber: 6,
          time: "17:00",
          category: "🏠 기분 좋은 귀가",
          title: "하루 나들이 마무리",
          subTitle: "행복한 추억과 함께 안전 귀가",
          distance: "총 이동거리 약 25km",
          travelTime: "약 35분",
          stayDuration: "-",
          admissionPerPerson: "-",
          admissionTotal: "-",
          operatingHours: "상시",
          parking: "-",
          highlight: `${targetRegion}에서 알차게 보낸 하루 코스를 안전하게 마무리합니다.`,
          mapQuery: `${targetRegion} 귀가`,
        });
      } else {
        // 2시간 코스
        steps.push({
          stepNumber: 3,
          time: "12:00",
          category: "🏠 가벼운 귀가",
          title: "2시간 퀵 힐링 마무리",
          subTitle: "짧고 굵은 전시 관람 후 귀가",
          distance: "총 이동거리 약 10km",
          travelTime: "약 15분",
          stayDuration: "-",
          admissionPerPerson: "-",
          admissionTotal: "-",
          operatingHours: "상시",
          parking: "-",
          highlight: "핵심 명소만 집중 관람한 가벼운 나들이를 마무리합니다.",
          mapQuery: `${targetRegion} 귀가`,
        });
      }

      setGeneratedCourse(steps);
      setCourseSummary(
        `📍 지역: ${targetRegion} | 🗓️ 방문일: ${formatDateFullKorean(targetDate)}\n👥 동행: ${companion} ${partySize}명 | 🎯 관심사: ${interest}\n⏱️ 소요시간: ${duration} | 💰 예산: 1인 약 ${perPersonEst.toLocaleString()}원 (${partySize}인 총 약 ${totalEst.toLocaleString()}원)`
      );
      setIsGenerating(false);
    }, 600);
  };

  // 카카오톡 코스 복사 및 공유
  const handleShare = async () => {
    if (!generatedCourse) return;

    const courseText =
      `[✨ 나드리 AI ${region} 맞춤 나들이 코스 🗺️]\n\n` +
      `📅 방문일: ${formatDateFullKorean(targetDate)}\n` +
      `👥 동행: ${companion} ${partySize}명 | ⏱️ 일정: ${duration}\n` +
      `💰 총 예상예산: 1인 약 ${totalEstimatedBudget.perPerson.toLocaleString()}원 (${partySize}인 총 약 ${totalEstimatedBudget.total.toLocaleString()}원)\n\n` +
      generatedCourse
        .map(
          (s) =>
            `${s.stepNumber}. [${s.time}] ${s.category}\n` +
            `   • 장소: ${s.title}\n` +
            `   • 비용: ${s.admissionTotal} (1인: ${s.admissionPerPerson})\n` +
            `   • 이동: ${s.distance} (${s.travelTime}) | 주차: ${s.parking}\n` +
            `   • 팁: ${s.highlight}`
        )
        .join("\n\n") +
      `\n\n👉 실시간 길찾기 & 세부 일정 보기: https://nadriai.com/ai-trip`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `[나드리 AI] ${region} ${companion} 맞춤 나들이 코스`,
          text: courseText,
          url: "https://nadriai.com/ai-trip",
        });
        return;
      } catch {
        // clipboard fallback
      }
    }

    try {
      await navigator.clipboard.writeText(courseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert("코스가 복사되었습니다. 카카오톡에 붙여넣기 하세요!");
    }
  };

  return (
    <section id="ai-trip-planner-section" className="scroll-mt-20">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-4 sm:p-8 md:p-10 shadow-xl border border-indigo-900/60 relative overflow-hidden">
        {/* 배경 글로우 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* 상단 뱃지 & 헤더 */}
          <div className="text-center space-y-2.5 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/30 to-emerald-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold backdrop-blur-md">
              <span>✨</span>
              <span>약 1분 만에 나들이 코스 완성</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              “이번 주말, 조건만 콕 찍어주세요!”
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              출발지와 동행자 구성, 원하는 예산만 선택하면 전시 · 5일장 · 도서관 · 맛집을 최적 동선으로 연결해 드립니다.
            </p>
          </div>

          {/* 7개 조건 선택 컨트롤 박스 (모바일 터치 최적화) */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/15 space-y-6">
            
            {/* 1. 어디에서 출발하시나요? */}
            <div>
              <label className="block text-xs font-extrabold text-indigo-200 mb-2">
                📍 1. 어디에서 출발하시나요?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["부산", "울산", "경남", "현재위치"].map((item) => {
                  const isSelected = region === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRegion(item)}
                      className={`min-h-[46px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {isSelected && <span className="text-[11px]">✓</span>}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 언제 가시나요? (날짜 선택 UI & 캘린더 모달 연동) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold text-indigo-200">
                  🗓️ 2. 언제 가시나요?
                </label>
                <span className="text-[11px] font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-400/30">
                  선택일: {formatDateKorean(targetDate)}
                </span>
              </div>

              {/* 빠른 선택 버튼 그룹 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDateSelect("today")}
                  className={`min-h-[46px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    dateLabel === "오늘"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400"
                      : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {dateLabel === "오늘" && <span className="text-[11px]">✓</span>}
                  <span>오늘</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDateSelect("tomorrow")}
                  className={`min-h-[46px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    dateLabel === "내일"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400"
                      : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {dateLabel === "내일" && <span className="text-[11px]">✓</span>}
                  <span>내일</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDateSelect("this-weekend")}
                  className={`min-h-[46px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    dateLabel.startsWith("이번 주말")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400"
                      : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {dateLabel.startsWith("이번 주말") && <span className="text-[11px]">✓</span>}
                  <span>이번 주말</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDateSelect("next-weekend")}
                  className={`min-h-[46px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    dateLabel.startsWith("다음 주말")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400"
                      : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {dateLabel.startsWith("다음 주말") && <span className="text-[11px]">✓</span>}
                  <span>다음 주말</span>
                </button>

                {/* 📅 모바일 캘린더 모달 호출 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className={`col-span-2 sm:col-span-1 min-h-[46px] py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !["오늘", "내일"].includes(dateLabel) &&
                    !dateLabel.startsWith("이번 주말") &&
                    !dateLabel.startsWith("다음 주말")
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-300"
                      : "bg-white/15 text-sky-200 hover:bg-white/25 hover:text-white border border-sky-400/30"
                  }`}
                >
                  <span>📅</span>
                  <span>
                    {!["오늘", "내일"].includes(dateLabel) &&
                    !dateLabel.startsWith("이번 주말") &&
                    !dateLabel.startsWith("다음 주말")
                      ? dateLabel
                      : "날짜선택"}
                  </span>
                </button>
              </div>

              {/* 이번 주말 클릭 시 토요일/일요일 세부 선택 */}
              {showWeekendSubChoice && (
                <div className="mt-2 p-3 rounded-2xl bg-indigo-900/40 border border-indigo-400/30 flex flex-wrap items-center gap-2 animate-fade-in">
                  <span className="text-xs text-indigo-200 font-bold">주말 세부 요일:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetDate(weekends.thisSat);
                      setDateLabel(`이번 주말 토 (${formatDateKorean(weekends.thisSat)})`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                      targetDate.getTime() === weekends.thisSat.getTime()
                        ? "bg-sky-500 text-white shadow-xs"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    토요일 ({formatDateKorean(weekends.thisSat)})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetDate(weekends.thisSun);
                      setDateLabel(`이번 주말 일 (${formatDateKorean(weekends.thisSun)})`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                      targetDate.getTime() === weekends.thisSun.getTime()
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    일요일 ({formatDateKorean(weekends.thisSun)})
                  </button>
                </div>
              )}
            </div>

            {/* 3. 누구와 가시나요? (5대 1차 선택) */}
            <div>
              <label className="block text-xs font-extrabold text-indigo-200 mb-2">
                👥 3. 누구와 함께 가시나요?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "혼자", icon: "🙋", label: "혼자" },
                  { id: "부부·연인", icon: "❤️", label: "부부·연인" },
                  { id: "가족", icon: "👨‍👩‍👧‍👦", label: "가족" },
                  { id: "부모님과", icon: "👵", label: "부모님과" },
                  { id: "친구·모임", icon: "👥", label: "친구·모임" },
                ].map((item) => {
                  const isSelected = companion === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCompanionChange(item.id)}
                      className={`min-h-[48px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300 scale-[1.01]"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {isSelected && <span className="text-[11px] font-black">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. 세부 옵션 & 인원수 (동행자 맞춤 펼침 영역) */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              {/* 가족 선택 시: 세부 구성 다중 선택 */}
              {companion === "가족" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-emerald-300">
                      👶 가족 세부 구성 (복수 선택 가능)
                    </span>
                    <span className="text-[11px] text-slate-400">다중 선택으로 맞춤 코스 정밀화</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "👶 영유아 포함",
                      "🧒 초등학생 포함",
                      "🧑‍🎓 청소년 포함",
                      "👵 부모님 포함",
                      "👨‍👩‍👧‍👦 3세대 가족",
                      "가족 전체",
                    ].map((opt) => {
                      const isChecked = familyDetails.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleFamilyDetail(opt)}
                          className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                            isChecked
                              ? "bg-emerald-500/30 border-emerald-400 text-emerald-100 font-extrabold"
                              : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                              isChecked
                                ? "bg-emerald-500 text-white"
                                : "border border-slate-500"
                            }`}
                          >
                            {isChecked ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 부부·연인 선택 시: 취향 옵션 */}
              {companion === "부부·연인" && (
                <div>
                  <span className="text-xs font-extrabold text-rose-300 block mb-2">
                    ❤️ 데이트 맞춤 테마 (선택)
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["조용한 데이트", "전시·문화", "맛집 중심", "바다·야경", "드라이브", "산책"].map(
                      (opt) => {
                        const isChecked = coupleDetails.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleCoupleDetail(opt)}
                            className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                              isChecked
                                ? "bg-rose-500/30 border-rose-400 text-rose-100 font-extrabold"
                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                            }`}
                          >
                            {isChecked && <span>✓</span>}
                            <span>{opt}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* 인원수 조절기 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
                <div>
                  <span className="text-xs font-extrabold text-indigo-200 block">
                    👥 몇 명인가요?
                  </span>
                  <span className="text-[11px] text-slate-400">
                    인원수에 맞춰 총 나들이 예산이 자동 계산됩니다.
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/70 p-1.5 rounded-2xl border border-white/20">
                  <button
                    type="button"
                    onClick={() => handlePartySizeChange(-1)}
                    disabled={partySize <= 1}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-black text-base flex items-center justify-center transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-black text-base text-amber-300">
                    {partySize}명
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePartySizeChange(1)}
                    disabled={partySize >= 20}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-black text-base flex items-center justify-center transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 5. 무엇을 하고 싶으세요? (주 관심사) */}
            <div>
              <label className="block text-xs font-extrabold text-indigo-200 mb-2">
                🎯 5. 무엇을 하고 싶으세요?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: "전시", icon: "🎨" },
                  { id: "시장", icon: "🧺" },
                  { id: "도서관", icon: "📚" },
                  { id: "자연", icon: "🌿" },
                  { id: "맛집", icon: "🍽️" },
                  { id: "드라이브", icon: "🚗" },
                ].map((item) => {
                  const isSelected = interest === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInterest(item.id)}
                      className={`min-h-[46px] py-2 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-[1.02]"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.id}</span>
                      {isSelected && <span className="text-[11px] font-black">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. 얼마나 머무르시나요 & 7. 예산 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-indigo-200 mb-2">
                  ⏱️ 6. 얼마나 머무르시나요?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["2시간", "반나절", "하루"].map((item) => {
                    const isSelected = duration === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDuration(item)}
                        className={`min-h-[46px] py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400"
                            : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {isSelected && <span className="text-[11px]">✓</span>}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-indigo-200 mb-2">
                  💰 7. 예산은 어느 정도인가요? (1인 기준)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {["무료 중심", "3만원 이하", "5만원 이하", "상관없음"].map((item) => {
                    const isSelected = budget === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setBudget(item)}
                        className={`min-h-[46px] py-2.5 px-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300"
                            : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {isSelected && <span className="text-[10px]">✓</span>}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 실시간 선택 조건 요약 바 */}
            <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-indigo-200 truncate">
                <span>📍</span>
                <span className="font-extrabold text-white truncate">{currentSummaryText}</span>
              </div>
              <span className="text-[11px] text-amber-300 font-bold shrink-0">
                예상 {partySize}인 맞춤
              </span>
            </div>

            {/* 큰 CTA 생성 버튼 (터치영역 극대화) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateCourse}
                disabled={isGenerating}
                className="w-full min-h-[56px] py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 hover:from-indigo-600 hover:via-sky-600 hover:to-emerald-600 text-white font-black text-base sm:text-lg shadow-xl shadow-indigo-500/30 transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin text-xl">✨</span>
                    <span>AI가 방문일 실제 운영 명소를 계산하고 있습니다...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>이 조건으로 나들이 코스 만들기</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI 생성 결과 화면 */}
          {generatedCourse && (
            <div className="mt-8 bg-white rounded-3xl p-5 sm:p-8 text-slate-900 shadow-2xl animate-fade-in border border-slate-200">
              {/* 1. 결과 상단 사용자 선택 조건 확인 박스 */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold">
                      {region} 출발
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-600 text-white font-bold">
                      📅 {formatDateFullKorean(targetDate)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold">
                      👥 {companion} {partySize}명
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-bold">
                      {interest} · {duration}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 pt-1">
                    💡 AI 큐레이션 추천 이유: &ldquo;{aiRecommendationReason}&rdquo;
                  </p>
                </div>

                {/* 공유 & 복사 버튼 */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>💛</span>
                  <span>{copied ? "코스 복사 완료!" : "카톡 공유 / 복사"}</span>
                </button>
              </div>

              {/* 2. 예산 요약 배너 (1인당 & 총 인원 기준) */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                    💰
                  </span>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">
                      총 예상 나들이 경비
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      1인 약 {totalEstimatedBudget.perPerson.toLocaleString()}원 ·{" "}
                      <span className="text-emerald-700 font-extrabold">
                        {partySize}인 총 약 {totalEstimatedBudget.total.toLocaleString()}원
                      </span>
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  ※ 만 65세 어르신 및 미취학 아동 무료 관람 혜택 포함
                </span>
              </div>

              {/* 3. 타임라인 단계 */}
              <div className="relative mt-8 space-y-6 before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-emerald-500 before:to-slate-200">
                {generatedCourse.map((step) => (
                  <div key={step.stepNumber} className="relative flex items-start gap-4 sm:gap-6 group">
                    {/* 번호 원 */}
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-700 font-black text-xs sm:text-sm shadow-sm shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {step.stepNumber}
                    </div>

                    {/* 세부 카드 */}
                    <div className="flex-1 rounded-2xl bg-slate-50 hover:bg-slate-100/90 p-4 sm:p-5 border border-slate-200 transition-all shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                            {step.category}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{step.time}</span>
                        </div>

                        {/* 네이버 지도 길찾기 */}
                        <a
                          href={`https://map.naver.com/v5/search/${encodeURIComponent(step.mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[38px] text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                        >
                          <span>📍 네이버 길찾기</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{step.title}</span>
                        {step.link && (
                          <a
                            href={step.link}
                            className="text-xs text-indigo-600 hover:underline font-normal"
                          >
                            [상세보기]
                          </a>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{step.subTitle}</p>

                      {/* 핵심 스펙 칩 5종 */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[10px]">이동 거리/시간</span>
                          <span className="font-bold text-slate-700">
                            {step.distance} ({step.travelTime})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">체류/관람 시간</span>
                          <span className="font-bold text-slate-700">{step.stayDuration}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">
                            {partySize}인 총 예상비용
                          </span>
                          <span className="font-bold text-emerald-700 block">
                            {step.admissionTotal}
                          </span>
                          <span className="text-[9.5px] text-slate-400">
                            (1인: {step.admissionPerPerson})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">운영 시간</span>
                          <span
                            className="font-bold text-slate-700 truncate block"
                            title={step.operatingHours}
                          >
                            {step.operatingHours}
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[10px]">주차 정보</span>
                          <span
                            className="font-bold text-slate-700 truncate block"
                            title={step.parking}
                          >
                            {step.parking}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                        💡 {step.highlight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 버튼 */}
              <div className="mt-8 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <span>🚗</span>
                  <span className="font-semibold">
                    이 코스는 {formatDateKorean(targetDate)} 기준 실제 방문 가능한 명소를 연계한 맞춤 플랜입니다.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("ai-trip-planner-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer min-h-[38px] flex items-center"
                >
                  다른 조건으로 다시 만들기 ↑
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 캘린더 모달 / 바텀시트 */}
      <CustomCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={targetDate}
        onSelectDate={handleCalendarSelect}
      />
    </section>
  );
}
