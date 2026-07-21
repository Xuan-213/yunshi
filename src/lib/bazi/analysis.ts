// ====== 八字命盘专业分析引擎 ======

import type { MingPan } from "./paiPan";
import type { WuXing } from "./constants";
import { TIAN_GAN_WU_XING, WU_XING_SHENG, WU_XING_KE } from "./constants";

interface YongShen { shen: WuXing; reason: string; advice: string; }
interface DimAnalysis { title: string; summary: string; detail: string; }

export interface FullAnalysis {
  yongShen: YongShen;
  jiShen: WuXing;
  personality: string;
  career: DimAnalysis;
  wealth: DimAnalysis;
  love: DimAnalysis;
  health: DimAnalysis;
  overall: string;
}

const WX_STRONG = ["金","木","水","火","土"] as const;

export function analyzeMingPan(mp: MingPan): FullAnalysis {
  const dmWx = mp.dayMasterWx;
  const dm = mp.dayMaster;

  // ---- 用神分析 ----
  // Count wuxing from all stems and branches
  const count: Record<string, number> = mp.wuXingCount;
  const sorted = WX_STRONG.slice().sort((a, b) => count[b] - count[a]);
  const strongest = sorted[0];
  const weakest = sorted[4];

  // Determine if 日主 is strong or weak
  const dmCount = count[dmWx];
  const total = Object.values(count).reduce((a, b) => a + b, 0);
  const dmPct = dmCount / total;

  let yongShen: YongShen;
  let jiShen: WuXing;

  if (dmPct >= 0.3) {
    // 身强 → 喜克泄耗
    const keOptions = WX_STRONG.filter(w => WU_XING_KE[w] === dmWx);
    const xieOptions = WX_STRONG.filter(w => WU_XING_SHENG[dmWx] === w);
    const shen: WuXing = keOptions[0] || xieOptions[0] || "水";
    const industries: Record<string, string> = { "水": "物流、贸易、传媒", "火": "文化、教育、科技", "金": "金融、法律、管理", "木": "教育、医疗、艺术", "土": "房地产、建筑、农业" };
    yongShen = {
      shen,
      reason: `日主${dm}(${dmWx})偏强（占${Math.round(dmPct*100)}%），宜用官杀克制或食伤泄秀。取${shen}为用神。`,
      advice: `多接触${shen}相关的行业和人事物，如${industries[shen] || ""}。大运走到${shen}旺之时最为得力。`,
    };
    jiShen = WX_STRONG.find(w => WU_XING_SHENG[w] === dmWx) || dmWx;
  } else {
    // 身弱 → 喜生扶
    const shengOptions = WX_STRONG.filter(w => WU_XING_SHENG[w] === dmWx);
    const shen: WuXing = shengOptions[0] || dmWx;
    yongShen = {
      shen,
      reason: `日主${dm}(${dmWx})偏弱（占${Math.round(dmPct*100)}%），宜用印星生扶或比劫帮身。取${shen}为用神，生扶日主。`,
      advice: `多接触${shen}相关的行业和人事物。大运走到${shen}旺之时贵人运最强。`,
    };
    jiShen = WX_STRONG.find(w => WU_XING_KE[w] === dmWx) || "火";
  }

  // ---- 五维度分析 ----
  const careerAnalysis = analyzeCareer(mp, yongShen);
  const wealthAnalysis = analyzeWealth(mp, yongShen);
  const loveAnalysis = analyzeLove(mp);
  const healthAnalysis = analyzeHealth(mp);
  const personality = analyzePersonality(dm, dmWx, mp);

  return {
    yongShen,
    jiShen,
    personality,
    career: careerAnalysis,
    wealth: wealthAnalysis,
    love: loveAnalysis,
    health: healthAnalysis,
    overall: `日主${dm}${dmWx}命，用神为${yongShen.shen}，忌${jiShen}。${yongShen.reason}`,
  };
}

function analyzePersonality(dm: string, wx: WuXing, mp: MingPan): string {
  const wxTraits: Record<WuXing, string> = {
    "金": `${dm}为金命，金主义。性格刚毅果断，重情义、守承诺。做事有原则，不喜欢拖泥带水。但有时过于刚直，需要学会柔软变通。`,
    "木": `${dm}为木命，木主仁。温和正直，有生长向上的力量。善良、有同理心，像树木一样不断向上成长。但有时会优柔寡断，需要更多决断力。`,
    "水": `${dm}为水命，水主智。灵活善变，聪明深沉。适应能力强，像水一样能适应各种环境。但有时思虑过重，需要学会放松。`,
    "火": `${dm}为火命，火主礼。热情主动，文明有礼。行动力强，充满感染力，像火一样温暖周围的人。但有时过于急躁，需要学会耐心。`,
    "土": `${dm}为土命，土主信。厚重诚实，包容承载。脚踏实地，是大家可以依靠的人。但有时过于保守，需要勇敢尝试新事物。`,
  };
  const base = wxTraits[wx] || "";
  const dmPct = mp.wuXingCount[wx] / Object.values(mp.wuXingCount).reduce((a, b) => a + b, 0);
  const strength = dmPct >= 0.3 ? "日主力量较强，自我意识和主见较为突出。" : "日主力量偏弱，性格中有柔顺和依赖的一面，需要外界支持和认可。";
  return base + " " + strength;
}

