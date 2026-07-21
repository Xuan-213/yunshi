// ====== 八字核心常量 ======

/** 十天干 */
export const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export type TianGan = (typeof TIAN_GAN)[number];

/** 十二地支 */
export const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export type DiZhi = (typeof DI_ZHI)[number];

/** 五行 */
export const WU_XING = ["金", "木", "水", "火", "土"] as const;
export type WuXing = (typeof WU_XING)[number];

/** 天干五行映射 */
export const TIAN_GAN_WU_XING: Record<TianGan, WuXing> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

/** 天干阴阳 (true=阳, false=阴) */
export const TIAN_GAN_YIN_YANG: Record<TianGan, boolean> = {
  甲: true,  乙: false, 丙: true,  丁: false, 戊: true,
  己: false, 庚: true,  辛: false, 壬: true,  癸: false,
};

/** 地支五行映射 */
export const DI_ZHI_WU_XING: Record<DiZhi, WuXing> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

/** 地支藏干 */
export const DI_ZHI_CANG_GAN: Record<DiZhi, TianGan[]> = {
  子: ["癸"],          丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"], 卯: ["乙"],
  辰: ["戊", "乙", "癸"], 巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],       未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"], 酉: ["辛"],
  戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"],
};

/** 六十甲子表 */
export const SIXTY_JIA_ZI: string[] = (() => {
  const result: string[] = [];
  for (let i = 0; i < 60; i++) {
    result.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12]);
  }
  return result;
})();

/** 获取干支的六十甲子索引 */
export function getJiaZiIndex(ganZhi: string): number {
  return SIXTY_JIA_ZI.indexOf(ganZhi);
}

/** 时辰对应表 */
export const SHI_CHEN: { name: DiZhi; range: [number, number]; label: string }[] = [
  { name: "子", range: [23, 1],  label: "子时 (23:00-01:00)" },
  { name: "丑", range: [1, 3],   label: "丑时 (01:00-03:00)" },
  { name: "寅", range: [3, 5],   label: "寅时 (03:00-05:00)" },
  { name: "卯", range: [5, 7],   label: "卯时 (05:00-07:00)" },
  { name: "辰", range: [7, 9],   label: "辰时 (07:00-09:00)" },
  { name: "巳", range: [9, 11],  label: "巳时 (09:00-11:00)" },
  { name: "午", range: [11, 13], label: "午时 (11:00-13:00)" },
  { name: "未", range: [13, 15], label: "未时 (13:00-15:00)" },
  { name: "申", range: [15, 17], label: "申时 (15:00-17:00)" },
  { name: "酉", range: [17, 19], label: "酉时 (17:00-19:00)" },
  { name: "戌", range: [19, 21], label: "戌时 (19:00-21:00)" },
  { name: "亥", range: [21, 23], label: "亥时 (21:00-23:00)" },
];

/** 根据小时获取时辰 */
export function getShiChen(hour: number): DiZhi {
  if (hour === 23 || hour === 0) return "子";
  return SHI_CHEN.find(s => hour >= s.range[0] && hour < s.range[1])?.name ?? "子";
}

/** 五行生克 */
export const WU_XING_SHENG: Record<WuXing, WuXing> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};

export const WU_XING_KE: Record<WuXing, WuXing> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};

/** 十神 */
export const SHI_SHEN_NAMES = [
  "比肩", "劫财", "食神", "伤官",
  "偏财", "正财", "七杀", "正官",
  "偏印", "正印",
] as const;
export type ShiShen = (typeof SHI_SHEN_NAMES)[number];

/** 计算十神: 以日干为"我"，看其他天干 */
export function getShiShen(riGan: TianGan, otherGan: TianGan): ShiShen {
  const riWx = TIAN_GAN_WU_XING[riGan];
  const otherWx = TIAN_GAN_WU_XING[otherGan];
  const riYin = TIAN_GAN_YIN_YANG[riGan];
  const otherYin = TIAN_GAN_YIN_YANG[otherGan];

  if (riWx === otherWx) return riYin === otherYin ? "比肩" : "劫财";
  if (WU_XING_SHENG[riWx] === otherWx) return riYin === otherYin ? "食神" : "伤官";
  if (WU_XING_SHENG[otherWx] === riWx) return riYin === otherYin ? "偏财" : "正财";
  if (WU_XING_KE[otherWx] === riWx) return riYin === otherYin ? "七杀" : "正官";
  if (WU_XING_KE[riWx] === otherWx) return riYin === otherYin ? "偏印" : "正印";

  return "比肩"; // fallback
}

/** 二十四节气 (简化版，仅用于月柱分界) */
export const JIE_QI_MONTHS: { name: string; month: number; approxDay: number }[] = [
  { name: "立春", month: 2, approxDay: 4 },
  { name: "惊蛰", month: 3, approxDay: 6 },
  { name: "清明", month: 4, approxDay: 5 },
  { name: "立夏", month: 5, approxDay: 6 },
  { name: "芒种", month: 6, approxDay: 6 },
  { name: "小暑", month: 7, approxDay: 7 },
  { name: "立秋", month: 8, approxDay: 8 },
  { name: "白露", month: 9, approxDay: 8 },
  { name: "寒露", month: 10, approxDay: 8 },
  { name: "立冬", month: 11, approxDay: 7 },
  { name: "大雪", month: 12, approxDay: 7 },
  { name: "小寒", month: 1, approxDay: 6 },
];

/** 月支映射 (从寅月开始) */
export const MONTH_ZHI: DiZhi[] = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

/** 年上起月法 (五虎遁) */
export function getMonthGan(yearGan: TianGan, monthZhiIndex: number): TianGan {
  const yearGanIndex = TIAN_GAN.indexOf(yearGan);
  // 甲己之年丙作首, 乙庚之年戊为头, 丙辛之年寻庚上, 丁壬之年壬寅头, 戊癸之年甲寅求
  const headIndex = ((yearGanIndex % 5) * 2 + 2) % 10;
  return TIAN_GAN[(headIndex + monthZhiIndex) % 10];
}

/** 日上起时法 (五鼠遁) */
export function getHourGan(dayGan: TianGan, hourZhiIndex: number): TianGan {
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  // 甲己还加甲
  const headIndex = (dayGanIndex % 5) * 2;
  return TIAN_GAN[(headIndex + hourZhiIndex) % 10];
}
