// ====== 六爻装卦引擎 ======

import type { TianGan, DiZhi, WuXing } from "@/lib/bazi/constants";
import { TIAN_GAN, DI_ZHI_WU_XING } from "@/lib/bazi/constants";
import { BA_GUA, findGua } from "@/lib/meihua/constants";
import type { GuaName } from "@/lib/meihua/constants";
import { getDayGanZhi } from "@/lib/calendar/lunar";

// 八卦 3-bit 编码 (bottom-to-top, yang=1)
const GUA_BITS: Record<GuaName, number> = {
  "乾": 0b111, "兑": 0b110, "离": 0b101, "震": 0b100,
  "巽": 0b011, "坎": 0b010, "艮": 0b001, "坤": 0b000,
};
const BITS_TO_GUA: Record<number, GuaName> = {
  0b111: "乾", 0b110: "兑", 0b101: "离", 0b100: "震",
  0b011: "巽", 0b010: "坎", 0b001: "艮", 0b000: "坤",
};

/** 翻转六爻中的一根线（1-indexed, 从下往上）*/
export function flipOneLine(gua: GuaName, lineInGua: number): GuaName {
  const bits = GUA_BITS[gua];
  const newBits = bits ^ (1 << (lineInGua - 1)); // flip the specific bit
  return BITS_TO_GUA[newBits];
}

/** 计算变卦 */
export function getBianGua(
  shangGua: GuaName, xiaGua: GuaName, dongYaoPos: number
): { shang: GuaName; xia: GuaName } {
  // dongYaoPos: 1-6 from bottom, 1-3在下卦, 4-6在上卦
  if (dongYaoPos <= 3) {
    // 动爻在下卦
    return { shang: shangGua, xia: flipOneLine(xiaGua, dongYaoPos) };
  } else {
    // 动爻在上卦
    return { shang: flipOneLine(shangGua, dongYaoPos - 3), xia: xiaGua };
  }
}

// 纳甲表
const NA_JIA_DI_ZHI: Record<string, DiZhi[]> = {
  "乾": ["子","寅","辰","午","申","戌"],
  "震": ["子","寅","辰","午","申","戌"],
  "坎": ["寅","辰","午","申","戌","子"],
  "艮": ["辰","午","申","戌","子","寅"],
  "坤": ["未","巳","卯","丑","亥","酉"],
  "巽": ["丑","亥","酉","未","巳","卯"],
  "离": ["卯","丑","亥","酉","未","巳"],
  "兑": ["巳","卯","丑","亥","酉","未"],
};

const LIU_SHEN = ["青龙","朱雀","勾陈","螣蛇","白虎","玄武"] as const;
type LiuShen = typeof LIU_SHEN[number];
type LiuQin = "兄弟"|"子孙"|"妻财"|"官鬼"|"父母";

export interface LiuYaoLine {
  position: string; original: string; changed: string;
  isMoving: boolean; najiaDiZhi: DiZhi; liuQin: LiuQin;
  liuShen: LiuShen; shiYing: "世" | "应" | "";
}

export interface LiuYaoResult {
  benGuaName: string; bianGuaName: string;
  gongName: GuaName;
  shiYaoPos: number; yingYaoPos: number;
  yongShen: { position: string; liuQin: LiuQin };
  jiShen: LiuQin; yuanShen: LiuQin;
  verdict: string; lines: LiuYaoLine[];
}

function getShiYaoPos(guaName: string, gong: GuaName): number {
  if (guaName.startsWith(gong) && guaName.length >= 3) return 6; // 八纯
  return 4; // default
}

function getLiuQin(gongWx: WuXing, yaoWx: WuXing): LiuQin {
  if (gongWx === yaoWx) return "兄弟";
  const sheng: Record<string, string> = { "木":"火","火":"土","土":"金","金":"水","水":"木" };
  const ke: Record<string, string> = { "木":"土","土":"水","水":"火","火":"金","金":"木" };
  if (sheng[gongWx] === yaoWx) return "子孙";
  if (sheng[yaoWx] === gongWx) return "父母";
  if (ke[gongWx] === yaoWx) return "妻财";
  if (ke[yaoWx] === gongWx) return "官鬼";
  return "兄弟";
}

