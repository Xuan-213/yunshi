// ====== 六爻叙事化解卦引擎 v2 ======

import type { LiuYaoResult } from "./zhuanggua";
import { getBianGua } from "./zhuanggua";
import { findGuaData } from "./yaoci";
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

const LINE_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
const LINE_NUMS  = ["一", "二", "三", "四", "五", "六"];

export function interpretLiuyao(
  result: LiuYaoResult, question: string,
  digits: string, shangNum: number, xiaNum: number, dongYao: number
): string {
  const aaa = digits.slice(0, 3); const bbb = digits.slice(3, 6);
  const sGuaNum = shangNum % 8 || 8; const xGuaNum = xiaNum % 8 || 8;
  const shangGua = BA_GUA[sGuaNum - 1]; const xiaGua = BA_GUA[xGuaNum - 1];
  const guaData = findGuaData(result.benGuaName);
  const bianData = findGuaData(result.bianGuaName);
  const movingYao = guaData.yaoCi[dongYao - 1];
  const bian = getBianGua(shangGua.name, xiaGua.name, dongYao);
  const sum = parseInt(aaa) + parseInt(bbb);

  const q = question.trim() || "这件事";

  // Build interpretation
  const parts: string[] = [];

  // ---- 一、排卦 ----
  parts.push(`## 一、排卦\n`);
  parts.push(`你报了 **${digits}** 这组数字。前三位 **${aaa}**，后三位 **${bbb}**。\n`);
  parts.push(`**上卦**：${aaa} ÷ 8 余 **${sGuaNum}** → **${shangGua.name}卦**${shangGua.symbol}。${BAGUA_MEANING[shangGua.name]}。`);
  parts.push(`**下卦**：${bbb} ÷ 8 余 **${xGuaNum}** → **${xiaGua.name}卦**${xiaGua.symbol}。${BAGUA_MEANING[xiaGua.name]}。\n`);
  parts.push(`上${shangGua.name}下${xiaGua.name}，这一卦叫 **「${result.benGuaName}」**，是《周易》第 **${guaData.index}** 卦。\n`);

  const dongIsShang = dongYao > 3;
  const changedGua = dongIsShang ? shangGua : xiaGua;
  const newGuaName = dongIsShang ? bian.shang : bian.xia;
  const lineIdx = dongIsShang ? dongYao - 3 : dongYao;
  parts.push(`**动爻**：${aaa} + ${bbb} = ${sum}，除以 6 余 **${dongYao}** → 第 **${dongYao}** 爻（${LINE_NAMES[dongYao-1]}）发动。`);
  parts.push(`${dongIsShang ? "上卦" : "下卦"}${changedGua.name}的第 ${lineIdx} 爻一变化，变成了 **${newGuaName}卦**，整卦就成了 **「${result.bianGuaName}」**。\n`);

  // ---- 二、本卦解读 ----
  parts.push(`---\n## 二、本卦「${result.benGuaName}」\n`);
  parts.push(`> **卦辞**："${guaData.guaCi}"\n`);
  parts.push(`${guaData.guaCiCN}\n`);
  if (guaData.xiangZhuan) parts.push(`> **《大象》**："${guaData.xiangZhuan}"\n`);

  // Contextual interpretation of the original hexagram
  parts.push(`### 这个卦在对你说的「${q}」\n`);
  parts.push(benGuaContext(result.benGuaName, q) + "\n");

  // ---- 三、动爻解读 ----
  parts.push(`---\n## 三、动爻精解——${movingYao.position}\n`);
  parts.push(`> **爻辞**："${movingYao.text}"\n`);
  parts.push(`${movingYao.textCN}\n`);
  parts.push(`### 这一爻在回答你的「${q}」\n`);
  parts.push(yaoContext(guaData.name, movingYao.position, movingYao.textCN, q) + "\n");

  // ---- 四、变卦走向 ----
  if (result.benGuaName !== result.bianGuaName) {
    parts.push(`---\n## 四、变卦「${result.bianGuaName}」\n`);
    if (bianData.guaCi !== "（卦辞）") {
      parts.push(`> **卦辞**："${bianData.guaCi}"\n`);
    }
    parts.push(`${bianData.guaCiCN}\n`);
    parts.push(`### 这件事的走向\n`);
    parts.push(bianContext(result.benGuaName, result.bianGuaName, q) + "\n");
  }

  // ---- 五、给你的话 ----
  parts.push(`---\n## 五、给你的话\n`);
  parts.push(finalVerdict(result, movingYao, q));

  return parts.join("\n");
}

// ---- Context-specific interpretation helpers ----

