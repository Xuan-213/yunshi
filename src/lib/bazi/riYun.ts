// ====== 日运推算 ======

import type { MingPan } from "./paiPan";
import type { TianGan, WuXing } from "./constants";
import { TIAN_GAN_WU_XING, DI_ZHI_WU_XING, SIXTY_JIA_ZI, WU_XING_SHENG, WU_XING_KE } from "./constants";
import { getDayGanZhi, solarToLunar } from "@/lib/calendar/lunar";
import { paiPan } from "./paiPan";

/** 日运评分 */
export interface DayFortune {
  score: number;
  scoreLabel: string;
  lunarDate: string;
  solarDate: string;
  ganzhiDay: string;
  summary: string;
  tags: { text: string; type: "good" | "warn" }[];
  metaphor: string;
  plainExplanation: string;
  dimensions: DimensionFortune[];
  yi: string[];
  ji: string[];
  lucky: { icon: string; label: string; value: string }[];
}

export interface DimensionFortune {
  icon: string; iconBg: string; name: string; stars: number;
  analysis: string; tip: string;
}

const DIM_TEMPLATES: Record<string, { good: string; mid: string; low: string; tip: string }> = {
  "事业": {
    good: "今日日主得流日相生，官星有力，工作中容易获得上级或前辈的认可。如果有一直推进的项目，今天是汇报的好时机。行动力在线，适合推进关键决策。",
    mid:   "事业运平稳，没有大的起伏。按部就班完成手头工作即可，不需要强求突破。与同事沟通时保持耐心，避免因小事产生摩擦。",
    low:   "今日官星受制，工作推进可能遇到阻力。不宜在今天做重大决策或发起新项目。建议把精力放在整理、复盘和准备上。",
    tip:   "上午 10-12 点是今日最佳沟通窗口",
  },
  "财运": {
    good: "财星透出有力，正财稳定，偏财也有小惊喜。适合谈合作、签合同、做长期财务规划。但财为暗财，意味着增长是稳健渐进式的，不要指望一夜暴富。",
    mid:   "财运中规中矩，收支平衡。不适合大额消费或风险投资。可以花时间整理账单、审视预算，打好基础比追求收益更重要。",
    low:   "今日财星受克，容易有意外支出。不建议投资、借钱或大额消费。管住钱包，避免冲动购物。",
    tip:   "适合做财务规划或长期理财配置",
  },
  "感情": {
    good: "桃花星显现，人缘运佳。单身者可能在社交场合遇到有趣的人。已有伴侣的适合一起外出约会，感情升温。",
    mid:   "感情运平稳，没有大起大落。已有伴侣的平淡是福，不需要刻意制造浪漫。单身的把精力放在自己身上——吸引力来自自信。",
    low:   "今日感情容易因小事起摩擦。伴侣之间注意语气和措辞，不要把工作上的情绪带回家。单身的今天不宜相亲或表白。",
    tip:   "平淡是福，不需刻意",
  },
  "健康": {
    good: "五行平衡，精力充沛。适合运动锻炼，户外活动效果加倍。注意保持规律作息。",
    mid:   "健康无大碍，但小问题需留意。注意腰部保养，久坐的每隔一小时起来走走。少喝冷饮，多喝温水。",
    low:   "今日水气偏旺/火气偏旺，身体容易疲劳。注意肾脏/心脏保养。避免熬夜，饮食清淡为主。",
    tip:   "腰部保养 + 多喝温水",
  },
  "学业": {
    good: "印星得力，理解力和记忆力都在线。特别适合攻克需要深度思考的难题。备考中的朋友今天效率会明显提升。抓住上午和傍晚的黄金时段。",
    mid:   "学习运平稳，按计划推进即可。今天更适合复习和巩固，新知识吸收效率一般。找到适合自己的节奏最重要。",
    low:   "今日学习状态欠佳，容易分心。不建议强迫自己高效产出。适当休息，恢复后再学效果更好。",
    tip:   "学新东西比复习更适合今天",
  },
  "人际": {
    good: "日主得生，人缘运好。朋友同事有困难第一个想到你。今天适合约老朋友聚会，关系会有新的升温。",
    mid:   "人际运平稳，正常的社交互动没有障碍。注意不要当老好人，帮助别人要在自己能力范围内。",
    low:   "今日人际容易产生误会。注意表达方式，避免因直率而冒犯他人。不适合进行谈判或重要沟通。",
    tip:   "适合约老朋友聚一聚",
  },
};

