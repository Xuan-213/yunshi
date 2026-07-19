// ====== 六爻解卦引擎 — 叙事风格，含周易原文爻辞 ======

import type { LiuYaoResult } from "./zhuanggua";
import { findGuaData, guaNumToName } from "./yaoci";

/** 八卦万物类象 */
const GUA_XIANG: Record<number, { name: string; nature: string; trait: string; meaning: string }> = {
  1: { name: "乾", nature: "天", trait: "刚健", meaning: "为天，为圆满，为权威，为创造，也代表长辈、领导、审视" },
  2: { name: "兑", nature: "泽", trait: "喜悦", meaning: "为泽，为口舌，为沟通，为愉悦，也代表少女、言说" },
  3: { name: "离", nature: "火", trait: "光明", meaning: "为火，为光明，为文明，为美丽，也代表中女、明亮" },
  4: { name: "震", nature: "雷", trait: "震动", meaning: "为雷，为行动，为震动，为决断，也代表长男、变动" },
  5: { name: "巽", nature: "风", trait: "入微", meaning: "为风，为渗透，为顺从，为灵气，也代表长女、入微" },
  6: { name: "坎", nature: "水", trait: "深陷", meaning: "为水，为险陷，为智慧，为流动，也代表中男、深藏" },
  7: { name: "艮", nature: "山", trait: "静止", meaning: "为山，为止，为稳固，为阻碍，也代表少男、停止" },
  8: { name: "坤", nature: "地", trait: "柔顺", meaning: "为地，为包容，为承载，为母性，也代表群众、顺从" },
};

function describeGua(num: number): string {
  return GUA_XIANG[num]?.meaning || "";
}

export function interpretLiuyao(
  result: LiuYaoResult,
  question: string,
  digits: string,
  shangNum: number,
  xiaNum: number,
  dongYao: number
): string {
  const aaa = digits.slice(0, 3);
  const bbb = digits.slice(3, 6);
  const shangGua = GUA_XIANG[shangNum] || GUA_XIANG[1];
  const xiaGua = GUA_XIANG[xiaNum] || GUA_XIANG[1];
  const guaData = findGuaData(result.benGuaName);
  const bianData = findGuaData(result.bianGuaName);
  const yaoIdx = dongYao - 1; // 0-indexed
  const movingYao = guaData.yaoCi[yaoIdx];

  let text = "";

  // ====== 一、排卦 ======
  text += `**一、排卦**\n\n`;
  text += `数字 **${digits}**，前三位 **${aaa}**，后三位 **${bbb}**。\n\n`;
  text += `**上卦：**${aaa} ÷ 8 余 **${shangNum}**。${shangNum} 是 **${shangGua.name}卦**。${shangGua.meaning}。\n\n`;
  text += `**下卦：**${bbb} ÷ 8 余 **${xiaNum}**。${xiaNum} 是 **${xiaGua.name}卦**。${xiaGua.meaning}。\n\n`;

  const shangXiaDesc = describeHexagramCombo(shangGua.name, xiaGua.name);
  text += `${shangXiaDesc}\n\n`;

  text += `**动爻：**${aaa} + ${bbb} = ${parseInt(aaa) + parseInt(bbb)}，除以 6 余 **${dongYao}**。`;
  text += `那就是 **第${dongYao}爻动**。这一动，`;
  if (dongYao <= 3) {
    text += `下卦${xiaGua.name}第${dongYao}爻由${dongYao % 2 === 1 ? "阳变阴" : "阴变阳"}，${xiaGua.name}就变成了${guaNumToName(xiaNum === 1 ? 8 : xiaNum === 8 ? 1 : xiaNum % 2 === 1 ? xiaNum + 1 : xiaNum - 1)}。`;
  } else {
    text += `上卦${shangGua.name}第${dongYao - 3}爻由${dongYao % 2 === 1 ? "阳变阴" : "阴变阳"}，${shangGua.name}就变成了${guaNumToName(shangNum === 1 ? 8 : shangNum === 8 ? 1 : shangNum % 2 === 1 ? shangNum + 1 : shangNum - 1)}。`;
  }
  text += `变卦就成了 **${result.bianGuaName}**。\n\n`;

  // ====== 二、本卦分析 ======
  text += `**二、本卦${guaData.name}**\n\n`;
  text += `「${guaData.name}」是《周易》第 **${guaData.index}** 卦。\n\n`;
  if (guaData.guaCi !== "（卦辞）") {
    text += `**卦辞：**"${guaData.guaCi}"\n\n`;
    text += `${guaData.guaCiCN}\n\n`;
  }
  if (guaData.tuanZhuan) {
    text += `**《彖传》：**"${guaData.tuanZhuan.slice(0, 60)}…"\n\n`;
  }
  if (guaData.xiangZhuan) {
    text += `**《大象》：**"${guaData.xiangZhuan}"\n\n`;
  }

  text += `把这个卦放在你问的「${question}」上：${interpretBenGua(guaData.name, question)}\n\n`;

  // ====== 三、动爻 ======
  text += `**三、最关键的动爻——${movingYao.position}爻**\n\n`;
  text += `动爻是这卦的魂。${guaData.name}卦${movingYao.position}爻的爻辞是这么说的：\n\n`;
  text += `> **"${movingYao.text}"**\n\n`;

  if (movingYao.textCN !== "（爻辞）") {
    text += `${movingYao.textCN}\n\n`;
  }
  if (movingYao.xiaoXiang) {
    text += `《小象》说："${movingYao.xiaoXiang}"\n\n`;
  }

  text += `${interpretYaoCi(guaData.name, movingYao.position, movingYao.text, question)}\n\n`;

  // ====== 四、变卦 ======
  text += `**四、变卦${bianData.name}**\n\n`;
  text += `变卦「${bianData.name}」是这问题的最终走向。${bianData.guaCiCN}\n\n`;
  text += `${interpretBianGua(result.benGuaName, result.bianGuaName, question)}\n\n`;

  // ====== 五、总结 ======
  text += `**五、综合判断**\n\n`;
  text += `${synthesize(result.benGuaName, result.bianGuaName, movingYao, question)}\n`;

  return text;
}

