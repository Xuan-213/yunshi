// ====== 八字排盘引擎 ======

import {
  TIAN_GAN, DI_ZHI, type TianGan, type DiZhi,
  getMonthGan, getHourGan, HOUR_PILLAR_TABLE,
  TIAN_GAN_WU_XING, DI_ZHI_WU_XING, DI_ZHI_CANG_GAN,
  SIXTY_JIA_ZI, MONTH_ZHI, type WuXing,
} from "./constants";
import { getDayGanZhi, getHourZhiIndex } from "@/lib/calendar/lunar";

/** 出生信息输入 */
export interface BirthInput {
  year: number;      // 公历年
  month: number;     // 公历月
  day: number;       // 公历日
  hour: number;      // 小时 (0-23)
  minute: number;    // 分钟
  gender: "male" | "female";
  longitude: number; // 经度 (用于真太阳时, 默认120)
}

/** 一柱 */
export interface Pillar {
  gan: TianGan;
  zhi: DiZhi;
  ganZhi: string;
}

/** 四柱 */
export interface BaZiChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

/** 大运 */
export interface DaYun {
  startAge: number;
  pillars: string[]; // 每步大运的干支
}

/** 十神映射 */
export interface ShiShenMap {
  year: string;
  month: string;
  day: string;
  hour: string;
}

/** 完整命盘 */
export interface MingPan {
  bazi: BaZiChart;
  cangGan: TianGan[][];
  dayMaster: TianGan;
  dayMasterWx: WuXing;
  shiShen: ShiShenMap;
  wuXingCount: Record<WuXing, number>;
  daYun: DaYun;
  shenSha: string[];
  trueSolarInfo: { original: string; adjusted: string; offsetMin: number }; // 真太阳时信息
}

/** 真太阳时校正 */
function trueSolarHour(hour: number, minute: number, longitude: number): { hour: number; minute: number } {
  const offsetMin = (longitude - 120) * 4;
  let totalMin = hour * 60 + minute + offsetMin;
  if (totalMin < 0) totalMin += 1440;
  if (totalMin >= 1440) totalMin -= 1440;
  return { hour: Math.floor(totalMin / 60), minute: totalMin % 60 };
}

/** 获取年柱（以立春为界） */
function getYearPillar(year: number): Pillar {
  // 简化: 立春大约在2月4日, 这里返回以年份为主的年柱
  // 精确版需要结合具体日期判断是否过立春
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  const gan = TIAN_GAN[ganIndex];
  const zhi = DI_ZHI[zhiIndex];
  return { gan, zhi, ganZhi: gan + zhi };
}

/** 获取月柱（以节气为界） */
function getMonthPillar(yearGan: TianGan, month: number, day: number): Pillar {
  // 节气月: 寅=0,卯=1,...,丑=11 (与MONTH_ZHI索引一致)
  // 每月节气日约在4-8号, 精确版需节气表
  let zhiIndex: number;
  if (month === 1)  zhiIndex = day >= 6 ? 1 : 0;    // 小寒(~6日): 前=子(0→??no)→丑(11实际)
  // Actually let me just write this correctly from scratch

  // The correct mapping: what月支 does a given Gregorian date fall in
  // monthZhi = index into MONTH_ZHI = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"]
  // 节气分界（近似日期）:
  // 立春2/4→寅, 惊蛰3/6→卯, 清明4/5→辰, 立夏5/6→巳, 芒种6/6→午,
  // 小暑7/7→未, 立秋8/7→申, 白露9/8→酉, 寒露10/8→戌, 立冬11/7→亥,
  // 大雪12/7→子, 小寒1/6→丑

  if (month === 2)  zhiIndex = day >= 4 ? 0 : 11;   // 立春→寅(0), else丑(11)
  else if (month === 3)  zhiIndex = day >= 6 ? 1 : 0;    // 惊蛰→卯(1), else寅(0)
  else if (month === 4)  zhiIndex = day >= 5 ? 2 : 1;    // 清明→辰(2), else卯(1)
  else if (month === 5)  zhiIndex = day >= 6 ? 3 : 2;    // 立夏→巳(3), else辰(2)
  else if (month === 6)  zhiIndex = day >= 6 ? 4 : 3;    // 芒种→午(4), else巳(3)
  else if (month === 7)  zhiIndex = day >= 7 ? 5 : 4;    // 小暑→未(5), else午(4)
  else if (month === 8)  zhiIndex = day >= 7 ? 6 : 5;    // 立秋→申(6), else未(5)
  else if (month === 9)  zhiIndex = day >= 8 ? 7 : 6;    // 白露→酉(7), else申(6)
  else if (month === 10) zhiIndex = day >= 8 ? 8 : 7;    // 寒露→戌(8), else酉(7)
  else if (month === 11) zhiIndex = day >= 7 ? 9 : 8;    // 立冬→亥(9), else戌(8)
  else if (month === 12) zhiIndex = day >= 7 ? 10 : 9;   // 大雪→子(10), else亥(9)
  else zhiIndex = day >= 6 ? 11 : 10;                     // 1月: 小寒→丑(11), else子(10)

  const zhi = MONTH_ZHI[zhiIndex];
  const gan = getMonthGan(yearGan, zhiIndex);
  return { gan, zhi, ganZhi: gan + zhi };
}

