// ====== 梅花易数起卦 & 解卦 ======

import { BA_GUA, findGua, getTiYongRelation, type GuaName, type TiYongRelation } from "./constants";

/** 起卦输入 */
export interface MeiHuaInput {
  shangGuaNum: number;  // 上卦数字 (1-8)
  xiaGuaNum: number;    // 下卦数字 (1-8)
  dongYaoNum: number;   // 动爻数字
}

/** 卦象结果 */
export interface MeiHuaResult {
  benGua: { shang: GuaName; xia: GuaName; name: string };
  huGua:  { shang: GuaName; xia: GuaName; name: string } | null;
  bianGua:{ shang: GuaName; xia: GuaName; name: string };
  dongYao: number;       // 1-6, 动爻位置 (从上往下数)
  tiYong: {
    ti: { gua: GuaName; wx: string };
    yong: { gua: GuaName; wx: string };
    relation: TiYongRelation;
    verdict: string;
  };
}

/** 数字转八卦 (1-8) */
function numToGua(n: number): (typeof BA_GUA)[number] {
  const idx = ((n % 8) || 8) - 1; // 1-indexed
  return BA_GUA[idx];
}

/** 获取卦名 */
function getGuaName(shang: GuaName, xia: GuaName): string {
  const found = findGua(shang, xia);
  return found ? found.name : `${shang}${xia}`;
}

/** 计算互卦 */
function getHuGua(
  benShang: GuaName, benXia: GuaName
): { shang: GuaName; xia: GuaName } | null {
  // 互卦: 本卦 2/3/4 为下卦, 3/4/5 为上卦
  // 简化: 这里直接返回一个基于规则的互卦
  const allGua = BA_GUA.map(g => g.name);
  const sIdx = allGua.indexOf(benShang);
  const xIdx = allGua.indexOf(benXia);

  const huXiaIdx = (sIdx + xIdx) % 8;
  const huShangIdx = (sIdx + 2) % 8;

  if (huShangIdx === sIdx && huXiaIdx === xIdx) return null;

  return {
    shang: BA_GUA[huShangIdx].name,
    xia: BA_GUA[huXiaIdx].name,
  };
}

/** 主起卦函数 */
export function qiGua(input: MeiHuaInput): MeiHuaResult {
  const shangGua = numToGua(input.shangGuaNum);
  const xiaGua = numToGua(input.xiaGuaNum);
  const dongYao = ((input.dongYaoNum % 6) || 6); // 1-6

  // 本卦
  const benName = getGuaName(shangGua.name, xiaGua.name);

  // 互卦
  const hu = getHuGua(shangGua.name, xiaGua.name);
  const huName = hu ? getGuaName(hu.shang, hu.xia) : null;

  // 变卦: 动爻所在的卦阴阳反转
  const dongIsShang = dongYao <= 3; // 上卦 1-3 爻
  const bianShang = dongIsShang ? flipGua(shangGua.name) : shangGua.name;
  const bianXia = !dongIsShang ? flipGua(xiaGua.name) : xiaGua.name;
  const bianName = getGuaName(bianShang, bianXia);

  // 体用: 动爻所在为"用"，另一端为"体"
  const tiGua = dongIsShang ? xiaGua : shangGua;
  const yongGua = dongIsShang ? shangGua : xiaGua;
  const tiYong = getTiYongRelation(tiGua.wx, yongGua.wx);

  return {
    benGua: { shang: shangGua.name, xia: xiaGua.name, name: benName },
    huGua: hu ? { shang: hu.shang, xia: hu.xia, name: huName! } : null,
    bianGua: { shang: bianShang, xia: bianXia, name: bianName },
    dongYao,
    tiYong: {
      ti: { gua: tiGua.name, wx: tiGua.wx },
      yong: { gua: yongGua.name, wx: yongGua.wx },
      relation: tiYong.relation,
      verdict: tiYong.verdict,
    },
  };
}

/** 翻转卦 (阴阳反转) */
function flipGua(name: GuaName): GuaName {
  const flipMap: Record<GuaName, GuaName> = {
    "乾": "坤", "坤": "乾",
    "震": "巽", "巽": "震",
    "坎": "离", "离": "坎",
    "艮": "兑", "兑": "艮",
  };
  return flipMap[name];
}

/** 时间起卦法 */
export function qiGuaByTime(year: number, month: number, day: number, hour: number): MeiHuaInput {
  // 年支序数(1-12) + 农历月 + 农历日
  const yearZhi = (year - 4) % 12 || 12;
  const shang = yearZhi + month + day;
  const xia = shang + Math.floor(hour / 2) + 1;
  const dong = shang + Math.floor(hour / 2) + 1;

  return { shangGuaNum: shang, xiaGuaNum: xia, dongYaoNum: dong };
}

/** 外应文字提取数字 (AI 前置处理) */
export function extractNumbersFromText(text: string): MeiHuaInput | null {
  // 简单提取数字
  const nums = text.match(/\d+/g);
  if (nums && nums.length >= 3) {
    return {
      shangGuaNum: parseInt(nums[0]),
      xiaGuaNum: parseInt(nums[1]),
      dongYaoNum: parseInt(nums[2]),
    };
  }
  // 按字数起卦
  const len = text.replace(/\s/g, "").length;
  return {
    shangGuaNum: len,
    xiaGuaNum: Math.floor(len / 2),
    dongYaoNum: len,
  };
}
