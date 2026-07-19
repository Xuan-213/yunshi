// ====== 梅花易数核心常量 ======

/** 八卦 */
export const BA_GUA = [
  { name: "乾", symbol: "☰", wx: "金" as const, num: 1, direction: "西北", nature: "天", body: "头", trait: "健" },
  { name: "兑", symbol: "☱", wx: "金" as const, num: 2, direction: "西",   nature: "泽", body: "口", trait: "悦" },
  { name: "离", symbol: "☲", wx: "火" as const, num: 3, direction: "南",   nature: "火", body: "目", trait: "丽" },
  { name: "震", symbol: "☳", wx: "木" as const, num: 4, direction: "东",   nature: "雷", body: "足", trait: "动" },
  { name: "巽", symbol: "☴", wx: "木" as const, num: 5, direction: "东南", nature: "风", body: "股", trait: "入" },
  { name: "坎", symbol: "☵", wx: "水" as const, num: 6, direction: "北",   nature: "水", body: "耳", trait: "陷" },
  { name: "艮", symbol: "☶", wx: "土" as const, num: 7, direction: "东北", nature: "山", body: "手", trait: "止" },
  { name: "坤", symbol: "☷", wx: "土" as const, num: 8, direction: "西南", nature: "地", body: "腹", trait: "顺" },
] as const;

export type GuaName = (typeof BA_GUA)[number]["name"];

/** 六十四卦表 (卦序 + 上卦 + 下卦 + 卦名 + 卦宫) */
export const LIU_SHI_SI_GUA: {
  index: number; shang: GuaName; xia: GuaName; name: string; gong: GuaName;
}[] = [
  { index: 1,  shang: "乾", xia: "乾", name: "乾为天",   gong: "乾" },
  { index: 2,  shang: "坤", xia: "坤", name: "坤为地",   gong: "坤" },
  { index: 3,  shang: "坎", xia: "震", name: "水雷屯",   gong: "坎" },
  { index: 4,  shang: "艮", xia: "坎", name: "山水蒙",   gong: "离" },
  { index: 5,  shang: "坎", xia: "乾", name: "水天需",   gong: "坤" },
  { index: 6,  shang: "乾", xia: "坎", name: "天水讼",   gong: "离" },
  { index: 7,  shang: "坤", xia: "坎", name: "地水师",   gong: "坎" },
  { index: 8,  shang: "坎", xia: "坤", name: "水地比",   gong: "坤" },
  { index: 9,  shang: "巽", xia: "乾", name: "风天小畜", gong: "巽" },
  { index: 10, shang: "乾", xia: "兑", name: "天泽履",   gong: "艮" },
  { index: 11, shang: "坤", xia: "乾", name: "地天泰",   gong: "坤" },
  { index: 12, shang: "乾", xia: "坤", name: "天地否",   gong: "乾" },
  { index: 13, shang: "乾", xia: "离", name: "天火同人", gong: "离" },
  { index: 14, shang: "离", xia: "乾", name: "火天大有", gong: "乾" },
  { index: 15, shang: "坤", xia: "艮", name: "地山谦",   gong: "兑" },
  { index: 16, shang: "震", xia: "坤", name: "雷地豫",   gong: "震" },
  { index: 17, shang: "兑", xia: "震", name: "泽雷随",   gong: "震" },
  { index: 18, shang: "艮", xia: "巽", name: "山风蛊",   gong: "巽" },
  { index: 19, shang: "坤", xia: "兑", name: "地泽临",   gong: "坤" },
  { index: 20, shang: "巽", xia: "坤", name: "风地观",   gong: "乾" },
  { index: 21, shang: "离", xia: "震", name: "火雷噬嗑", gong: "巽" },
  { index: 22, shang: "艮", xia: "离", name: "山火贲",   gong: "艮" },
  { index: 23, shang: "艮", xia: "坤", name: "山地剥",   gong: "乾" },
  { index: 24, shang: "坤", xia: "震", name: "地雷复",   gong: "坤" },
  { index: 25, shang: "乾", xia: "震", name: "天雷无妄", gong: "巽" },
  { index: 26, shang: "艮", xia: "乾", name: "山天大畜", gong: "艮" },
  { index: 27, shang: "艮", xia: "震", name: "山雷颐",   gong: "巽" },
  { index: 28, shang: "兑", xia: "巽", name: "泽风大过", gong: "震" },
  { index: 29, shang: "坎", xia: "坎", name: "坎为水",   gong: "坎" },
  { index: 30, shang: "离", xia: "离", name: "离为火",   gong: "离" },
  { index: 31, shang: "兑", xia: "艮", name: "泽山咸",   gong: "兑" },
  { index: 32, shang: "震", xia: "巽", name: "雷风恒",   gong: "震" },
  { index: 33, shang: "乾", xia: "艮", name: "天山遁",   gong: "乾" },
  { index: 34, shang: "震", xia: "乾", name: "雷天大壮", gong: "坤" },
  { index: 35, shang: "离", xia: "坤", name: "火地晋",   gong: "乾" },
  { index: 36, shang: "坤", xia: "离", name: "地火明夷", gong: "坎" },
  { index: 37, shang: "巽", xia: "离", name: "风火家人", gong: "巽" },
  { index: 38, shang: "离", xia: "兑", name: "火泽睽",   gong: "艮" },
  { index: 39, shang: "坎", xia: "艮", name: "水山蹇",   gong: "兑" },
  { index: 40, shang: "震", xia: "坎", name: "雷水解",   gong: "震" },
  { index: 41, shang: "艮", xia: "兑", name: "山泽损",   gong: "艮" },
  { index: 42, shang: "巽", xia: "震", name: "风雷益",   gong: "巽" },
  { index: 43, shang: "兑", xia: "乾", name: "泽天夬",   gong: "坤" },
  { index: 44, shang: "乾", xia: "巽", name: "天风姤",   gong: "乾" },
  { index: 45, shang: "兑", xia: "坤", name: "泽地萃",   gong: "兑" },
  { index: 46, shang: "坤", xia: "巽", name: "地风升",   gong: "震" },
  { index: 47, shang: "兑", xia: "坎", name: "泽水困",   gong: "兑" },
  { index: 48, shang: "坎", xia: "巽", name: "水风井",   gong: "震" },
  { index: 49, shang: "兑", xia: "离", name: "泽火革",   gong: "坎" },
  { index: 50, shang: "离", xia: "巽", name: "火风鼎",   gong: "离" },
  { index: 51, shang: "震", xia: "震", name: "震为雷",   gong: "震" },
  { index: 52, shang: "艮", xia: "艮", name: "艮为山",   gong: "艮" },
  { index: 53, shang: "巽", xia: "艮", name: "风山渐",   gong: "艮" },
  { index: 54, shang: "震", xia: "兑", name: "雷泽归妹", gong: "兑" },
  { index: 55, shang: "震", xia: "离", name: "雷火丰",   gong: "坎" },
  { index: 56, shang: "离", xia: "艮", name: "火山旅",   gong: "离" },
  { index: 57, shang: "巽", xia: "巽", name: "巽为风",   gong: "巽" },
  { index: 58, shang: "兑", xia: "兑", name: "兑为泽",   gong: "兑" },
  { index: 59, shang: "巽", xia: "坎", name: "风水涣",   gong: "离" },
  { index: 60, shang: "坎", xia: "兑", name: "水泽节",   gong: "坎" },
  { index: 61, shang: "巽", xia: "兑", name: "风泽中孚", gong: "艮" },
  { index: 62, shang: "震", xia: "艮", name: "雷山小过", gong: "兑" },
  { index: 63, shang: "坎", xia: "离", name: "水火既济", gong: "坎" },
  { index: 64, shang: "离", xia: "坎", name: "火水未济", gong: "离" },
];