function describeHexagramCombo(shang: string, xia: string): string {
  const combos: Record<string, string> = {
    "乾乾": "上乾下乾，天上有天，这卦叫 **乾为天**。是《周易》第一卦，纯阳之象。",
    "坤坤": "上坤下坤，地上有地，这卦叫 **坤为地**。是《周易》第二卦，纯阴之象。",
    "坎震": "上坎下震，水在雷上，这卦叫 **水雷屯**。是《周易》第三卦，万物初生之象。",
    "艮坎": "上艮下坎，山在水上，这卦叫 **山水蒙**。是《周易》第四卦，蒙昧待启之象。",
    "坎乾": "上坎下乾，水在天上，这卦叫 **水天需**。是《周易》第五卦，等待时机的卦。",
    "乾坎": "上乾下坎，天在水上，这卦叫 **天水讼**。是《周易》第六卦。讼，是争讼，是辩论，也是心里有话被堵着——需要小心着说。",
    "坤坎": "上坤下坎，地在水上，这卦叫 **地水师**。是《周易》第七卦，出师征战之象。",
    "坎坤": "上坎下坤，水在地上，这卦叫 **水地比**。是《周易》第八卦，亲附和合之象。",
    "巽乾": "上巽下乾，风在天上，这卦叫 **风天小畜**。是《周易》第九卦，小有积蓄。",
    "乾兑": "上乾下兑，天在泽上，这卦叫 **天泽履**。是《周易》第十卦，如履薄冰。",
    "坤乾": "上坤下乾，地在天上，这卦叫 **地天泰**。是《周易》第十一卦，通泰之象。",
    "乾坤": "上乾下坤，天在地上，这卦叫 **天地否**。是《周易》第十二卦，闭塞不通。",
    "乾离": "上乾下离，天在火上，这卦叫 **天火同人**。是《周易》第十三卦，志同道合。",
    "离乾": "上离下乾，火在天上，这卦叫 **火天大有**。是《周易》第十四卦，大有收获。",
    "坤艮": "上坤下艮，地在山上，这卦叫 **地山谦**。是《周易》第十五卦，谦逊之象。",
    "震坤": "上震下坤，雷在地上，这卦叫 **雷地豫**。是《周易》第十六卦，愉悦之象。",
    "兑震": "上兑下震，泽在雷上，这卦叫 **泽雷随**。是《周易》第十七卦，随从之象。",
    "艮巽": "上艮下巽，山在风上，这卦叫 **山风蛊**。是《周易》第十八卦，积弊待除。",
    "坤兑": "上坤下兑，地在泽上，这卦叫 **地泽临**。是《周易》第十九卦，临近之象。",
    "巽坤": "上巽下坤，风在地上，这卦叫 **风地观**。是《周易》第二十卦，观察之象。",
    "离震": "上离下震，火在雷上，这卦叫 **火雷噬嗑**。是《周易》第二十一卦，咬合突破。",
    "艮离": "上艮下离，山在火上，这卦叫 **山火贲**。是《周易》第二十二卦，文饰之象。",
    "艮坤": "上艮下坤，山在地上，这卦叫 **山地剥**。是《周易》第二十三卦，剥落之象。",
    "坤震": "上坤下震，地在雷上，这卦叫 **地雷复**。是《周易》第二十四卦，一阳来复。",
    "乾震": "上乾下震，天在雷上，这卦叫 **天雷无妄**。是《周易》第二十五卦，不可妄为。",
    "艮乾": "上艮下乾，山在天上，这卦叫 **山天大畜**。是《周易》第二十六卦，大积蓄。",
    "艮震": "上艮下震，山在雷上，这卦叫 **山雷颐**。是《周易》第二十七卦，颐养之象。",
    "兑巽": "上兑下巽，泽在风上，这卦叫 **泽风大过**。是《周易》第二十八卦，过度之象。",
    "坎坎": "上坎下坎，水上有水，这卦叫 **坎为水**。是《周易》第二十九卦，险阻重重。",
    "离离": "上离下离，火上有火，这卦叫 **离为火**。是《周易》第三十卦，依附光明。",
    "离坤": "上离下坤，火在地上，这卦叫 **火地晋**。是《周易》第三十五卦，晋升之象。",
    "坤离": "上坤下离，地在火上，这卦叫 **地火明夷**。是《周易》第三十六卦，光明受伤。",
    "兑坎": "上兑下坎，泽在水上，这卦叫 **泽水困**。是《周易》第四十七卦，困顿之象。",
    "离巽": "上离下巽，火在风上，这卦叫 **火风鼎**。是《周易》第五十卦，鼎新之象。",
    "离坎": "上离下坎，火在水上，这卦叫 **火水未济**。是《周易》第六十四卦，未完成。",
    "坎离": "上坎下离，水在火上，这卦叫 **水火既济**。是《周易》第六十三卦，既成。",
  };
  return combos[`${shang}${xia}`] || `上${shang}下${xia}，这卦叫 ${shang}${xia}。`;
}

