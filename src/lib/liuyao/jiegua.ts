// ====== 六爻叙事化解卦引擎 ======

import type { LiuYaoResult } from "./zhuanggua";
import { flipOneLine, getBianGua } from "./zhuanggua";
import { findGuaData, guaNumToName } from "./yaoci";
import { BA_GUA } from "@/lib/meihua/constants";

const BAGUA_MEANING: Record<string, string> = {
  "乾": "为天，为刚健，为圆满，也代表权威、长辈、审视",
  "兑": "为泽，为喜悦，为口舌，也代表沟通、少女、愉悦",
  "离": "为火，为光明，为文明，也代表美丽、中女、依附",
  "震": "为雷，为行动，为震动，也代表决断、长男、变动",
  "巽": "为风，为入微，为顺从，也代表灵气、长女、渗透",
  "坎": "为水，为险陷，为智慧，也代表流动、中男、深藏",
  "艮": "为山，为止，为稳固，也代表阻碍、少男、停止",
  "坤": "为地，为包容，为承载，也代表母性、群众、顺从",
};

export function interpretLiuyao(
  result: LiuYaoResult, question: string,
  digits: string, shangNum: number, xiaNum: number, dongYao: number
): string {
  const aaa = digits.slice(0, 3); const bbb = digits.slice(3, 6);
  const sGuaNum = shangNum % 8 || 8;
  const xGuaNum = xiaNum % 8 || 8;
  const sIdx = sGuaNum - 1; const xIdx = xGuaNum - 1;
  const shangGua = BA_GUA[sIdx];
  const xiaGua = BA_GUA[xIdx];
  const guaData = findGuaData(result.benGuaName);
  const bianData = findGuaData(result.bianGuaName);
  const movingYao = guaData.yaoCi[dongYao - 1];

  const bian = getBianGua(shangGua.name, xiaGua.name, dongYao);
  const oldGua = dongYao <= 3 ? xiaGua.name : shangGua.name;
  const newGua = dongYao <= 3 ? bian.xia : bian.shang;
  const lineInGua = dongYao <= 3 ? dongYao : dongYao - 3;
  const changeDesc = `${lineInGua === 1 ? "初" : lineInGua === 2 ? "第" + lineInGua : "第" + lineInGua}爻由${lineInGua === 1 ? (oldGua === "坤" || oldGua === "巽" || oldGua === "离" || oldGua === "兑" ? "阴变阳" : "阳变阴") : (movingYao.position.includes("六") ? "阴变阳" : "阳变阴")}`;

  let text = "";

  // ===== 一、排卦 =====
  text += `**一、排卦**\n\n`;
  text += `数字 **${digits}**，前三位 **${aaa}**，后三位 **${bbb}**。\n\n`;
  text += `**上卦：**${aaa} ÷ 8 余 **${sGuaNum}**。${sGuaNum} 是 **${shangGua.name}卦**。${BAGUA_MEANING[shangGua.name] || ""}。\n\n`;
  text += `**下卦：**${bbb} ÷ 8 余 **${xGuaNum}**。${xGuaNum} 是 **${xiaGua.name}卦**。${BAGUA_MEANING[xiaGua.name] || ""}。\n\n`;
  text += `上${shangGua.name}下${xiaGua.name}，这卦叫 **${result.benGuaName}**。是《周易》第 **${guaData.index}** 卦。${guaData.guaCiCN}\n\n`;
  text += `**动爻：**${aaa} + ${bbb} = ${parseInt(aaa)+parseInt(bbb)}，除以 6 余 **${dongYao}**。那就是 **第${dongYao}爻动**。\n\n`;
  text += `这一动，${dongYao <= 3 ? "下卦" : "上卦"}${oldGua}的${lineInGua === 1 ? "初爻" : "第" + lineInGua + "爻"}${lineInGua === 1 ? "" : ""}发生变化，${oldGua}就变成了 **${newGua}**。上卦${shangGua.name}${dongYao <= 3 ? "不变" : "变成了" + bian.shang}，${dongYao <= 3 ? "下" : ""}卦就变成了${dongYao <= 3 ? "下" : ""}**${newGua}**。\n\n`;
  text += `变卦就成了 **${result.bianGuaName}**。\n\n`;

  // ===== 二、本卦 =====
  text += `**二、本卦${guaData.name}——《周易》第${guaData.index}卦**\n\n`;
  text += `**卦辞：**"${guaData.guaCi}"\n\n`;
  text += `${guaData.guaCiCN}\n\n`;
  if (guaData.xiangZhuan) text += `**《大象》：**"${guaData.xiangZhuan}"\n\n`;
  text += `把这个卦放在你问的「${question}」上：${guaData.name}的核心含义是——${guaData.guaCiCN}\n\n`;

  // ===== 三、动爻 =====
  text += `**三、最关键的动爻——${movingYao.position}爻**\n\n`;
  text += `动爻是这卦的魂。这一爻动了，老天就是在这一爻上给你答案。\n\n`;
  text += `> **"${movingYao.text}"**\n\n`;
  text += `${movingYao.textCN}\n\n`;

  // Interpret the moving line in context
  const yaoInterpret = interpretMovingLine(guaData.name, movingYao.position, movingYao.textCN, question);
  if (yaoInterpret) text += `${yaoInterpret}\n\n`;

  // ===== 四、变卦 =====
  text += `**四、变卦${bianData.name}——《周易》第${bianData.index}卦**\n\n`;
  text += `变卦是这件事最终的走向。「${bianData.name}」——${bianData.guaCiCN}\n\n`;
  const bianMeaning = interpretBianGua(result.benGuaName, result.bianGuaName, question);
  text += `${bianMeaning}\n\n`;

  // ===== 五、综合 =====
  text += `**五、串起来看——给你的答案**\n\n`;
  text += synthesize(result, movingYao, question);

  return text;
}