function analyzeCareer(mp: MingPan, ys: YongShen): DimAnalysis {
  const shiShen = mp.shiShen;
  const hasGuan = Object.values(shiShen).some(s => s === "正官" || s === "七杀");
  const hasYin = Object.values(shiShen).some(s => s === "正印" || s === "偏印");
  return {
    title: "事业运",
    summary: hasGuan ? "官星透出，有事业心和上进心，适合在组织架构中发展。" : "官星不显，事业上更适合自由职业或创业型路径。",
    detail: `${hasGuan ? "命局中官星有力，代表在职场上有管理能力和晋升机会。适合在政府、大型企业或体制内发展。" : "命局中官星较弱，不太适合按部就班的职场晋升路线。更推荐发挥个人特长，走专业型或自由职业路线。"} ${hasYin ? "印星透出，学习能力强，适合需要专业知识和学历背景的行业。" : ""} 用神为${ys.shen}，建议选择与${ys.shen}五行相关的行业。大运走到用神旺地时事业有大的突破。`,
  };
}

function analyzeWealth(mp: MingPan, ys: YongShen): DimAnalysis {
  const shiShen = mp.shiShen;
  const hasCai = Object.values(shiShen).some(s => s === "正财" || s === "偏财");
  return {
    title: "财运",
    summary: hasCai ? "财星有力，有赚钱能力和理财意识。" : "财星不显，财富需要靠自身努力逐步积累。",
    detail: `${hasCai ? "命局中财星透出，代表正财运稳健。正财代表工资收入，偏财代表投资和额外收入。命局中财星状态良好，一生财运有保障。" : "命局中财星不显，意味着财富需要靠自身努力和专业能力来获取。不是大富大贵的命格，但通过踏实工作也能积累可观的财富。"} 用神${ys.shen}也是财运的关键——大运流年走到用神旺地，财运随之好转。理财方面建议${ys.shen === "水" ? "流动型资产配置" : ys.shen === "土" ? "固定资产和长期投资" : "稳健型理财"}`,
  };
}

function analyzeLove(mp: MingPan): DimAnalysis {
  const dayZhi = mp.bazi.day.zhi;
  return {
    title: "感情运",
    summary: `日支（配偶宫）为${dayZhi}，代表婚姻和伴侣关系。`,
    detail: `日支${dayZhi}是配偶宫，代表你未来的伴侣特征和婚姻质量。日支为${dayZhi}，配偶多具有${dayZhi === "子" ? "聪明灵活" : dayZhi === "午" ? "热情大方" : "稳重踏实"}的特质。日支与月支、时支的关系决定了婚姻的和谐程度。总体而言，需要关注日支是否受到其他地支的刑冲克害。`,
  };
}

function analyzeHealth(mp: MingPan): DimAnalysis {
  const dmWx = mp.dayMasterWx;
  const weakOrgans: Record<WuXing, string> = {
    "金": "肺、呼吸道、皮肤", "木": "肝、胆、筋骨",
    "水": "肾、泌尿系统、腰部", "火": "心脏、心血管、眼睛",
    "土": "脾胃、消化系统",
  };
  const overOrgans: Record<WuXing, string> = {
    "金": "肺和大肠易燥", "木": "肝气易郁结",
    "水": "肾水易寒湿", "火": "心火易亢盛",
    "土": "脾胃易虚弱",
  };
  return {
    title: "健康运",
    summary: `日主${dmWx}命，需重点关注${weakOrgans[dmWx]}的保养。`,
    detail: `五行中${dmWx}对应${weakOrgans[dmWx]}。${mp.wuXingCount[dmWx] >= 3 ? `日主${dmWx}偏旺，${overOrgans[dmWx]}，需注意${dmWx === "火" ? "清心降火" : dmWx === "水" ? "温阳补肾" : "调理平衡"}。` : `日主${dmWx}偏弱，${weakOrgans[dmWx]}功能相对较弱，平时需注重保健。`} 建议${dmWx === "火" ? "避免过度劳累和熬夜" : dmWx === "水" ? "注意保暖，少喝冷饮" : "保持规律作息，适度运动"}。`,
  };
}
