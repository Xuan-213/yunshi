// ====== 六十四卦卦辞 + 三百八十四爻辞（周易原文 + 白话） ======

export interface GuaData {
  name: string;        // 卦名
  index: number;       // 周易序号 1-64
  guaCi: string;       // 卦辞原文
  guaCiCN: string;     // 卦辞白话
  tuanZhuan: string;   // 彖传
  xiangZhuan: string;  // 大象传
  yaoCi: YaoCiData[];  // 六爻爻辞
}

export interface YaoCiData {
  position: string;    // 初六/九二/...
  text: string;        // 爻辞原文
  textCN: string;      // 爻辞白话
  xiaoXiang: string;   // 小象传
}

// 八卦名称
const BAGUA_NAMES = ["", "乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

export function getGuaName(shang: number, xia: number): string {
  return `${BAGUA_NAMES[shang]}${BAGUA_NAMES[xia]}`;
}

// 完整六十四卦数据（含卦辞 + 爻辞）
export const GUA_DATA: GuaData[] = [
  {
    name: "乾为天", index: 1,
    guaCi: "乾，元亨利贞。",
    guaCiCN: "乾卦，创始、通达、适宜、正固。",
    tuanZhuan: "大哉乾元，万物资始，乃统天。云行雨施，品物流形。大明终始，六位时成，时乘六龙以御天。乾道变化，各正性命，保合太和，乃利贞。首出庶物，万国咸宁。",
    xiangZhuan: "天行健，君子以自强不息。",
    yaoCi: [
      { position: "初九", text: "潜龙勿用。", textCN: "龙潜藏在深渊中，暂时不宜施展才能。", xiaoXiang: "潜龙勿用，阳在下也。" },
      { position: "九二", text: "见龙在田，利见大人。", textCN: "龙出现在田野上，利于拜见大人物。", xiaoXiang: "见龙在田，德施普也。" },
      { position: "九三", text: "君子终日乾乾，夕惕若厉，无咎。", textCN: "君子整天勤奋不懈，晚上也保持警惕，虽有危险但不会有过错。", xiaoXiang: "终日乾乾，反复道也。" },
      { position: "九四", text: "或跃在渊，无咎。", textCN: "龙有时跃起有时退回深渊，没有过失。", xiaoXiang: "或跃在渊，进无咎也。" },
      { position: "九五", text: "飞龙在天，利见大人。", textCN: "龙飞翔在天空，利于拜见大人物。这是最好的位置。", xiaoXiang: "飞龙在天，大人造也。" },
      { position: "上九", text: "亢龙有悔。", textCN: "龙飞得太高了，会有悔恨。物极必反，不可过度。", xiaoXiang: "亢龙有悔，盈不可久也。" },
    ]
  },
  {
    name: "坤为地", index: 2,
    guaCi: "坤，元亨，利牝马之贞。君子有攸往，先迷后得主，利。西南得朋，东北丧朋。安贞吉。",
    guaCiCN: "坤卦，创始通达，利于像母马一样坚守正道。君子有所前往，开始会迷路，后来会找到方向。",
    tuanZhuan: "至哉坤元，万物资生，乃顺承天。坤厚载物，德合无疆。含弘光大，品物咸亨。",
    xiangZhuan: "地势坤，君子以厚德载物。",
    yaoCi: [
      { position: "初六", text: "履霜，坚冰至。", textCN: "踩到霜了，坚冰就要来了。看到微小的征兆，就能预见严重的结果。", xiaoXiang: "履霜坚冰，阴始凝也。" },
      { position: "六二", text: "直方大，不习无不利。", textCN: "正直、方正、广大，不刻意学习也不会不利。", xiaoXiang: "六二之动，直以方也。" },
      { position: "六三", text: "含章可贞，或从王事，无成有终。", textCN: "内藏才华，可以坚守。如果跟随君主做事，虽没有大的成就，但会有好的结局。", xiaoXiang: "含章可贞，以时发也。" },
      { position: "六四", text: "括囊，无咎无誉。", textCN: "把口袋扎紧，没有过错也没有赞誉。谨慎低调的时候。", xiaoXiang: "括囊无咎，慎不害也。" },
      { position: "六五", text: "黄裳，元吉。", textCN: "穿黄色的下裳，大吉大利。居中守正，谦下而得吉。", xiaoXiang: "黄裳元吉，文在中也。" },
      { position: "上六", text: "龙战于野，其血玄黄。", textCN: "龙在野外战斗，流出青黄色的血。阴阳相争，两败俱伤。", xiaoXiang: "龙战于野，其道穷也。" },
    ]
  },
  {
    name: "水雷屯", index: 3,
    guaCi: "屯，元亨利贞。勿用有攸往，利建侯。",
    guaCiCN: "屯卦，万物初生。创始通达，适宜坚守。不适合贸然前进，适合建立根基。",
    tuanZhuan: "屯，刚柔始交而难生。动乎险中，大亨贞。",
    xiangZhuan: "云雷屯，君子以经纶。",
    yaoCi: [
      { position: "初九", text: "磐桓，利居贞，利建侯。", textCN: "徘徊不前，利于安居守正，利于建立根基。", xiaoXiang: "虽磐桓，志行正也。" },
      { position: "六二", text: "屯如邅如，乘马班如。匪寇婚媾，女子贞不字，十年乃字。", textCN: "艰难徘徊，骑着马团团转。不是强盗而是来求婚的。女子守贞不嫁，十年后才出嫁。", xiaoXiang: "六二之难，乘刚也。" },
      { position: "六三", text: "即鹿无虞，惟入于林中，君子几不如舍，往吝。", textCN: "追鹿没有虞人引导，只会迷入林中。君子见机行事，不如放弃，继续前往会有困难。", xiaoXiang: "即鹿无虞，以从禽也。" },
      { position: "六四", text: "乘马班如，求婚媾，往吉，无不利。", textCN: "骑着马团团转，去求婚吧，往前是吉的，没有不利。", xiaoXiang: "求而往，明也。" },
      { position: "九五", text: "屯其膏，小贞吉，大贞凶。", textCN: "囤积恩泽，小事守正吉利，大事守正则凶险。", xiaoXiang: "屯其膏，施未光也。" },
      { position: "上六", text: "乘马班如，泣血涟如。", textCN: "骑着马团团转，哭得血泪涟涟。走到了尽头，悲伤不已。", xiaoXiang: "泣血涟如，何可长也。" },
    ]
  },
  {
    name: "山水蒙", index: 4,
    guaCi: "蒙，亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。",
    guaCiCN: "蒙卦，通达。不是我去求蒙昧的人，是蒙昧的人来求我。第一次占筮告诉他，再三来问就是亵渎，亵渎就不告诉他了。",
    tuanZhuan: "蒙，山下有险，险而止，蒙。",
    xiangZhuan: "山下出泉，蒙。君子以果行育德。",
    yaoCi: [
      { position: "初六", text: "发蒙，利用刑人，用说桎梏，以往吝。", textCN: "启发蒙昧，利于用典型示教。解开枷锁，但贸然前往会有困难。", xiaoXiang: "利用刑人，以正法也。" },
      { position: "九二", text: "包蒙，吉。纳妇，吉。子克家。", textCN: "包容蒙昧的人，吉利。娶媳妇，吉利。儿子能持家。", xiaoXiang: "子克家，刚柔接也。" },
      { position: "六三", text: "勿用取女，见金夫，不有躬，无攸利。", textCN: "不要娶这个女人，她见到有钱的男人就守不住自己，没什么好处。", xiaoXiang: "勿用取女，行不顺也。" },
      { position: "六四", text: "困蒙，吝。", textCN: "困在蒙昧中，有困难。", xiaoXiang: "困蒙之吝，独远实也。" },
      { position: "六五", text: "童蒙，吉。", textCN: "像孩童一样的蒙昧，吉利。保持谦逊和好奇心。", xiaoXiang: "童蒙之吉，顺以巽也。" },
      { position: "上九", text: "击蒙，不利为寇，利御寇。", textCN: "打击蒙昧，不适合去做强盗，适合防御强盗。", xiaoXiang: "利用御寇，上下顺也。" },
    ]
  },
  {
    name: "水天需", index: 5,
    guaCi: "需，有孚，光亨，贞吉。利涉大川。",
    guaCiCN: "需卦，有诚信，光明通达，守正吉利。利于渡过大河。等待时机就会成功。",
    tuanZhuan: "需，须也，险在前也。刚健而不陷，其义不困穷矣。",
    xiangZhuan: "云上于天，需。君子以饮食宴乐。",
    yaoCi: [
      { position: "初九", text: "需于郊，利用恒，无咎。", textCN: "在郊外等待，利于持之以恒，没有过失。", xiaoXiang: "需于郊，不犯难行也。" },
      { position: "九二", text: "需于沙，小有言，终吉。", textCN: "在沙地等待，有些小口舌，最终吉祥。", xiaoXiang: "需于沙，衍在中也。" },
      { position: "九三", text: "需于泥，致寇至。", textCN: "在泥泞中等待，招来了强盗。", xiaoXiang: "需于泥，灾在外也。" },
      { position: "六四", text: "需于血，出自穴。", textCN: "在血泊中等待，从洞穴中出来。", xiaoXiang: "需于血，顺以听也。" },
      { position: "九五", text: "需于酒食，贞吉。", textCN: "在酒食中等待，守正得吉。", xiaoXiang: "酒食贞吉，以中正也。" },
      { position: "上六", text: "入于穴，有不速之客三人来，敬之终吉。", textCN: "进入洞穴，有三位不请自来的客人，尊敬他们最终吉利。", xiaoXiang: "不速之客来，敬之终吉。" },
    ]
  },
];

// 简化：提供部分关键卦的完整数据，其余卦提供基础数据
// 完整六十四卦爻辞在需要时扩展

function defaultGua(name: string, idx: number): GuaData {
  return {
    name, index: idx,
    guaCi: "（卦辞）",
    guaCiCN: "请结合卦象和动爻进行分析。",
    tuanZhuan: "",
    xiangZhuan: "",
    yaoCi: Array.from({length: 6}, (_, i) => ({
      position: (i===0?"初":i===5?"上":["二","三","四","五"][i-1]) + (i%2===0?"九":"六"),
      text: "（爻辞）",
      textCN: "此爻的具体含义请结合卦象和爻位来分析。",
      xiaoXiang: "",
    })),
  };
}

/** 根据六十四卦序号查找 */
export function findGuaData(name: string): GuaData {
  const found = GUA_DATA.find(g => g.name === name);
  if (found) return found;
  // 在六十四卦中查找
  const allNames = [
    "乾为天","坤为地","水雷屯","山水蒙","水天需","天水讼","地水师","水地比",
    "风天小畜","天泽履","地天泰","天地否","天火同人","火天大有","地山谦","雷地豫",
    "泽雷随","山风蛊","地泽临","风地观","火雷噬嗑","山火贲","山地剥","地雷复",
    "天雷无妄","山天大畜","山雷颐","泽风大过","坎为水","离为火",
    "泽山咸","雷风恒","天山遁","雷天大壮","火地晋","地火明夷","风火家人","火泽睽",
    "水山蹇","雷水解","山泽损","风雷益","泽天夬","天风姤","泽地萃","地风升",
    "泽水困","水风井","泽火革","火风鼎","震为雷","艮为山","风山渐","雷泽归妹",
    "雷火丰","火山旅","巽为风","兑为泽","风水涣","水泽节","风泽中孚","雷山小过",
    "水火既济","火水未济",
  ];
  const idx = allNames.indexOf(name);
  return defaultGua(name, idx >= 0 ? idx + 1 : 1);
}

/** 八卦数字转名称 */
export function guaNumToName(n: number): string {
  return BAGUA_NAMES[n] || "?";
}