function benGuaContext(name: string, q: string): string {
  const contexts: Record<string, string> = {
    "天雷无妄": `无妄，就是不妄为、不强求。放在你问的「${q}」上，老天在说：这件事**不要硬来**。不是让你什么都不做，而是让你顺着事情本来的样子走——不要加太多人为的期待和干预。你越放松，结果反而越好。`,
    "天水讼": `讼卦，是心里有掂量、有比较。放在你问的「${q}」上——这件事正在被认真对待，不是被忽略。但"讼"也意味着脑子里有问号在转——对方或环境在权衡、在琢磨。这不是坏事。`,
    "乾为天": `纯阳至健。放在你问的「${q}」上——现在是一个需要你**主动创造**的阶段。天行健，君子自强不息。事情能不能成，很大程度上取决于你接下来的行动。`,
    "坤为地": `纯阴至顺。放在你问的「${q}」上——现在不是冲锋陷阵的时候。像大地一样包容和承载，以柔克刚。守成、等待、积累，比主动出击更适合。`,
    "地天泰": `天地交泰，上下沟通顺畅。放在你问的「${q}」上——这是**大吉之卦**。小的障碍会自己消失，大的方向上万事亨通。顺势而为就好。`,
    "天地否": `天地不交，闭塞不通。放在你问的「${q}」上——当前时机不太对。但否卦不是永远——否极泰来。现在需要的是忍耐和低调，等待转机。`,
    "火地晋": `日出地上，光明渐升。放在你问的「${q}」上——事情正在**缓慢但稳定地向上走**。不会一夜之间翻天覆地，但每一步都是踏实的。保持耐心。`,
    "雷地豫": `雷出地上，万物振奋。放在你问的「${q}」上——整体氛围是愉悦和乐观的。但豫卦提醒：别因为太开心而放松警惕。「介于石，不终日」——要像磐石一样清醒。`,
    "泽水困": `泽中无水，困顿之象。放在你问的「${q}」上——当前确实不太顺利。但困卦的奇妙之处在于卦辞开头就是"亨"——困也能亨。关键是守住正道，不因困境而乱了自己的方寸。`,
    "地雷复": `一阳来复！放在你问的「${q}」上——这是**转机之卦**。之前可能有些低迷，但现在阳气在地下萌动了。事情正在往好的方向走。七天一个循环，耐心等。`,
    "火雷噬嗑": `咬合突破。放在你问的「${q}」上——前面有障碍，但它是可以被咬碎的。你需要**坚持和突破**，像一个咬的动作——用力，但不用蛮力，对准关键点。`,
    "泽火革": `变革之象。放在你问的「${q}」上——事情需要改变，或者已经在改变了。革卦说"己日乃孚"——到了合适的时候才有诚信。变革需要时机，急不得。`,
    "水火既济": `既成之象。放在你问的「${q}」上——事情快要成了或已经成了。但既济卦最要紧的是"初吉终乱"——开始是吉的，但成功之后容易出问题。**居安思危**是关键。`,
    "火水未济": `未完成。放在你问的「${q}」上——事情还没完，就差最后一步了。小狐狸过河弄湿了尾巴——别在最后掉链子。再坚持一下，就快到了。`,
  };
  return contexts[name] || `${name}卦放在你问的「${q}」上——${findGuaData(name).guaCiCN}`;
}

function yaoContext(guaName: string, pos: string, cn: string, q: string): string {
  const key = `${guaName}-${pos}`;
  const specials: Record<string, string> = {
    "乾为天-初九": `「潜龙勿用」——你现在是那条潜在深渊里的龙。不是没有能力，是时机还没到。不要急着跳出来证明自己。沉住气，积蓄力量。`,
    "乾为天-九二": `「见龙在田」——龙已经出现在田野上，有人能看到你了。利于去见重要的人。你的能力开始被注意到——这是崭露头角的时机。`,
    "乾为天-九五": `「飞龙在天」——这是全卦最尊贵的位置。龙飞在天上，万众瞩目。这件事你已经到了最佳状态，大胆去做，成功的概率极高。`,
    "乾为天-上九": `「亢龙有悔」——龙飞得太高了，孤立无援，会有悔恨。这是在提醒你：**不要过度**。现在的位置已经很高了，再往上就有风险。`,
    "坤为地-六三": `「含章可贞，或从王事，无成有终」——你肚子里有真东西（含章），可以守住。去做事可能不会立刻有惊天动地的成果，但一定会有**好的结局**。对方看到的是你的底子和积累。`,
    "坤为地-六五": `「黄裳，元吉」——穿黄色的下裳，大吉。黄是中色，裳是下装——居中守下，是最吉利的位置。不争不抢，反而得到最好的。`,
    "天水讼-六三": `「食旧德，贞厉，终吉」——你靠过去攒下的德行和本事来应对这件事。过程虽然有点难（贞厉），但最终是吉的。对方看到了你的"旧德"——实实在在的经历和积累——不是花架子。`,
    "天水讼-九五": `「讼，元吉」——这场"讼"有了公正的裁决。元吉，大吉大利。放在你问的「${q}」上——会有一个公正的、对你有益的结论。`,
    "天雷无妄-九五": `「无妄之疾，勿药有喜」——有些问题不是你有意造成的，是"无妄之疾"，就像无缘无故得的感冒。不用吃药，自己会好。放在你这件事上——**不用过度反应**，让事情自然发展就好。`,
    "地雷复-初九": `「不远复，无祗悔，元吉」——没走多远就回头了，不会有大悔恨，大吉！这是最及时的回头。你在这件事上的调整非常及时——**回头不是失败，是智慧**。`,
    "火地晋-六二": `「晋如愁如，贞吉。受兹介福，于其王母」——前进中带着忧愁，但守正得吉。会从一个意想不到的来源（"王母"）得到大的福气。这个福气不是你自己挣来的，是上天的馈赠。`,
    "雷水解-上六": `「公用射隼于高墉之上，获之，无不利」——在高墙上射中了鹰隼。精准出击，一击即中。你在这件事上只要瞄准目标不犹豫，就能成功。`,
    "水火既济-上六": `「濡其首，厉」——把头都弄湿了。成功之后如果得意忘形，就会有危险。这是在提醒你：事情快成了，但最后关头不能放松。`,
    "火水未济-九二": `「曳其轮，贞吉」——拖住车轮，不要冲太快。守正则吉。你在这件事上需要的是**稳住节奏**，不是加速前进。`,
  };

  if (specials[key]) return specials[key] + `\n\n——这一爻说的就是你。`;

  // Meaningful generic
  return `${cn}\n\n这一爻直接回应了你的「${q}」。爻动了，老天就是在这一个点上给你最精准的提示。仔细品爻辞里的每一个字——它说的就是你现在的处境。`;
}