function interpretBenGua(name: string, question: string): string {
  const interpretations: Record<string, string> = {
    "天水讼": `讼卦的核心是"心里有掂量"。把这个放在你问的「${question}」这件事上——这意味着对方（或这件事本身）不是漠不关心，而是在认真地权衡、比较、琢磨。脑子里有问号在转。这不是坏事——要是完全不关心，卦象该是"否"或"剥"，不是"讼"。"讼"说明被认真对待了。`,
    "乾为天": `乾卦的核心是"创造"和"主动"。放在你问的「${question}」上——这告诉你现在是一个需要主动作为的时候。龙从深渊到天空，有六个阶段的成长。天行健，君子自强不息。`,
    "火地晋": `晋卦是"日出地上"——太阳从地平线升起，越来越亮。放在你问的「${question}」上——事情正在稳步上升中，虽然速度不快，但方向是对的。`,
  };
  return interpretations[name] || `这个卦象放在你问的「${question}」这件事上，请结合卦辞和动爻来综合理解。`;
}

function interpretYaoCi(guaName: string, position: string, yaoci: string, question: string): string {
  if (yaoci === "（爻辞）") {
    return `这爻的具体含义，请你结合自己的情况用心感悟。卦不会骗人——爻动了，就是老天在给你指路。`;
  }

  // 针对特定爻辞的叙事化解读
  if (guaName === "坤为地" && position === "六三") {
    return `把这爻放在你问的「${question}」上——「含章可贞」：你肚子里有东西，有真本事，这是你的"章"。「或从王事，无成有终」：你去做这件事，可能不会立刻大功告成（无成），但会有好的结果（有终）。对方看到的，就是你这"含章"的底子——不是花架子，是有真东西的。他觉得你踏实、有积累、能做事。虽然可能某些方面还需打磨，但"终吉"——他对你的印象是正的。`;
  }

  if (guaName === "天水讼" && position === "六三") {
    return `把这爻辞掰开了放在你问的「${question}」上——「食旧德」：旧德，是你过去攒下的经历、经验、本事。食，是靠这个吃饭。对方看的，就是你过去实实在在做过的事——那是最沉甸甸的东西。「贞厉，终吉」：你守得住，虽然过程有点难，但最终是吉的。「或从王事，无成」：可能还没完全达到最高要求，但这也不是否定——是对方在认真给你找位置。`;
  }

  return `把这爻放在你问的「${question}」上——老天通过这一爻告诉你：事情正在按照它该有的方式推进。爻辞里的每一个字，都是对你的回应。仔细品，你会在里面找到答案。`;
}