/** 获取时柱 — 使用速查表确保零错误 */
function getHourPillar(dayGan: TianGan, hour: number): Pillar {
  const dayIdx = TIAN_GAN.indexOf(dayGan);
  const zhiIdx = getHourZhiIndex(hour);
  const ganZhi = HOUR_PILLAR_TABLE[dayIdx][zhiIdx];
  return { gan: ganZhi[0] as TianGan, zhi: ganZhi[1] as DiZhi, ganZhi };
}

/** 计算大运 */
function calculateDaYun(
  yearGan: TianGan, monthZhiIndex: number,
  gender: "male" | "female", birthDay: number
): DaYun {
  const yearGanIndex = TIAN_GAN.indexOf(yearGan);
  const isYang = yearGanIndex % 2 === 0; // 甲丙戊庚壬为阳年
  const isMale = gender === "male";

  // 顺排: 阳男/阴女; 逆排: 阴男/阳女
  const forward = (isYang && isMale) || (!isYang && !isMale);

  // 起运年龄（简化：3天=1岁）
  const startAge = Math.ceil(Math.abs(birthDay - 15) / 3);

  // 大运排列
  const pillars: string[] = [];
  const currentMonthIndex = monthZhiIndex;
  for (let i = 0; i < 8; i++) {
    const offset = forward ? (i + 1) : -(i + 1);
    const mzIdx = ((currentMonthIndex + offset) % 12 + 12) % 12;
    const mz = MONTH_ZHI[mzIdx];
    const mg = getMonthGan(yearGan, mzIdx);
    pillars.push(mg + mz);
  }

  return { startAge, pillars };
}

/** 计算十神 */
function getShiShenFromWx(riWx: WuXing, otherGan: TianGan): string {
  const otherWx = TIAN_GAN_WU_XING[otherGan];
  if (riWx === otherWx) return "比肩";
  // 生克
  const shengMap: Record<WuXing, WuXing> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const keMap: Record<WuXing, WuXing> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

  if (shengMap[riWx] === otherWx) return "食神";
  if (shengMap[otherWx] === riWx) return "偏财";
  if (keMap[otherWx] === riWx) return "七杀";
  if (keMap[riWx] === otherWx) return "偏印";
  return "比肩";
}

/** 主排盘函数 */
export function paiPan(input: BirthInput): MingPan {
  // 真太阳时校正（仅作参考显示，不改变选定时辰）
  const solar = trueSolarHour(input.hour, input.minute, input.longitude);
  const useHour = input.hour; // 直接使用用户选定的时钟时间

  // 计算四柱
  const yearPillar = getYearPillar(input.year);
  const monthPillar = getMonthPillar(yearPillar.gan, input.month, input.day);
  const dayGanZhi = getDayGanZhi(input.year, input.month, input.day);
  const dayGan = dayGanZhi[0] as TianGan;
  const dayZhi = dayGanZhi[1] as DiZhi;
  const hourPillar = getHourPillar(dayGan, useHour);

  const bazi: BaZiChart = {
    year: yearPillar,
    month: monthPillar,
    day: { gan: dayGan, zhi: dayZhi, ganZhi: dayGanZhi },
    hour: hourPillar,
  };

  // 日主
  const dayMaster = dayGan;
  const dayMasterWx = TIAN_GAN_WU_XING[dayGan];

  // 十神
  const shiShen: ShiShenMap = {
    year: getShiShenFromWx(dayMasterWx, yearPillar.gan),
    month: getShiShenFromWx(dayMasterWx, monthPillar.gan),
    day: "日主",
    hour: getShiShenFromWx(dayMasterWx, hourPillar.gan),
  };

  // 地支藏干
  const cangGan = [
    DI_ZHI_CANG_GAN[yearPillar.zhi],
    DI_ZHI_CANG_GAN[monthPillar.zhi],
    DI_ZHI_CANG_GAN[dayZhi],
    DI_ZHI_CANG_GAN[hourPillar.zhi],
  ];

  // 五行统计
  const wuXingCount: Record<WuXing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  const allGan = [
    yearPillar.gan, monthPillar.gan, dayGan, hourPillar.gan,
    yearPillar.zhi, monthPillar.zhi, dayZhi, hourPillar.zhi,
  ];
  allGan.forEach(g => {
    const wx = DI_ZHI_WU_XING[g as DiZhi] || TIAN_GAN_WU_XING[g as TianGan];
    if (wx) wuXingCount[wx]++;
  });

  // 大运
  const monthZhiIndex = MONTH_ZHI.indexOf(monthPillar.zhi);
  const daYun = calculateDaYun(yearPillar.gan, monthZhiIndex, input.gender, input.day);

  // 神煞（简化）
  const shenSha: string[] = [];
  const dayZhiStr = dayZhi;
  if (["申", "子", "辰"].includes(dayZhiStr)) shenSha.push("天乙贵人");
  if (["寅", "午", "戌"].includes(dayZhiStr)) shenSha.push("驿马");

  // 真太阳时信息
  const origHour = input.hour;
  const origMin = input.minute || 0;
  const adj = solar;
  const offsetMin = Math.round((input.longitude - 120) * 4);
  const trueSolarInfo = {
    original: `${String(origHour).padStart(2,"0")}:${String(origMin).padStart(2,"0")}`,
    adjusted: `${String(adj.hour).padStart(2,"0")}:${String(adj.minute).padStart(2,"0")}`,
    offsetMin,
  };

  return {
    bazi, cangGan, dayMaster, dayMasterWx, shiShen, wuXingCount, daYun, shenSha, trueSolarInfo,
  };
}