function interpretMovingLine(guaName: string, pos: string, cn: string, question: string): string {
  // Key interpretations for commonly encountered lines
  const key = `${guaName}-${pos}`;
  const specials: Record<string, string> = {
    "天水讼-六三": `把这爻放在你问的「${question}」上——「食旧德」：旧德是你过去攒下的经历和本事。对方看的是你实实在在做过的事——那是最沉甸甸的东西。「贞厉终吉」：虽然过程有点难，但最终是吉的。对方认真掂量了，但他看到的不是空壳子，是你有"旧德"可吃，有底子可看。`,
    "乾为天-九五": `这是全卦最好的位置——「飞龙在天」。放在你问的「${question}」上——现在正是你大展宏图的时候。时机、位置、能力都到位了。大胆去做。`,
    "坤为地-六三": `「含章可贞，或从王事，无成有终」——你肚子里有真本事（含章），可以守正。做事可能不会立刻大功告成（无成），但一定会有好的结局（有终）。对方看到了你的底子和积累——不是花架子。`,
    "地雷复-初九": `「不远复，无祗悔，元吉」——走不远就回头，没有大悔恨。大吉！放在你问的「${question}」上——即使之前有些波折，现在回头正是时候。及时调整方向是智慧，不是失败。`,
  };
  if (specials[key]) return specials[key];

  // Generic but contextual
  return `把这爻放在你问的「${question}」上——${cn}。爻动了就是老天在指路——你用心体会这一爻的含义，就能找到属于自己的答案。`;
}

function interpretBianGua(benName: string, bianName: string, question: string): string {
  if (benName === bianName) return `本卦和变卦相同——事情不会有本质的变化。保持当下的状态就好。`;

  return `从「${benName}」走到「${bianName}」——事情不会停在原地。变卦告诉你发展的方向。请结合两个卦的含义来理解这个变化——从当前的状态（${benName}），走向未来的状态（${bianName}）。质变发生在动爻的那一刻，其余五爻保持不变。`;
}

function synthesize(result: LiuYaoResult, movingYao: any, question: string): string {
  const parts: string[] = [];
  parts.push(`把本卦、动爻、变卦串起来，关于「${question}」这件事：`);
  parts.push(`1. 当前的状态是「${result.benGuaName}」——事情处于这个阶段。`);
  parts.push(`2. 关键的变量在第${result.shiYaoPos === result.yingYaoPos - 3 || result.yingYaoPos === result.shiYaoPos - 3 ? movingYao.position : movingYao.position}——动爻「${movingYao.text}」给了最直接的提示。`);
  parts.push(`3. 发展的方向是「${result.bianGuaName}」——事情正在往这个方向走。`);

  // Check if moving line is 世爻
  if (result.shiYaoPos === (movingYao.position === "初爻" ? 1 : movingYao.position === "二爻" ? 2 : movingYao.position === "三爻" ? 3 : movingYao.position === "四爻" ? 4 : movingYao.position === "五爻" ? 5 : 6)) {
    parts.push(`\n注意：动爻正好是世爻——这意味着这个变化是**由你自身引发的**。你的选择将直接决定事情的走向。主动权在你手里。`);
  }

  parts.push(`\n卦不会骗人。动爻在哪儿，天机就在哪儿。把心放平，顺其自然。`);

  return parts.join("\n");
}
