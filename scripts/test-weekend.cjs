const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function getKoreanToday() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const koreaTimeDiff = 9 * 60 * 60 * 1000;
  const korDate = new Date(utc + koreaTimeDiff);
  korDate.setHours(0, 0, 0, 0);
  return korDate;
}

function getUpcomingWeekendDates(baseDate = getKoreanToday()) {
  const day = baseDate.getDay(); // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat
  
  let thisSatOffset = 0;
  if (day === 6) {
    thisSatOffset = 0;
  } else if (day === 0) {
    thisSatOffset = -1;
  } else {
    thisSatOffset = 6 - day;
  }

  const thisSat = new Date(baseDate);
  thisSat.setDate(baseDate.getDate() + thisSatOffset);
  thisSat.setHours(0, 0, 0, 0);

  const thisSun = new Date(thisSat);
  thisSun.setDate(thisSat.getDate() + 1);

  const nextSat = new Date(thisSat);
  nextSat.setDate(thisSat.getDate() + 7);

  const nextSun = new Date(thisSun);
  nextSun.setDate(thisSun.getDate() + 7);

  return {
    thisSat,
    thisSun,
    nextSat,
    nextSun,
  };
}

const weekends = getUpcomingWeekendDates();
console.log('Today:', getKoreanToday().toISOString());
console.log('This Sat:', weekends.thisSat.toISOString(), '(' + DAY_NAMES[weekends.thisSat.getDay()] + ')');
console.log('This Sun:', weekends.thisSun.toISOString(), '(' + DAY_NAMES[weekends.thisSun.getDay()] + ')');
console.log('Next Sat:', weekends.nextSat.toISOString(), '(' + DAY_NAMES[weekends.nextSat.getDay()] + ')');
console.log('Next Sun:', weekends.nextSun.toISOString(), '(' + DAY_NAMES[weekends.nextSun.getDay()] + ')');