function evaluateDay(mp: MingPan, dayGan: TianGan): number {
  const dmWx = mp.dayMasterWx;
  const dayWx = TIAN_GAN_WU_XING[dayGan];
  let score = 3;
  if (WU_XING_SHENG[dayWx] === dmWx) score += 1;
  if (WU_XING_KE[dmWx] === dayWx) score += 0.5;
  if (dmWx === dayWx) score += 0.5;
  if (WU_XING_KE[dayWx] === dmWx) score -= 1;
  if (WU_XING_SHENG[dmWx] === dayWx) score -= 0.5;
  return Math.max(1, Math.min(5, score));
}

function scoreToLabel(s: number): string {
  if (s >= 4.5) return "上上"; if (s >= 3.5) return "中上";
  if (s >= 2.5) return "中等"; if (s >= 1.5) return "中下"; return "下";
}

function generateFortuneText(score: number, mp: MingPan, dayGan: TianGan, dayZhi: string) {
  const dmWx = mp.dayMasterWx;
  const dayWx = TIAN_GAN_WU_XING[dayGan];
  const sheng = WU_XING_SHENG[dayWx] === dmWx;
  const ke = WU_XING_KE[dayWx] === dmWx;
  const dm = mp.dayMaster;

  const tags: { text: string; type: "good" | "warn" }[] = [];
  let yi: string[] = [];
  let ji: string[] = [];
  let metaphor = "";
  let plain = "";

  const wxNames: Record<WuXing, string> = { 木:"木", 火:"火", 土:"土", 金:"金", 水:"水" };
  const wxMetaphors: Record<WuXing, string> = {
    木: "如同春日里的树木，舒展枝条迎接阳光",
    火: "如同火焰得到新柴，光与热愈发明亮",
    土: "如同大地被阳光照耀，稳重中蕴含生机",
    金: "如同金属被淬炼，锋芒内敛而有力",
    水: "如同溪流被注入新的水源，流动更加顺畅",
  };

  if (score >= 4.5) {
    tags.push({ text: "✨ 诸事大吉", type: "good" });
    yi = ["📝 签约", "🤝 合作", "💰 投资", "📚 学习", "🎉 庆祝"];
    ji = ["⚔️ 与人争执"];
    metaphor = `今天对你来说是一个能量充盈的日子——你的日主「${dm}」${wxMetaphors[dmWx]}。流日${dayGan}对你形成了强烈的正面生扶，外部环境几乎都在为你助力。把重要的事安排在今天，成功的概率会比平时高很多。`;
    plain = `流日${dayGan}${dayWx}${sheng ? "生" : "助"}日主${dm}${dmWx}，整体运势上佳。今天适合推进重要事项、把握关键机会，事半功倍。`;
  } else if (score >= 4) {
    tags.push({ text: "✨ 诸事顺遂", type: "good" });
    yi = ["📝 签约", "🤝 合作", "💰 投资", "📚 学习"];
    ji = ["⚔️ 争执", "🌙 熬夜"];
    metaphor = `今天的你如同顺风行舟——日主「${dm}」在流日的滋养下，${wxMetaphors[dmWx]}。外部环境与你内在的能量高度协调，做任何事情都容易得到正面反馈。`;
    plain = `流日${dayGan}${dayWx}对日主${dm}${dmWx}形成有利的生扶关系，整体运势上扬。适合推进重要事项，把握机会。`;
  } else if (score >= 3) {
    tags.push({ text: "📈 稳中有进", type: "good" });
    yi = ["🤝 会友", "📝 签约", "📚 学习"];
    ji = ["💸 大额消费", "🌙 熬夜"];
    metaphor = `今天的运势如同春日耕作——日主「${dm}」像一片等待耕作的土地，虽不似雨季那般滋润充沛，却也恰到好处。阳光（${dayGan}${dayWx}）不烈不弱，努力就有回报。但需要你主动拿起锄头，好运不会从天而降。`;
    plain = `流日${dayGan}（${dayWx}）与日主${dm}（${dmWx}命）处于中性偏好的关系。财运较为活跃，但需要主动争取，不要被动等待。稳扎稳打地推进每个事项，回报自然会来。`;
  } else if (score >= 2) {
    tags.push({ text: "⚠ 宜静不宜动", type: "warn" });
    yi = ["🧘 修身养性", "📚 低调学习", "📋 整理复盘"];
    ji = ["💸 投资", "🤝 重大谈判", "⚔️ 争执"];
    metaphor = `今天的你如同逆风行走——${ke ? `流日${dayGan}${dayWx}的力量正在克制日主「${dm}」${dmWx}` : `日主「${dm}」${dmWx}的能量正被流日${dayGan}${dayWx}消耗`}。这不是一个适合强攻的日子。古人说「顺天时而为」，今天更适合防守、反思、积蓄力量。`;
    plain = `流日${dayGan}（${dayWx}）对日主${dm}（${dmWx}命）形成了一定的克制或消耗。建议放缓节奏，避免做出重大决定。今天适合整理、复盘和充电，把精力留给更重要的事情。`;
  } else {
    tags.push({ text: "🔴 诸事不宜", type: "warn" });
    yi = ["🧘 静养休息", "📚 低调阅读"];
    ji = ["💸 投资", "🤝 签约", "⚔️ 争执", "✈️ 出行"];
    metaphor = `今天的你如同在风雨中行走——流日${dayGan}${dayWx}对日主「${dm}」${dmWx}形成了强烈的克制。这就像逆水行舟，每前进一步都要付出比平时多几倍的努力。今天不是冲刺的时候，而是停下来检查船只、等待风向转变的时候。`;
    plain = `流日${dayGan}（${dayWx}）克制日主${dm}（${dmWx}命），今天运势偏低。强烈建议放缓节奏，不做重大决定，避免投资、签约和重要谈判。休息一天不碍事，硬撑反而会出问题。`;
  }

  return { tags, yi, ji, metaphor, plain };
}

