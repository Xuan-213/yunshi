// ====== 六爻装卦引擎 ======

import type { TianGan, DiZhi, WuXing } from "@/lib/bazi/constants";
import { TIAN_GAN, DI_ZHI_WU_XING } from "@/lib/bazi/constants";
import { findGua, BA_GUA } from "@/lib/meihua/constants";
import type { GuaName } from "@/lib/meihua/constants";
import { getDayGanZhi } from "@/lib/calendar/lunar";

// ====== 纳甲表 (八宫每爻的地支) ======
const NA_JIA_DI_ZHI: Record<string, DiZhi[]> = {
  // 乾宫: 乾、姤、遁、否、观、剥、晋、大有
  "乾": ["子","寅","辰","午","申","戌"],
  "震": ["子","寅","辰","午","申","戌"],
  "坎": ["寅","辰","午","申","戌","子"],
  "艮": ["辰","午","申","戌","子","寅"],
  "坤": ["未","巳","卯","丑","亥","酉"],
  "巽": ["丑","亥","酉","未","巳","卯"],
  "离": ["卯","丑","亥","酉","未","巳"],
  "兑": ["巳","卯","丑","亥","酉","未"],
};

// 八宫世爻位置 (从初爻=1 到上爻=6)
const SHI_YAO_POS: Record<string, number> = {
  "八纯":6, "一世":1, "二世":2, "三世":3, "四世":4, "五世":5, "游魂":4, "归魂":3,
};

// 六亲
type LiuQin = "兄弟"|"子孙"|"妻财"|"官鬼"|"父母";

// 六神
const LIU_SHEN = ["青龙","朱雀","勾陈","螣蛇","白虎","玄武"] as const;
type LiuShen = typeof LIU_SHEN[number];

// 用神映射
const YONG_SHEN_MAP: Record<string, LiuQin> = {
  "财运": "妻财", "事业": "官鬼", "感情": "官鬼",
  "健康": "子孙", "出行": "妻财", "寻物": "妻财",
  "学业": "父母", "其他": "妻财",
};

export interface LiuYaoLine {
  position: string;   // 初爻/二爻/.../上爻
  original: string;   // 原爻 (—阳 / - -阴)
  changed: string;    // 变爻
  isMoving: boolean;  // 是否动爻
  najiaDiZhi: DiZhi;
  liuQin: LiuQin;
  liuShen: LiuShen;
  shiYing: "世" | "应" | "";
}

export interface LiuYaoResult {
  benGuaName: string;
  bianGuaName: string;
  gongName: GuaName;
  shiYaoPos: number;
  yingYaoPos: number;
  yongShen: { position: string; liuQin: LiuQin };
  jiShen: LiuQin;
  yuanShen: LiuQin;
  verdict: string;
  lines: LiuYaoLine[];
}

/** 主装卦函数 */
export function zhuangGua(
  shangGuaNum: number, xiaGuaNum: number, dongYaoPos: number,
  questionType: string, year: number, month: number, day: number
): LiuYaoResult {
  const shang = BA_GUA[(shangGuaNum % 8 || 8) - 1];
  const xia = BA_GUA[(xiaGuaNum % 8 || 8) - 1];
  const dongYao = dongYaoPos % 6 || 6; // 1-6 from bottom (初爻=1)

  // 本卦
  const benGua = findGua(shang.name, xia.name);
  const benGuaName = benGua?.name ?? `${shang.name}${xia.name}`;
  const gong = benGua?.gong ?? "乾" as GuaName;

  // 世应
  const shiPos = getShiYaoPos(benGuaName, gong);
  const yingPos = shiPos <= 3 ? shiPos + 3 : shiPos - 3;

  // 变卦
  const bianShang = dongYao <= 3 ? flipGuaLine(shang.name) : shang.name;
  const bianXia = dongYao > 3 ? flipGuaLine(xia.name) : xia.name;
  const bianGua = findGua(bianShang, bianXia);
  const bianGuaName = bianGua?.name ?? `${bianShang}${bianXia}`;

  // 日干支
  const dayGanZhi = getDayGanZhi(year, month, day);
  const dayGan = dayGanZhi[0] as TianGan;

  // 纳甲
  const najiaZhi = NA_JIA_DI_ZHI[gong] || NA_JIA_DI_ZHI["乾"];

  // 六亲
  const gongWx = BA_GUA.find(g => g.name === gong)!.wx as WuXing;

  // 用神
  const yongShenQin: LiuQin = YONG_SHEN_MAP[questionType] || "妻财";
  const yuanShenMap: Record<LiuQin, LiuQin> = { "妻财":"子孙", "官鬼":"妻财", "父母":"官鬼", "子孙":"兄弟", "兄弟":"父母" };
  const jiShenMap: Record<LiuQin, LiuQin> = { "妻财":"兄弟", "官鬼":"子孙", "父母":"妻财", "子孙":"父母", "兄弟":"官鬼" };

  // 六神起法
  const dayGanIdx = TIAN_GAN.indexOf(dayGan);
  const godStart = Math.floor(dayGanIdx / 2);

  // 构建六爻
  const lines: LiuYaoLine[] = [];
  const yaoNames = ["初爻","二爻","三爻","四爻","五爻","上爻"];
  const isYangGua = ["乾","震","坎","艮"].includes(gong);

  let yongShenPos = "";
  for (let i = 0; i < 6; i++) {
    const pos = i + 1;
    const zhi = najiaZhi[i];
    const zhiWx = DI_ZHI_WU_XING[zhi];
    const liuQin = getLiuQin(gongWx, zhiWx);

    // 六神: 从初爻开始, 按日干起
    const godIdx = (godStart + i) % 6;
    const liuShen = LIU_SHEN[godIdx];

    const isMoving = pos === dongYao;
    const shiYing = pos === shiPos ? "世" : pos === yingPos ? "应" : "";

    if (liuQin === yongShenQin && !yongShenPos) yongShenPos = yaoNames[i];

    lines.push({
      position: yaoNames[i],
      original: isYangGua ? "—" : "- -",
      changed: isMoving ? (isYangGua ? "- -" : "—") : (isYangGua ? "—" : "- -"),
      isMoving,
      najiaDiZhi: zhi,
      liuQin,
      liuShen,
      shiYing,
    });
  }

  return {
    benGuaName, bianGuaName, gongName: gong,
    shiYaoPos: shiPos, yingYaoPos: yingPos,
    yongShen: { position: yongShenPos || "初爻", liuQin: yongShenQin },
    jiShen: jiShenMap[yongShenQin],
    yuanShen: yuanShenMap[yongShenQin],
    verdict: "中上——需要结合具体卦象分析",
    lines,
  };
}

/** 获取世爻位置 */
function getShiYaoPos(guaName: string, gong: GuaName): number {
  // 简化: 八纯卦世在六爻
  const prefix = guaName[0];
  if (prefix === "乾" && gong === "乾") return 6;
  if (prefix === "坤" && gong === "坤") return 6;
  return 4; // 默认四爻
}

/** 翻转单卦 */
function flipGuaLine(name: GuaName): GuaName {
  const m: Record<GuaName, GuaName> = { "乾":"坤","坤":"乾","震":"巽","巽":"震","坎":"离","离":"坎","艮":"兑","兑":"艮" };
  return m[name];
}

/** 五行→六亲 */
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