export function zhuangGua(
  shangNum: number, xiaNum: number, dongYao: number,
  questionType: string, year: number, month: number, day: number
): LiuYaoResult {
  const s = (shangNum % 8 || 8) - 1;
  const x = (xiaNum % 8 || 8) - 1;
  const dong = dongYao % 6 || 6;
  const shang = BA_GUA[s];
  const xia = BA_GUA[x];

  const benGua = findGua(shang.name, xia.name);
  const benGuaName = benGua?.name ?? `${shang.name}${xia.name}`;
  const gong: GuaName = benGua?.gong ?? "乾";

  const bian = getBianGua(shang.name, xia.name, dong);
  const bianGua = findGua(bian.shang, bian.xia);
  const bianGuaName = bianGua?.name ?? `${bian.shang}${bian.xia}`;

  const shiPos = getShiYaoPos(benGuaName, gong);
  const yingPos = shiPos <= 3 ? shiPos + 3 : shiPos - 3;

  const dayGanZhi = getDayGanZhi(year, month, day);
  const dayGan = dayGanZhi[0] as TianGan;
  const dayGanIdx = TIAN_GAN.indexOf(dayGan);

  const najiaZhi = NA_JIA_DI_ZHI[gong] || NA_JIA_DI_ZHI["乾"];
  const gongWx = BA_GUA.find(g => g.name === gong)!.wx as WuXing;

  const yongShenMap: Record<string, LiuQin> = {
    "财运":"妻财","事业":"官鬼","感情":"官鬼",
    "健康":"子孙","出行":"妻财","寻物":"妻财","学业":"父母","其他":"妻财"
  };
  const yongShenQin = yongShenMap[questionType] || "妻财";
  const yuanShenMap: Record<LiuQin, LiuQin> = {
    "妻财":"子孙","官鬼":"妻财","父母":"官鬼","子孙":"兄弟","兄弟":"父母"
  };
  const jiShenMap: Record<LiuQin, LiuQin> = {
    "妻财":"兄弟","官鬼":"子孙","父母":"妻财","子孙":"父母","兄弟":"官鬼"
  };

  const isYangGong = ["乾","震","坎","艮"].includes(gong);
  const yaoNames = ["初爻","二爻","三爻","四爻","五爻","上爻"];
  const lines: LiuYaoLine[] = [];
  let yongShenPos = "";

  for (let i = 0; i < 6; i++) {
    const pos = i + 1;
    const zhi = najiaZhi[i];
    const liuQin = getLiuQin(gongWx, DI_ZHI_WU_XING[zhi]);
    const godIdx = (dayGanIdx + i) % 6;
    const isMoving = pos === dong;
    const shiYing = pos === shiPos ? "世" : pos === yingPos ? "应" : "";
    if (liuQin === yongShenQin && !yongShenPos) yongShenPos = yaoNames[i];

    lines.push({
      position: yaoNames[i],
      original: isYangGong ? "—" : "- -",
      changed: isMoving ? (isYangGong ? "- -" : "—") : (isYangGong ? "—" : "- -"),
      isMoving, najiaDiZhi: zhi, liuQin, liuShen: LIU_SHEN[godIdx], shiYing,
    });
  }

  return {
    benGuaName, bianGuaName, gongName: gong,
    shiYaoPos: shiPos, yingYaoPos: yingPos,
    yongShen: { position: yongShenPos || "初爻", liuQin: yongShenQin },
    jiShen: jiShenMap[yongShenQin],
    yuanShen: yuanShenMap[yongShenQin],
    verdict: "中上",
    lines,
  };
}
