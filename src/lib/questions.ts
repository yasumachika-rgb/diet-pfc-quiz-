// PFC over-consumption diagnostic — questions & scoring
// Each option adds points to one or more macros: P (protein), F (fat), C (carb).

export type Macro = "P" | "F" | "C";

export type Option = {
  label: string;
  // points added to each macro when this option is chosen
  add: Partial<Record<Macro, number>>;
  // marks the "strict carb-restriction" answer (used in tie-break toward P)
  strict?: boolean;
};

export type Question = {
  id: string;
  text: string;
  options: Option[];
  optional?: boolean; // can be removed to shorten to 8 questions
};

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "主食（ごはん・パン・麺）を1日にどのくらい食べますか？",
    options: [
      { label: "3食しっかり＋間食でも食べる", add: { C: 3 } },
      { label: "1日3食きっちり", add: { C: 2 } },
      { label: "1日1〜2食くらい", add: { C: 1 } },
      { label: "ほとんど食べない／置き換えにしている", add: { P: 1 }, strict: true },
    ],
  },
  {
    id: "q2",
    text: "甘いもの（お菓子・菓子パン・スイーツ）の頻度は？",
    options: [
      { label: "ほぼ毎日", add: { C: 3 } },
      { label: "週3〜4回", add: { C: 2 } },
      { label: "週1〜2回", add: { C: 1 } },
      { label: "ほとんど食べない", add: {} },
    ],
  },
  {
    id: "q3",
    text: "甘い飲み物（加糖コーヒー・カフェラテ・ジュース・エナドリ）は？",
    options: [
      { label: "毎日2杯以上", add: { C: 3 } },
      { label: "毎日1杯くらい", add: { C: 2 } },
      { label: "時々", add: { C: 1 } },
      { label: "ほぼ飲まない", add: {} },
    ],
  },
  {
    id: "q4",
    text: "揚げ物・脂っこい料理（唐揚げ・とんかつ・天ぷら・油多めの炒め物）は？",
    options: [
      { label: "週4回以上", add: { F: 3 } },
      { label: "週2〜3回", add: { F: 2 } },
      { label: "週1回くらい", add: { F: 1 } },
      { label: "ほとんど食べない", add: {} },
    ],
  },
  {
    id: "q5",
    text: "脂の多いもの（脂身の多い肉・ベーコン／ソーセージ・チーズ・バター）は？",
    options: [
      { label: "ほぼ毎日", add: { F: 3 } },
      { label: "週に数回", add: { F: 2 } },
      { label: "時々", add: { F: 1 } },
      { label: "ほぼ食べない", add: {} },
    ],
  },
  {
    id: "q6",
    optional: true,
    text: "ドレッシング・マヨネーズ・油・ナッツ・スナック菓子は？",
    options: [
      { label: "たっぷり使う／毎日食べる", add: { F: 2 } },
      { label: "そこそこ", add: { F: 1 } },
      { label: "控えめ", add: {} },
    ],
  },
  {
    id: "q7",
    text: "たんぱく源（肉・魚・卵・大豆製品）の摂り方は？",
    options: [
      { label: "プロテイン・サラダチキン・鶏むねなど「たんぱく質中心」にかなり寄せている", add: { P: 3 } },
      { label: "毎食しっかり入っている", add: { P: 1 } },
      { label: "1日1〜2回くらい", add: {} },
      { label: "ほとんど意識していない", add: {} },
    ],
  },
  {
    id: "q8",
    text: "糖質（主食・甘いもの）を意識して避けていますか？",
    options: [
      { label: "かなり制限している／糖質オフを頑張っている", add: { P: 2 }, strict: true },
      { label: "少し気をつけている", add: { P: 1 } },
      { label: "特に意識していない", add: {} },
    ],
  },
  {
    id: "q9",
    text: "お腹が空いたとき、最初に手が伸びるのは？",
    options: [
      { label: "ごはん・パン・麺・甘いもの", add: { C: 2 } },
      { label: "揚げ物・脂っこいもの・チーズ", add: { F: 2 } },
      { label: "鶏むね・プロテイン・ゆで卵など", add: { P: 2 } },
    ],
  },
  {
    id: "q10",
    optional: true,
    text: "外食・コンビニ・テイクアウトの頻度は？",
    options: [
      { label: "ほぼ毎日", add: { C: 1, F: 1 } },
      { label: "週に数回", add: { F: 1 } },
      { label: "ほとんど自炊", add: {} },
    ],
  },
];