/** 根据上卦下卦找六十四卦 */
export function findGua(shang: GuaName, xia: GuaName): (typeof LIU_SHI_SI_GUA)[number] | undefined {
  return LIU_SHI_SI_GUA.find(g => g.shang === shang && g.xia === xia);
}

/** 体用生克关系 */
export type TiYongRelation = "用生体" | "体克用" | "体生用" | "用克体" | "体用比和";

export function getTiYongRelation(tiWx: string, yongWx: string): { relation: TiYongRelation; verdict: string } {
  if (tiWx === yongWx) return { relation: "体用比和", verdict: "大吉——天时地利人和，事情与自身高度和谐，万事顺遂。" };
  if (yongWx === tiWx) return { relation: "体用比和", verdict: "大吉——天时地利人和，事情与自身高度和谐，万事顺遂。" };

  // 生克判断
  const shengMap: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  const keMap: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

  if (shengMap[yongWx] === tiWx) return { relation: "用生体", verdict: "大吉——事物对自己有利，外部环境主动帮助你，事情会顺利达成。" };
  if (keMap[tiWx] === yongWx) return { relation: "体克用", verdict: "小吉——你能够掌控事态发展，但需要主动付出努力。" };
  if (shengMap[tiWx] === yongWx) return { relation: "体生用", verdict: "小凶——事情可以达成，但会消耗你的精力和资源。" };
  if (keMap[yongWx] === tiWx) return { relation: "用克体", verdict: "凶——外部环境对你形成阻力，建议暂缓或调整策略。" };

  return { relation: "体用比和", verdict: "中和——需要更多信息才能判断。" };
}