function bianContext(benName: string, bianName: string, q: string): string {
  const trans: Record<string, string> = {
    "天雷无妄-火雷噬嗑": `从"不妄为"走到"咬合突破"——这个变化非常有意思。无妄告诉你放松、顺其自然；噬嗑告诉你前面有个障碍需要咬碎。结合起来看：**不是你主动去找麻烦，而是自然会出现一个需要你突破的点**。等它出现，然后精准用力。`,
    "天水讼-天风姤": `从"心里有掂量"走到"天地相遇"——这是一个从审视走向认可的过程。姤是"遇"，是天地碰上了、万物被看清了。对方从琢磨你到觉得跟你这件事是有缘分的。`,
    "坤为地-地雷复": `从"柔顺承载"走到"一阳来复"——你在低调中积蓄的力量，已经在地下萌动了。转机不是从外面来的，是从你**自己内部**生出来的。`,
    "火地晋-山地剥": `从"稳步上升"走到"剥落衰退"——这是一个警示。当前的上升趋势如果不注意，可能会遇到剥蚀。需要检查哪里在"剥落"，及时止损。`,
    "泽水困-水风井": `从"困顿"走到"水井"——困卦之后往往就是出路。井卦是水源——困难之中有**不变的本质**在支撑你。就像井不会因为城邑变迁而改变。`,
    "水火既济-火水未济": `从"完成"走到"未完成"——这个变化有点反转。可能你以为事情已经结束了，但实际上还有新的一章。既济之后容易松懈，松懈之后就进入了未济。**不能以为结束了**。`,
    "火水未济-水火既济": `从"未完成"走到"完成"——最好的变化方向！就差最后一把力了，再加把劲就到达彼岸。别在最后一步放弃。`,
  };
  const key = `${benName}-${bianName}`;
  if (trans[key]) return trans[key];
  return `从「${benName}」走到「${bianName}」——这是卦象在告诉你事情发展的方向。两个卦之间的变化，就是你这件事从"现在"到"未来"的轨迹。`;
}

function finalVerdict(result: LiuYaoResult, yao: any, q: string): string {
  // Build personalized verdict
  const dongPos = result.lines.findIndex(l => l.isMoving);
  const movingLine = result.lines[dongPos];
  const isShiMoving = movingLine?.shiYing === "世";

  let verdict = `关于「${q}」，这一卦给出的答案已经在这五个小节里了。\n\n`;

  // Summarize in simple language
  verdict += `**简单来说：**本卦「${result.benGuaName}」是当前的状态，动爻告诉你最关键的变化点在哪，变卦「${result.bianGuaName}」是未来的走向。\n\n`;

  if (isShiMoving) {
    verdict += `💡 **特别注意**：动爻正好对应"世爻"——这代表**你自己**。变化是由你引起的，结果也由你决定。你手里有主动权。\n\n`;
  }

  // Check if mutating yang→yin (阳变阴) or yin→yang (阴变阳)
  if (movingLine) {
    const isYangTurning = movingLine.original === "—" && movingLine.isMoving;
    if (isYangTurning) {
      verdict += `⚡ 动爻是阳变阴——从刚变柔。这是在暗示你：之前你可能是硬碰硬的方式，现在需要一些柔软和耐心。\n\n`;
    } else if (movingLine.original === "- -" && movingLine.isMoving) {
      verdict += `⚡ 动爻是阴变阳——从柔变刚。你之前可能是比较被动的，现在需要你**站起来、行动起来**。\n\n`;
    }
  }

  verdict += `卦会告诉你方向，但路要你自己走。把心放平，一切都会是最好的安排。`;

  return verdict;
}
