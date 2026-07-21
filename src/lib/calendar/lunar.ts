// ====== 公历 ↔ 农历转换 + 干支计算 ======
// 基于 1900-2100 年农历数据

import { TIAN_GAN, DI_ZHI, SIXTY_JIA_ZI, type TianGan, type DiZhi } from "@/lib/bazi/constants";

// 农历数据 1900-2100（每个年份一个十六进制数）
// 低4位: 闰月月份(0=无闰月), 高12位: 每月大小月(1=大月30天,0=小月29天)
const LUNAR_INFO = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2, // 1900-1909
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977, // 1910-1919
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970, // 1920-1929
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950, // 1930-1939
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557, // 1940-1949
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0, // 1950-1959
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0, // 1960-1969
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6, // 1970-1979
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570, // 1980-1989
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0, // 1990-1999
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5, // 2000-2009
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930, // 2010-2019
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530, // 2020-2029
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45, // 2030-2039
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0, // 2040-2049
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0, // 2050-2059
  0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4, // 2060-2069
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0, // 2070-2079
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160, // 2080-2089
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252, // 2090-2099
  0x0d520 // 2100
];

/** 公历转农历 */
export function solarToLunar(year: number, month: number, day: number) {
  let offset = daysBetween(1900, 1, 31, year, month, day);
  let lunarYear: number, lunarMonth: number, lunarDay: number;
  let isLeap = false;

  for (lunarYear = 1900; lunarYear < 2100 && offset > 0; lunarYear++) {
    const daysInYear = lunarYearDays(lunarYear);
    if (offset < daysInYear) break;
    offset -= daysInYear;
  }

  const leapMonth = getLeapMonth(lunarYear);
  let inLeap = false;

  for (lunarMonth = 1; lunarMonth <= 12 && offset > 0; lunarMonth++) {
    if (leapMonth > 0 && lunarMonth === leapMonth + 1 && !inLeap) {
      lunarMonth--;
      inLeap = true;
      offset -= lunarLeapDays(lunarYear);
    } else {
      offset -= lunarMonthDays(lunarYear, lunarMonth);
    }
    if (offset <= 0 && inLeap) break;
    inLeap = false;
  }

  lunarDay = offset + 1;

  // 计算农历年干支
  const yearGanZhi = SIXTY_JIA_ZI[(lunarYear - 4) % 60];

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeap: isLeap,
    yearGanZhi,
  };
}

/** 公历日期转日柱干支 (基数公式法, 1900-2099) */
export function getDayGanZhi(year: number, month: number, day: number): string {
  const tail = year % 100;
  // 世纪基数
  const base = year < 2000
    ? (tail + 3) * 5 + 55 + Math.floor((tail - 1) / 4)
    : (tail + 7) * 5 + 15 + Math.floor((tail + 19) / 4);

  // 当年第几天
  const monthDays = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeap) monthDays[2] = 29;
  let dayOfYear = day;
  for (let m = 1; m < month; m++) dayOfYear += monthDays[m];

  const idx = (base % 60 + dayOfYear) % 60; // 1-indexed (甲子=1)
  return SIXTY_JIA_ZI[(idx - 1 + 60) % 60];
}

/** 获取时辰的地支索引 (0-11) */
export function getHourZhiIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0; // 子时
  return Math.floor((hour + 1) / 2);
}

// ====== 内部辅助 ======

function daysBetween(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): number {
  return (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000;
}

function lunarYearDays(y: number): number {
  let sum = 0;
  for (let i = 1; i <= 12; i++) sum += lunarMonthDays(y, i);
  sum += lunarLeapDays(y);
  return sum;
}

function lunarMonthDays(y: number, m: number): number {
  const info = LUNAR_INFO[y - 1900];
  return (info & (0x10000 >> m)) ? 30 : 29;
}

function lunarLeapDays(y: number): number {
  const leap = getLeapMonth(y);
  if (leap === 0) return 0;
  const info = LUNAR_INFO[y - 1900];
  return (info & 0x10000) ? 30 : 29;
}

function getLeapMonth(y: number): number {
  return LUNAR_INFO[y - 1900] & 0xf;
}
