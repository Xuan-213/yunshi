// ====== 八字排盘引擎 ======

import {
  TIAN_GAN, DI_ZHI, type TianGan, type DiZhi,
  getShiChen, getMonthGan, getHourGan,
  TIAN_GAN_WU_XING, DI_ZHI_WU_XING, DI_ZHI_CANG_GAN,
  SIXTY_JIA_ZI, MONTH_ZHI, SHI_CHEN, type WuXing,
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
  cangGan: TianGan[][];      // 地支藏干
  dayMaster: TianGan;        // 日主
  dayMasterWx: WuXing;       // 日主五行
  shiShen: ShiShenMap;       // 十神
  wuXingCount: Record<WuXing, number>; // 五行统计
  daYun: DaYun;
  shenSha: string[];         // 神煞
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
  // 简化节气判断: 每月节气大约在4-8号
  // 精确版需要节气表
  let zhiIndex: number;
  if (month === 1)  zhiIndex = day >= 6 ? 2 : 1;   // 小寒/立春
  else if (month === 2)  zhiIndex = day >= 4 ? 3 : 2;   // 立春/惊蛰
  else if (month === 3)  zhiIndex = day >= 6 ? 4 : 3;   // 惊蛰/清明
  else if (month === 4)  zhiIndex = day >= 5 ? 5 : 4;   // 清明/立夏
  else if (month === 5)  zhiIndex = day >= 6 ? 6 : 5;   // 立夏/芒种
  else if (month === 6)  zhiIndex = day >= 7 ? 7 : 6;   // 芒种/小暑
  else if (month === 7)  zhiIndex = day >= 7 ? 8 : 7;   // 小暑/立秋
  else if (month === 8)  zhiIndex = day >= 8 ? 9 : 8;   // 立秋/白露
  else if (month === 9)  zhiIndex = day >= 8 ? 10 : 9;  // 白露/寒露
  else if (month === 10) zhiIndex = day >= 8 ? 11 : 10; // 寒露/立冬
  else if (month === 11) zhiIndex = day >= 7 ? 0 : 11;  // 立冬/大雪
  else zhiIndex = day >= 6 ? 1 : 0;                     // 大雪/小寒

  const zhi = MONTH_ZHI[zhiIndex];
  const gan = getMonthGan(yearGan, zhiIndex);
  return { gan, zhi, ganZhi: gan + zhi };
}

/** 获取时柱 */
function getHourPillar(dayGan: TianGan, hour: number): Pillar {
  const zhiIndex = getHourZhiIndex(hour);
  const zhi = DI_ZHI[zhiIndex];
  const gan = getHourGan(dayGan, zhiIndex);
  return { gan, zhi, ganZhi: gan + zhi };
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
  // 真太阳时校正
  const solar = trueSolarHour(input.hour, input.minute, input.longitude);

  // 计算四柱
  const yearPillar = getYearPillar(input.year);
  const monthPillar = getMonthPillar(yearPillar.gan, input.month, input.day);
  const dayGanZhi = getDayGanZhi(input.year, input.month, input.day);
  const dayGan = dayGanZhi[0] as TianGan;
  const dayZhi = dayGanZhi[1] as DiZhi;
  const hourPillar = getHourPillar(dayGan, solar.hour);

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

  return {
    bazi, cangGan, dayMaster, dayMasterWx, shiShen, wuXingCount, daYun, shenSha,
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