function interpretBianGua(benName: string, bianName: string, question: string): string {
  if (benName === "天水讼" && bianName === "天风姤") {
    return `从"讼"到"姤"——从心里掂量，到眼前一亮。姤是"天地相遇"，是天和地碰上了，万物都能被看清。对方从最初的权衡和审视，走到了"相遇"的感觉——他觉得跟你这件事是有缘分的，不是擦肩而过。风（巽）是能入的，是能渗透的——你这件事入了对方心里，他记住了。不一定当场拍板，但他把你放在了心上。`;
  }
  return `从「${benName}」到「${bianName}」——这是一个变化的信号。卦象告诉你，事情不会停留在当前的状态，它在往新的方向发展。请把握这个变化的趋势。`;
}

function synthesize(benName: string, bianName: string, movingYao: any, question: string): string {
  const parts: string[] = [];

  parts.push(`综合来看，关于「${question}」这件事：`);

  if (benName === "天水讼" && bianName === "天风姤") {
    parts.push(`对方认真掂量了（讼），最终是相遇的感觉（姤）。这不是否定，这是被认真对待了。脑子里那些问号，恰恰说明他把你当回事——不是随便翻翻就过去的。`);
    parts.push(`动爻"${movingYao.text}"告诉我们——${movingYao.textCN}`);
    parts.push(`把心放回肚子里。这一卦不坏。卦不会骗人。`);
  } else if (benName === "坤为地" && bianName === "地雷复") {
    parts.push(`当前是坤卦的柔顺和承载——事情还在积累阶段。但变卦是复卦，一阳来复——转机已经在地下萌动了。`);
    parts.push(`动爻告诉你：${movingYao.textCN}`);
  } else {
    parts.push(`本卦「${benName}」是当前的状况，变卦「${bianName}」是事情发展的方向。`);
    parts.push(`动爻是老天给你的最直接的提示：${movingYao.textCN}`);
  }

  return parts.join("\n\n");
}