function generateDimensions(mp: MingPan, score: number, dayGan: TianGan): DimensionFortune[] {
  const tier = score >= 4 ? "good" : score >= 3 ? "mid" : "low";

  const dims: DimensionFortune[] = [
    { icon: "💼", iconBg: "#fef5f4", name: "事业", stars: 0, analysis: "", tip: "" },
    { icon: "💰", iconBg: "#fdfaf4", name: "财运", stars: 0, analysis: "", tip: "" },
    { icon: "❤️", iconBg: "#fdf5f8", name: "感情", stars: 0, analysis: "", tip: "" },
    { icon: "🧘", iconBg: "#f2f7f3", name: "健康", stars: 0, analysis: "", tip: "" },
    { icon: "📚", iconBg: "#f4f2f7", name: "学业", stars: 0, analysis: "", tip: "" },
    { icon: "🤝", iconBg: "#f4f7f5", name: "人际", stars: 0, analysis: "", tip: "" },
  ];

  dims.forEach((d, i) => {
    const t = DIM_TEMPLATES[d.name];
    if (!t) return;
    // vary stars slightly per dimension
    const baseStars = tier === "good" ? 4 : tier === "mid" ? 3 : 2;
    const adj = i % 3 === 0 ? 1 : i % 3 === 1 ? 0 : -1;
    d.stars = Math.max(1, Math.min(5, baseStars + adj));
    d.analysis = t[tier];
    d.tip = `💡 ${t.tip}`;
  });

  return dims;
}

export function calculateDayFortune(
  birthInput: Parameters<typeof paiPan>[0],
  date?: { year: number; month: number; day: number }
): DayFortune {
  const mp = paiPan(birthInput);
  const now = date || { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
  const dayGanZhi = getDayGanZhi(now.year, now.month, now.day);
  const dayGan = dayGanZhi[0] as TianGan;
  const dayZhi = dayGanZhi[1];

  // Lunar date
  const lunar = solarToLunar(now.year, now.month, now.day);
  const lunarMonthNames = ["正","二","三","四","五","六","七","八","九","十","冬","腊"];
  const lunarDayNames = ["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
    "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
    "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];
  const lunarStr = `${lunar.yearGanZhi}年 · ${lunarMonthNames[lunar.lunarMonth-1]}月${lunarDayNames[lunar.lunarDay]}`;

  const score = evaluateDay(mp, dayGan);
  const text = generateFortuneText(score, mp, dayGan, dayZhi);
  const dimensions = generateDimensions(mp, score, dayGan);

  const wxToColor: Record<WuXing, string> = { 金: "金色 · 白色", 木: "绿色 · 青色", 水: "蓝色 · 黑色", 火: "红色 · 紫色", 土: "黄色 · 棕色" };
  const wxToNums: Record<WuXing, string> = { 金: "4 · 9", 木: "3 · 8", 水: "1 · 6", 火: "2 · 7", 土: "5 · 0" };

  return {
    score,
    scoreLabel: scoreToLabel(score),
    lunarDate: lunarStr,
    solarDate: `${now.year}.${String(now.month).padStart(2, "0")}.${String(now.day).padStart(2, "0")}`,
    ganzhiDay: dayGanZhi,
    summary: text.plain.split("。")[0] + "。",
    tags: text.tags,
    metaphor: text.metaphor,
    plainExplanation: text.plain,
    dimensions,
    yi: text.yi,
    ji: text.ji,
    lucky: [
      { icon: "🎨", label: "幸运色", value: wxToColor[mp.dayMasterWx] || "金色" },
      { icon: "🔢", label: "幸运数字", value: wxToNums[mp.dayMasterWx] || "6 · 8" },
      { icon: "🧭", label: "吉方", value: "东南" },
      { icon: "🐒", label: "贵人属相", value: "猴" },
    ],
  };
}