/** 从手动输入的四柱构建命盘（不自动计算） */
export function buildChartFromPillars(
  y: string, m: string, d: string, h: string,
  gender: "male" | "female", birthYear: number,
): MingPan {
  const yg = y[0] as TianGan, yz = y[1] as DiZhi;
  const mg = m[0] as TianGan, mz = m[1] as DiZhi;
  const dg = d[0] as TianGan, dz = d[1] as DiZhi;
  const hg = h[0] as TianGan, hz = h[1] as DiZhi;

  const bazi: BaZiChart = {
    year:  { gan: yg, zhi: yz, ganZhi: y },
    month: { gan: mg, zhi: mz, ganZhi: m },
    day:   { gan: dg, zhi: dz, ganZhi: d },
    hour:  { gan: hg, zhi: hz, ganZhi: h },
  };

  const dayMaster = dg;
  const dayMasterWx = TIAN_GAN_WU_XING[dg];

  const shiShen: ShiShenMap = {
    year: getShiShenFromWx(dayMasterWx, yg),
    month: getShiShenFromWx(dayMasterWx, mg),
    day: "日主",
    hour: getShiShenFromWx(dayMasterWx, hg),
  };

  const cangGan = [DI_ZHI_CANG_GAN[yz], DI_ZHI_CANG_GAN[mz], DI_ZHI_CANG_GAN[dz], DI_ZHI_CANG_GAN[hz]];
  const wuXingCount: Record<WuXing, number> = { 金:0,木:0,水:0,火:0,土:0 };
  [yg,mg,dg,hg,yz,mz,dz,hz].forEach(g => {
    const wx = DI_ZHI_WU_XING[g as DiZhi] || TIAN_GAN_WU_XING[g as TianGan];
    if (wx) wuXingCount[wx]++;
  });

  const ygIdx = TIAN_GAN.indexOf(yg);
  const mzIdx = MONTH_ZHI.indexOf(mz);
  const isYang = ygIdx % 2 === 0;
  const isMale = gender === "male";
  const forward = (isYang && isMale) || (!isYang && !isMale);
  const startAge = Math.ceil(Math.abs(birthYear % 10 - 5) / 3) + 1;
  const pillars: string[] = [];
  for (let i = 0; i < 8; i++) {
    const offset = forward ? (i + 1) : -(i + 1);
    const idx = ((mzIdx + offset) % 12 + 12) % 12;
    pillars.push(getMonthGan(yg, idx) + MONTH_ZHI[idx]);
  }

  const shenSha: string[] = [];
  if (["申","子","辰"].includes(dz)) shenSha.push("天乙贵人");

  return {
    bazi, cangGan, dayMaster, dayMasterWx, shiShen, wuXingCount,
    daYun: { startAge, pillars }, shenSha,
    trueSolarInfo: { original: "", adjusted: "", offsetMin: 0 },
  };
}

/** 调试输出 */
export function formatMingPan(pan: MingPan): string {
  const { bazi, dayMaster, dayMasterWx, shiShen, wuXingCount, daYun } = pan;
  return `
╔══════════════════════╗
║    八字命盘          ║
╠══════════════════════╣
║ 年柱: ${bazi.year.ganZhi}  (${bazi.year.gan}${bazi.year.zhi})
║ 月柱: ${bazi.month.ganZhi}  (${bazi.month.gan}${bazi.month.zhi})
║ 日柱: ${bazi.day.ganZhi}  (${bazi.day.gan}${bazi.day.zhi})
║ 时柱: ${bazi.hour.ganZhi}  (${bazi.hour.gan}${bazi.hour.zhi})
╠══════════════════════╣
║ 日主: ${dayMaster} (${dayMasterWx}命)
║ 十神: 年${shiShen.year} 月${shiShen.month} 日${shiShen.day} 时${shiShen.hour}
║ 五行: 金${wuXingCount.金} 木${wuXingCount.木} 水${wuXingCount.水} 火${wuXingCount.火} 土${wuXingCount.土}
║ 起运: ${daYun.startAge}岁
╚══════════════════════╝
`.trim();
}
