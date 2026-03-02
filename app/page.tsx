"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Chapter = "幼稚園/保育園" | "小学校" | "中学校" | "高校";

type Scores = {
  agency: number;   // 主体性
  risk: number;     // 挑戦性
  other: number;    // 他者軸
  letgo: number;    // 手放し度（続ける0〜手放す100）
  friction: number; // 摩擦許容
  future: number;   // 未来志向
};

type Card = {
  chapter: Chapter;
  hobby: string;
  event: string;
  optionA: string;
  optionB: string;
  chosen: "A" | "B";
  values: string;
  fears: string;
  linkToNow: string;
  scores: Scores;
};

type Msg = { role: "assistant" | "user"; content: string };

type ChapterTheme = {
  mainBg: string;
  glowA: string;
  glowB: string;
  glowC: string;
  lineA: string;
  lineB: string;
  lineC: string;
  panel: string;
  panelShadow: string;
  inputPanelShadow: string;
  aiBubble: string;
  aiLabel: string;
};

const chapters: Chapter[] = ["幼稚園/保育園", "小学校", "中学校", "高校"];

const chapterThemes: Record<Chapter, ChapterTheme> = {
  "幼稚園/保育園": {
    mainBg: "bg-gradient-to-b from-sky-900 via-cyan-900 to-teal-950",
    glowA: "bg-cyan-200/15",
    glowB: "bg-sky-200/15",
    glowC: "bg-teal-200/12",
    lineA: "via-cyan-100/35",
    lineB: "via-sky-100/25",
    lineC: "via-teal-100/25",
    panel: "border-cyan-100/25 bg-gradient-to-b from-white/12 to-cyan-200/8",
    panelShadow: "shadow-[0_0_42px_rgba(103,232,249,0.14)]",
    inputPanelShadow: "shadow-[0_0_42px_rgba(94,234,212,0.12)]",
    aiBubble: "bg-gradient-to-br from-cyan-100/14 to-sky-100/10 border-cyan-100/25 shadow-[0_0_24px_rgba(103,232,249,0.16)]",
    aiLabel: "text-cyan-100/90",
  },
  "小学校": {
    mainBg: "bg-gradient-to-b from-cyan-950 via-sky-950 to-blue-950",
    glowA: "bg-cyan-300/10",
    glowB: "bg-blue-300/12",
    glowC: "bg-sky-300/10",
    lineA: "via-cyan-200/30",
    lineB: "via-blue-200/22",
    lineC: "via-sky-200/20",
    panel: "border-sky-100/20 bg-gradient-to-b from-white/10 to-sky-200/6",
    panelShadow: "shadow-[0_0_40px_rgba(56,189,248,0.10)]",
    inputPanelShadow: "shadow-[0_0_40px_rgba(59,130,246,0.10)]",
    aiBubble: "bg-gradient-to-br from-cyan-200/12 to-blue-200/8 border-sky-100/20 shadow-[0_0_24px_rgba(56,189,248,0.13)]",
    aiLabel: "text-sky-200/90",
  },
  "中学校": {
    mainBg: "bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950",
    glowA: "bg-blue-300/10",
    glowB: "bg-indigo-300/12",
    glowC: "bg-cyan-200/8",
    lineA: "via-blue-200/25",
    lineB: "via-indigo-200/22",
    lineC: "via-cyan-100/16",
    panel: "border-indigo-100/20 bg-gradient-to-b from-white/10 to-indigo-200/5",
    panelShadow: "shadow-[0_0_40px_rgba(99,102,241,0.12)]",
    inputPanelShadow: "shadow-[0_0_40px_rgba(59,130,246,0.08)]",
    aiBubble: "bg-gradient-to-br from-blue-200/10 to-indigo-200/10 border-indigo-100/20 shadow-[0_0_24px_rgba(129,140,248,0.12)]",
    aiLabel: "text-indigo-200/90",
  },
  "高校": {
    mainBg: "bg-gradient-to-b from-slate-950 via-cyan-950 to-emerald-950",
    glowA: "bg-emerald-300/10",
    glowB: "bg-cyan-300/10",
    glowC: "bg-teal-200/12",
    lineA: "via-emerald-100/24",
    lineB: "via-cyan-100/24",
    lineC: "via-teal-100/20",
    panel: "border-emerald-100/20 bg-gradient-to-b from-white/10 to-emerald-200/5",
    panelShadow: "shadow-[0_0_40px_rgba(16,185,129,0.10)]",
    inputPanelShadow: "shadow-[0_0_40px_rgba(45,212,191,0.10)]",
    aiBubble: "bg-gradient-to-br from-emerald-200/10 to-cyan-200/8 border-emerald-100/20 shadow-[0_0_24px_rgba(52,211,153,0.12)]",
    aiLabel: "text-emerald-100/90",
  },
};

const typeVisuals = [
  { key: "シンデレラ", icon: "👠", subtitle: "あなたはいま、名乗り出る直前の章。" },
  { key: "赤ずきん", icon: "🧺", subtitle: "あなたはいま、迷いごとごと前に進む章。" },
  { key: "白雪姫", icon: "🪞", subtitle: "あなたはいま、調和の中で輪郭を育てる章。" },
  { key: "ピーターパン", icon: "🌙", subtitle: "あなたはいま、軽やかに境界を越える章。" },
  { key: "ベル", icon: "📚", subtitle: "あなたはいま、言葉で未来を照らす章。" },
  { key: "人魚姫", icon: "🫧", subtitle: "あなたはいま、想いの深さを力に変える章。" },
  { key: "ヘンゼル", icon: "🧭", subtitle: "あなたはいま、道筋を見つけて進む章。" },
  { key: "ジャンヌ", icon: "🔥", subtitle: "あなたはいま、意思に火を灯して進む章。" },
] as const;

const chapterVisuals: Record<Chapter, { icon: string; accent: string }> = {
  "幼稚園/保育園": { icon: "🫧", accent: "border-cyan-100/20 bg-cyan-100/5" },
  "小学校": { icon: "🌊", accent: "border-sky-100/20 bg-sky-100/5" },
  "中学校": { icon: "🌌", accent: "border-indigo-100/20 bg-indigo-100/5" },
  "高校": { icon: "🧭", accent: "border-emerald-100/20 bg-emerald-100/5" },
};

const scoreMeta = [
  { key: "agency", label: "主体性", help: "自分で決めて動く力" },
  { key: "risk", label: "挑戦性", help: "未知に踏み出す勢い" },
  { key: "other", label: "他者軸", help: "人との関係を軸に考える度合い" },
  { key: "letgo", label: "手放し度", help: "区切りをつけて次へ進む柔らかさ" },
  { key: "friction", label: "摩擦許容", help: "衝突や違和感に耐えて進む強さ" },
  { key: "future", label: "未来志向", help: "先の可能性を見にいく視点" },
] as const satisfies ReadonlyArray<{ key: keyof Scores; label: string; help: string }>;

function getTypeVisual(typeName: string) {
  return typeVisuals.find((v) => typeName.startsWith(v.key)) ?? { icon: "💧", subtitle: "あなたはいま、流れの輪郭が見えてきた章。" };
}

type Phase =
  | "ASK_HOBBY"
  | "ASK_EVENT"
  | "ASK_CHOICE_A"
  | "ASK_CHOICE_B"
  | "ASK_CHOSEN"
  | "ASK_VALUES"
  | "ASK_FEARS"
  | "ASK_LINK"
  | "REVIEW_CARD";

function emptyDraft(): Omit<Card, "chapter"> {
  return {
    hobby: "",
    event: "",
    optionA: "",
    optionB: "",
    chosen: "A",
    values: "",
    fears: "",
    linkToNow: "",
    scores: { agency: 50, risk: 50, other: 50, letgo: 50, friction: 50, future: 50 },
  };
}

function phaseProgress(phase: Phase) {
  const map: Record<Phase, number> = {
    ASK_HOBBY: 1,
    ASK_EVENT: 2,
    ASK_CHOICE_A: 3,
    ASK_CHOICE_B: 3,
    ASK_CHOSEN: 3,
    ASK_VALUES: 4,
    ASK_FEARS: 4,
    ASK_LINK: 4,
    REVIEW_CARD: 5,
  };
  return map[phase];
}

function phaseHint(phase: Phase) {
  const hints: Record<Phase, string> = {
    ASK_HOBBY: "思い出せるところから雑談みたいに話してOK",
    ASK_EVENT: "「迷った/やめた/始めた/挑戦した」出来事を一つ",
    ASK_CHOICE_A: "この場面の『選択肢A』を作るターン（まず片方だけ）",
    ASK_CHOICE_B: "次に『選択肢B』を作るターン（Aの反対/別案）",
    ASK_CHOSEN: "どっちを選んだか決めるターン（下のA/BボタンでもOK）",
    ASK_VALUES: "単語ひとつでも大丈夫",
    ASK_FEARS: "言いづらければぼかしてOK",
    ASK_LINK: "いまの自分とのつながりを一文で",
    REVIEW_CARD: "AIの下書きを見て、OKか直すか決める",
  };
  return hints[phase];
}

function clarificationPrompt(phase: Phase) {
  const prompts: Record<Phase, string> = {
    ASK_HOBBY: "たとえば「場所（家/外）」「誰といたか」「好きだった遊び」どれか1つだけでも思い出せる？",
    ASK_EVENT: "大きな事件じゃなくてOK。『やる/やらないで迷った小さい場面』を1つだけで十分。",
    ASK_CHOICE_A: "まずはAだけ。迷ったら『続ける』『言う』『やってみる』みたいな短語でもOK。",
    ASK_CHOICE_B: "次にBだけ。Aの反対か、別の案を短く置いてみよう。",
    ASK_CHOSEN: "決めきれなければ『A寄り』『B寄り』でもOK。どちらに近かった？",
    ASK_VALUES: "単語1つでOK。例: 安心 / 自由 / 成長 / 仲間",
    ASK_FEARS: "こちらも単語でOK。例: 失敗 / 嫌われる / 後悔",
    ASK_LINK: "いまの自分とのつながりを、短い一文で試してみよう。",
    REVIEW_CARD: "",
  };
  return prompts[phase];
}

function isVagueInput(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  if (t.length <= 2) return true;
  const vagueWords = [
    "わから",
    "覚えてない",
    "覚えていない",
    "曖昧",
    "忘れた",
    "ないかも",
    "特にない",
    "うーん",
    "たぶん",
    "微妙",
  ];
  return vagueWords.some((w) => t.includes(w));
}

function inferScoresFromDraft(draft: Omit<Card, "chapter">): Scores {
  const totalText =
    `${draft.hobby} ${draft.event} ${draft.optionA} ${draft.optionB} ${draft.values} ${draft.fears} ${draft.linkToNow}`.length;
  const choiceBias = draft.chosen === "A" ? 1 : -1;
  return {
    agency: clamp(45 + draft.values.length * 3 + choiceBias * 6),
    risk: clamp(40 + draft.event.length * 2 + (draft.chosen === "A" ? 10 : 0)),
    other: clamp(35 + draft.fears.length * 2 + draft.linkToNow.length),
    letgo: clamp(50 + (draft.chosen === "B" ? 12 : -6) + draft.event.length),
    friction: clamp(38 + draft.fears.length * 3 + (draft.chosen === "A" ? 4 : 0)),
    future: clamp(42 + draft.linkToNow.length * 3 + Math.floor(totalText / 8)),
  };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function avg(cards: Card[]): Scores {
  const s = { agency:0, risk:0, other:0, letgo:0, friction:0, future:0 };
  const d = Math.max(1, cards.length);
  for (const c of cards) {
    s.agency += c.scores.agency;
    s.risk += c.scores.risk;
    s.other += c.scores.other;
    s.letgo += c.scores.letgo;
    s.friction += c.scores.friction;
    s.future += c.scores.future;
  }
  return {
    agency: clamp(s.agency/d),
    risk: clamp(s.risk/d),
    other: clamp(s.other/d),
    letgo: clamp(s.letgo/d),
    friction: clamp(s.friction/d),
    future: clamp(s.future/d),
  };
}

// 超簡易タイプ判定（あとで増やせる）
function pickType(s: Scores) {
  const scores = [
    { name: "シンデレラ（名乗り出る主人公）", v: s.agency*1.2 + s.risk*1.0 + s.future*0.6 - s.other*0.3 },
    { name: "赤ずきん（迷いながら会いに行く）", v: s.other*1.1 + s.risk*0.6 + s.future*0.6 - s.friction*0.2 },
    { name: "白雪姫（調和と適応）", v: s.other*1.0 + (100-s.friction)*0.9 + (100-s.risk)*0.5 },
    { name: "ピーターパン（自由×挑戦）", v: s.risk*1.2 + s.friction*0.7 - s.future*0.2 },
    { name: "ベル（内省×未来志向）", v: s.future*1.2 + s.agency*0.6 - s.risk*0.2 },
    { name: "人魚姫（想いを背負う）", v: s.other*1.3 + s.letgo*0.4 - s.agency*0.4 },
    { name: "ヘンゼル（戦略と判断）", v: s.future*1.0 + s.friction*0.4 + (100-s.letgo)*0.3 },
    { name: "ジャンヌ（使命で進む）", v: s.agency*0.6 + s.risk*0.7 + s.friction*0.8 + s.other*0.4 },
  ].sort((a,b)=>b.v-a.v);
  return { first: scores[0].name, second: scores[1].name };
}

export default function Home() {
  const fieldClass =
    "w-full rounded-xl px-3 py-2 bg-white/10 text-white placeholder:text-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60";
  const [chapterIndex, setChapterIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ASK_HOBBY");
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [draft, setDraft] = useState<Omit<Card,"chapter">>(emptyDraft);
  const [cards, setCards] = useState<Card[]>([]);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "ここは、あなたの過去を“診断する場所”ではなく、一緒にたどる対話の場所です。正確じゃなくて大丈夫。曖昧でも、断片でもOK。4つの章を話しながら、最後に『これからの舵』まで一緒に考えよう。まずは幼稚園/保育園くらいの頃、何に夢中だった？" },
  ]);
  const typingTimerRef = useRef<number | null>(null);

  const chapter = chapters[Math.min(chapterIndex, chapters.length - 1)];
  const theme = chapterThemes[chapter];
  const latestAIMessage =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";

  const summary = useMemo(() => {
    if (cards.length !== 4) return null;
    const s = avg(cards);
    const t = pickType(s);
    return { s, t };
  }, [cards]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    };
  }, []);

  function pushUser(text: string) {
    setMessages(m => [...m, { role:"user", content: text }]);
  }
  function pushAI(text: string) {
    setMessages(m => [...m, { role:"assistant", content: text }]);
  }

  function botSay(text: string, delay = 420) {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    setIsTyping(true);
    typingTimerRef.current = window.setTimeout(() => {
      pushAI(text);
      setIsTyping(false);
      typingTimerRef.current = null;
    }, delay);
  }

  function empath(nextQuestion: string) {
    const picks = [
      "いいね、それ覚えてるの強い。",
      "それ、ちゃんと大事な手触りがある話だね。",
      "うん、そこにあなたっぽさ出てる。",
      "その感じ、いい線いってる。言葉にできてる。",
    ];
    return `${picks[Math.floor(Math.random() * picks.length)]}\n${nextQuestion}`;
  }

  function mirror(text: string) {
    const short = text.replace(/\s+/g, " ").trim();
    if (!short) return "";
    const clipped = short.length > 22 ? `${short.slice(0, 22)}…` : short;
    return `つまり「${clipped}」って感じなんだね。`;
  }

  function quickHintsForPhase(current: Phase) {
    const map: Record<Phase, string[]> = {
      ASK_HOBBY: ["外で遊ぶ", "絵を描く", "ゲーム"],
      ASK_EVENT: ["やめるか迷った", "挑戦した", "人間関係が変わった"],
      ASK_CHOICE_A: ["続ける", "言う", "やってみる"],
      ASK_CHOICE_B: ["やめる", "言わない", "様子を見る"],
      ASK_CHOSEN: ["A", "B", "A（理由も言う）"],
      ASK_VALUES: ["安心", "自由", "成長"],
      ASK_FEARS: ["失敗", "嫌われる", "後悔"],
      ASK_LINK: ["挑戦しやすくなった", "慎重になった", "人を見るようになった"],
      REVIEW_CARD: [],
    };
    return map[current];
  }

  const isChoiceBuildingPhase =
    phase === "ASK_CHOICE_A" || phase === "ASK_CHOICE_B" || phase === "ASK_CHOSEN";

  function handleUserSend(prefill?: string) {
    if (cards.length >= 4 || phase === "REVIEW_CARD" || isTyping) return;
    const text = (prefill ?? chatInput).trim();
    if (!text) return;

    pushUser(text);
    setChatInput("");

    const allowVeryShort = phase === "ASK_CHOSEN" && /(^|\s|　)[ab]($|\s|　)/i.test(text);
    if (isVagueInput(text) && !allowVeryShort) {
      botSay(`曖昧でも大丈夫。ここは正確さより“手触り”を拾う場所にしよう。\n${clarificationPrompt(phase)}`);
      return;
    }

    if (phase === "ASK_HOBBY") {
      setDraft((d) => ({ ...d, hobby: text }));
      setPhase("ASK_EVENT");
      botSay(
        `${mirror(text)}\n${empath("その頃〜少し先で『迷った』『やめた/始めた』『挑戦した』みたいな出来事、ひとつ思い出せる？")}`,
      );
      return;
    }

    if (phase === "ASK_EVENT") {
      setDraft((d) => ({ ...d, event: text }));
      setPhase("ASK_CHOICE_A");
      botSay(
        `${mirror(text)}\n${empath("その出来事を二択にしてみよう。まずA側（選択肢1）を短く言うと？")}`,
      );
      return;
    }

    if (phase === "ASK_CHOICE_A") {
      setDraft((d) => ({ ...d, optionA: text }));
      setPhase("ASK_CHOICE_B");
      botSay(`A側いいね。じゃあB側（もう一つの選択肢）は？`);
      return;
    }

    if (phase === "ASK_CHOICE_B") {
      setDraft((d) => ({ ...d, optionB: text }));
      setPhase("ASK_CHOSEN");
      botSay(
        `${mirror(`${draft.optionA} / ${text}`)}\n${empath("そのとき実際にはどっちを選んだ？「A」「B」だけでも、理由つきでもOK。")}`,
      );
      return;
    }

    if (phase === "ASK_CHOSEN") {
      const chosen: "A" | "B" = /(^|\s|　)b($|\s|　)/i.test(text) || text.includes("B") || text.includes("b") ? "B" : "A";
      setDraft((d) => ({ ...d, chosen }));
      setPhase("ASK_VALUES");
      botSay(
        `${empath(`了解、${chosen}を選んだんだね。そのとき大事にしていたものって何だったと思う？（単語でもOK）`)}`,
      );
      return;
    }

    if (phase === "ASK_VALUES") {
      setDraft((d) => ({ ...d, values: text }));
      setPhase("ASK_FEARS");
      botSay(`${mirror(text)}\nありがとう。逆に、そのとき怖かったものは？`);
      return;
    }

    if (phase === "ASK_FEARS") {
      setDraft((d) => ({ ...d, fears: text }));
      setPhase("ASK_LINK");
      botSay(`${mirror(text)}\n最後に、その選択が“いまの自分”にどうつながってる？一文でOK。`);
      return;
    }

    if (phase === "ASK_LINK") {
      const nextDraft = {
        ...draft,
        linkToNow: text,
      };
      nextDraft.scores = inferScoresFromDraft(nextDraft);
      setDraft(nextDraft);
      setPhase("REVIEW_CARD");
      botSay(
        `${mirror(text)}\nいいね。いまの話を転機カードの下書きにしたよ。違ったら直して、良さそうならこの章を確定しよう。`,
      );
    }
  }

  function confirmChapterCard() {
    const card: Card = { chapter, ...draft };
    setCards((cs) => [...cs, card]);

    const isLast = chapterIndex === chapters.length - 1;
    if (isLast) {
      pushAI("4章分そろったね。ここまでの流れをまとめて、あなたの物語を返すよ。");
      return;
    }

    const nextIndex = chapterIndex + 1;
    setChapterIndex(nextIndex);
    setPhase("ASK_HOBBY");
    setDraft(emptyDraft());
    botSay(`次は「${chapters[nextIndex]}」の章にいこう。何に夢中だった？`, 350);
  }

  function redoChapter() {
    setDraft(emptyDraft());
    setPhase("ASK_HOBBY");
    botSay(`OK、言い直そう。${chapter}の章、何に夢中だったところからもう一度いく？`, 250);
  }

  return (
    <main className={`relative min-h-screen overflow-hidden text-white p-6 flex justify-center ${theme.mainBg}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="water-wave-layer water-wave-a" />
        <div className="water-wave-layer water-wave-b" />
        <div className="water-caustics" />
        <div className={`absolute -top-16 -left-12 h-72 w-72 rounded-full blur-3xl ${theme.glowA}`} />
        <div className={`absolute top-1/3 right-0 h-80 w-80 rounded-full blur-3xl ${theme.glowB}`} />
        <div className={`absolute bottom-0 left-1/4 h-64 w-96 rounded-full blur-3xl ${theme.glowC}`} />
        <div className={`absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent to-transparent ${theme.lineA}`} />
        <div className={`absolute inset-x-0 top-48 h-px bg-gradient-to-r from-transparent to-transparent ${theme.lineB}`} />
        <div className={`absolute inset-x-0 bottom-28 h-px bg-gradient-to-r from-transparent to-transparent ${theme.lineC}`} />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 左：チャット（投影向けで大きく） */}
        <section className={`border rounded-2xl p-4 backdrop-blur-md ${theme.panel} ${theme.panelShadow}`}>
          <div className="text-sm opacity-70 mb-2">Story AI Proto（対話モード）</div>
          <div className="text-lg font-bold mb-2">いま：{chapter}（会話 {phaseProgress(phase)}/5）</div>

          <div className="h-[520px] overflow-auto rounded-xl bg-slate-950/45 p-3 border border-white/10">
            {cards.length < 4 ? (
              <div className="h-full flex flex-col">
                <div className="text-xs tracking-[0.12em] text-white/50 mb-3">AI TALK</div>
                <div className={`rounded-2xl border px-4 py-4 md:px-5 md:py-5 ${theme.aiBubble}`}>
                  <div className={`text-[11px] font-semibold tracking-[0.08em] mb-2 ${theme.aiLabel}`}>AI</div>
                  <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-white">
                    {latestAIMessage}
                  </div>
                </div>
                {isTyping && (
                  <div className="mt-3 text-sm text-white/65">AIが考え中…</div>
                )}
                <div className="mt-auto pt-4 text-xs text-white/55">
                  会話ログは4章完了後にここに表示されます
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl px-4 py-3 border whitespace-pre-wrap leading-relaxed ${
                        m.role === "assistant"
                          ? theme.aiBubble
                          : "bg-white/8 border-white/10"
                      }`}
                    >
                      <div
                        className={`text-[11px] font-semibold tracking-[0.08em] mb-1 ${
                          m.role === "assistant" ? theme.aiLabel : "text-white/55"
                        }`}
                      >
                        {m.role === "user" ? "YOU" : "AI"}
                      </div>
                      <div className={`${m.role === "assistant" ? "text-[17px]" : "text-base"} text-white`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 右：入力UI（章ステップに応じて出す） */}
        <section className={`border rounded-2xl p-4 backdrop-blur-md ${theme.panel} ${theme.inputPanelShadow}`}>
          {cards.length < 4 ? (
            <>
              <div className="mb-3 rounded-xl border border-white/15 bg-black/20 p-3">
                <div className="text-xs tracking-[0.1em] text-white/60 mb-1">この対話の進め方</div>
                <div className="text-sm text-white/80">
                  正解探しは不要です。曖昧でもOK。話した内容をAIが下書き化して、最後にあなたと一緒に確認します。
                </div>
              </div>
              <div className="text-lg font-bold mb-1">話してみる</div>
              <div className="text-sm text-white/65 mb-3">{phaseHint(phase)}</div>

              {phase === "REVIEW_CARD" ? (
                <>
                  <div className="border border-white/20 rounded-xl p-3 bg-black/25">
                    <div className="font-bold mb-2">転機カード（AI下書き）</div>
                    <div className="text-sm opacity-90 whitespace-pre-wrap">
                      章：{chapter}{"\n"}
                      夢中だったこと：{draft.hobby}{"\n"}
                      出来事：{draft.event}{"\n"}
                      二択：A「{draft.optionA}」/ B「{draft.optionB}」{"\n"}
                      選んだ：{draft.chosen}（{draft.chosen === "A" ? draft.optionA : draft.optionB}）{"\n"}
                      大事：{draft.values}{"\n"}
                      怖かった：{draft.fears}{"\n"}
                      今へのつながり：{draft.linkToNow}
                    </div>
                    <div className="opacity-70 text-xs mt-2">違ったらやり直してOK。まずは「だいたい合ってる」を目指す感じで。</div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <button
                      className="w-full rounded-xl bg-white text-black py-3 font-bold"
                      onClick={confirmChapterCard}
                    >
                      この章を確定する
                    </button>
                    <button
                      className="w-full rounded-xl border border-white/20 bg-white/5 py-3 font-semibold"
                      onClick={redoChapter}
                    >
                      話し直す（この章をやり直す）
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <label className="block text-sm opacity-70 mb-1">あなたの言葉で</label>
                  {isChoiceBuildingPhase && (
                    <div className="mb-3 rounded-xl border border-white/15 bg-black/20 p-3">
                      <div className="text-xs tracking-[0.1em] text-white/55 mb-2">二択をいっしょに作る</div>
                      <div className="space-y-2">
                        <div className={`rounded-lg border px-3 py-2 ${phase === "ASK_CHOICE_A" ? "border-cyan-200/40 bg-cyan-100/10" : "border-white/10 bg-white/5"}`}>
                          <div className="text-xs text-white/60 mb-1">A案（選択肢1）</div>
                          <div className="text-sm text-white">{draft.optionA || "まだ未入力"}</div>
                        </div>
                        <div className={`rounded-lg border px-3 py-2 ${phase === "ASK_CHOICE_B" ? "border-cyan-200/40 bg-cyan-100/10" : "border-white/10 bg-white/5"}`}>
                          <div className="text-xs text-white/60 mb-1">B案（選択肢2）</div>
                          <div className="text-sm text-white">{draft.optionB || "まだ未入力"}</div>
                        </div>
                        {phase === "ASK_CHOSEN" && (
                          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <div className="text-xs text-white/60 mb-2">どっちを選んだ？（タップで送信）</div>
                            <div className="grid grid-cols-1 gap-2">
                              <button
                                type="button"
                                className="w-full text-left rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                                onClick={() => handleUserSend("A")}
                                disabled={isTyping}
                              >
                                <span className="font-semibold mr-2">A</span>
                                <span className="text-white/80">{draft.optionA || "（A案を先に入力）"}</span>
                              </button>
                              <button
                                type="button"
                                className="w-full text-left rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                                onClick={() => handleUserSend("B")}
                                disabled={isTyping}
                              >
                                <span className="font-semibold mr-2">B</span>
                                <span className="text-white/80">{draft.optionB || "（B案を先に入力）"}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <textarea
                    className={`${fieldClass} h-28`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      phase === "ASK_CHOICE_A"
                        ? "A案を短く（例：続ける / 言う / やってみる）"
                        : phase === "ASK_CHOICE_B"
                          ? "B案を短く（例：やめる / 言わない / 様子を見る）"
                          : phase === "ASK_CHOSEN"
                            ? "A / B だけでもOK。理由を一言つけてもOK"
                            : "短くてもOK。思い出せるところからどうぞ。"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleUserSend();
                      }
                    }}
                    disabled={isTyping}
                  />

                  {quickHintsForPhase(phase).length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-white/55 mb-2">詰まったら候補から始めてもOK</div>
                      <div className="flex flex-wrap gap-2">
                        {quickHintsForPhase(phase).map((hint) => (
                          <button
                            key={hint}
                            className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-sm hover:bg-white/10 transition-colors"
                            onClick={() => handleUserSend(hint)}
                            disabled={isTyping}
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <button
                      className="w-full rounded-xl bg-white text-black py-3 font-bold disabled:opacity-50"
                      onClick={() => handleUserSend()}
                      disabled={isTyping || !chatInput.trim()}
                    >
                      {isTyping ? "AIが考え中…" : "話を続ける"}
                    </button>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-xs tracking-[0.1em] text-white/50 mb-2">いま作っている下書き（共同編集）</div>
                    <div className="text-sm text-white/80 space-y-1">
                      <div>夢中：{draft.hobby || "—"}</div>
                      <div>出来事：{draft.event || "—"}</div>
                      <div>二択A：{draft.optionA || "—"}</div>
                      <div>二択B：{draft.optionB || "—"}</div>
                      <div>選んだ：{draft.optionA || draft.optionB ? `${draft.chosen}（${draft.chosen === "A" ? draft.optionA || "—" : draft.optionB || "—"}）` : "—"}</div>
                      <div>大事：{draft.values || "—"}</div>
                      <div>怖さ：{draft.fears || "—"}</div>
                      <div>今とのつながり：{draft.linkToNow || "—"}</div>
                    </div>
                  </div>
                </>
              )}

              <div className="text-xs opacity-60 mt-3">
                ※これは対話型プロト。AIが会話で聞き取りつつ、裏側で転機カードを組み立てています。
              </div>
            </>
          ) : (
            // 結果
            <Result cards={cards} summary={summary} />
          )}
        </section>
      </div>
      <style jsx global>{`
        .water-wave-layer {
          position: absolute;
          inset: -12%;
          opacity: 0.42;
          filter: blur(3px);
          background-repeat: no-repeat;
          pointer-events: none;
          will-change: transform, background-position, opacity;
          transform: translate3d(0, 0, 0);
        }

        .water-wave-a {
          background-image:
            radial-gradient(120% 55% at 50% 8%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.12) 38%, transparent 72%),
            radial-gradient(150% 50% at 50% 18%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 40%, transparent 74%),
            radial-gradient(180% 60% at 50% 2%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 28%, transparent 62%);
          background-size: 170% 110%, 180% 110%, 200% 120%;
          background-position: 50% 0%, 50% 8%, 50% -4%;
          mix-blend-mode: plus-lighter;
          animation: waterSwayA 20s ease-in-out infinite;
        }

        .water-wave-b {
          inset: -18%;
          opacity: 0.30;
          filter: blur(6px);
          background-image:
            radial-gradient(140% 48% at 50% 84%, rgba(207,250,254,0.22) 0%, rgba(207,250,254,0.08) 36%, transparent 74%),
            radial-gradient(170% 62% at 50% 100%, rgba(207,250,254,0.16) 0%, rgba(207,250,254,0.05) 28%, transparent 60%);
          background-size: 180% 120%, 200% 130%;
          background-position: 50% 100%, 50% 102%;
          mix-blend-mode: screen;
          animation: waterSwayB 26s ease-in-out infinite;
        }

        .water-caustics {
          position: absolute;
          inset: 0;
          opacity: 0.18;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.22), transparent 35%),
            radial-gradient(circle at 78% 32%, rgba(255,255,255,0.16), transparent 38%),
            radial-gradient(circle at 42% 78%, rgba(255,255,255,0.14), transparent 34%);
          filter: blur(18px);
          background-size: 180% 180%;
          mix-blend-mode: screen;
          animation: causticSway 22s ease-in-out infinite;
        }

        @keyframes waterSwayA {
          0% {
            transform: translate3d(0%, 0%, 0) scale(1.02);
            background-position: 50% 0%, 50% 8%, 50% -4%;
          }
          50% {
            transform: translate3d(-2.5%, -1.2%, 0) scale(1.06);
            background-position: 48% 3%, 52% 10%, 49% -1%;
          }
          100% {
            transform: translate3d(0%, 0%, 0) scale(1.02);
            background-position: 50% 0%, 50% 8%, 50% -4%;
          }
        }

        @keyframes waterSwayB {
          0% {
            transform: translate3d(0%, 0%, 0) scale(1.05);
            background-position: 50% 100%, 50% 102%;
          }
          50% {
            transform: translate3d(2.5%, 1.8%, 0) scale(1.1);
            background-position: 52% 97%, 48% 100%;
          }
          100% {
            transform: translate3d(0%, 0%, 0) scale(1.05);
            background-position: 50% 100%, 50% 102%;
          }
        }

        @keyframes causticSway {
          0% {
            background-position: 0% 0%;
            opacity: 0.16;
          }
          50% {
            background-position: 18% 14%;
            opacity: 0.24;
          }
          100% {
            background-position: 0% 0%;
            opacity: 0.16;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .water-wave-a,
          .water-wave-b,
          .water-caustics {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function Result({ cards, summary }: { cards: Card[]; summary: { s: Scores; t: { first: string; second: string } } | null }) {
  const [animateIn, setAnimateIn] = useState(false);
  const [reflection, setReflection] = useState({
    keep: "",
    release: "",
    nextStep: "",
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!summary) return null;
  const { s, t } = summary;
  const firstType = getTypeVisual(t.first);
  const secondType = getTypeVisual(t.second);
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/35 p-3 md:p-4 transition-all duration-700 ${animateIn ? "opacity-100" : "opacity-0"}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-200/5 via-sky-200/0 to-emerald-200/5" />
        <div className="absolute -left-10 top-12 h-40 w-56 rounded-full bg-cyan-200/10 blur-3xl animate-pulse" />
        <div className="absolute right-0 bottom-10 h-32 w-52 rounded-full bg-blue-200/10 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 text-xl font-bold mb-3">結果</div>

      <div className={`relative z-10 mb-4 rounded-2xl border border-cyan-100/20 bg-gradient-to-br from-white/12 via-cyan-100/8 to-sky-100/5 p-4 shadow-[0_0_40px_rgba(56,189,248,0.10)] transition-all duration-700 ${animateIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        <div className="text-xs tracking-[0.14em] text-cyan-100/75 mb-2">YOUR STORY TYPE</div>
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 shrink-0 rounded-2xl border border-white/15 bg-white/10 grid place-items-center text-2xl">
            {firstType.icon}
          </div>
          <div className="min-w-0">
            <div className="text-xl md:text-2xl font-bold leading-tight">{t.first}</div>
            <div className="text-sm text-cyan-50/80 mt-1">{firstType.subtitle}</div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80">
          次点 <span className="mx-1">{secondType.icon}</span>
          <span className="font-semibold text-white">{t.second}</span>
        </div>
      </div>

      <div className={`relative z-10 border border-white/15 rounded-2xl p-3 bg-black/20 mb-4 transition-all duration-700 delay-100 ${animateIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        <div className="font-bold mb-3">スコア（平均）</div>
        <div className="space-y-3">
          {scoreMeta.map((item, i) => {
            const value = s[item.key];
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px] text-white/70"
                      title={item.help}
                    >
                      ?
                    </span>
                  </div>
                  <span className="text-white/75 tabular-nums">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300/80 via-sky-300/80 to-emerald-300/80 transition-all duration-700 ease-out"
                    style={{
                      width: animateIn ? `${value}%` : "0%",
                      transitionDelay: `${120 + i * 70}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`relative z-10 border border-white/15 rounded-2xl p-3 bg-black/20 transition-all duration-700 delay-150 ${animateIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        <div className="font-bold mb-2">転機タイムライン（4章）</div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {cards.map((c, i) => {
            const v = chapterVisuals[c.chapter];
            return (
              <div
                key={i}
                className={`min-w-[260px] md:min-w-[280px] snap-start rounded-2xl border p-3 ${v.accent}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold flex items-center gap-2">
                    <span>{v.icon}</span>
                    <span>{c.chapter}</span>
                  </div>
                  <div className="text-xs text-white/60">{i + 1}/4</div>
                </div>
                <div className="text-sm text-white/85 whitespace-pre-wrap">
                  <div>出来事：{c.event}</div>
                  <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                    選択：<span className="font-bold text-white">{c.chosen}</span>
                    <span className="text-white/70"> （{c.chosen === "A" ? c.optionA : c.optionB}）</span>
                  </div>
                  <div className="mt-2">二択：A「{c.optionA}」 / B「{c.optionB}」</div>
                  <div className="mt-1">大事：{c.values}</div>
                  <div className="mt-1">怖かった：{c.fears}</div>
                  <div className="mt-1">今へのつながり：{c.linkToNow}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-base font-bold text-cyan-50">
          「この先は、川で“あなたの舵”を握る番です。」
        </div>
      </div>

      <div className={`relative z-10 border border-white/15 rounded-2xl p-3 bg-black/20 mt-4 transition-all duration-700 delay-200 ${animateIn ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        <div className="font-bold mb-2">最後の対話（ここから先を決める）</div>
        <div className="text-sm text-white/75 mb-3">
          タイプはラベルでしかありません。ここで「続けるもの / 手放すもの / 次の一歩」を言葉にして終えよう。
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">これからも続けたい自分の選び方</label>
            <input
              className="w-full rounded-xl px-3 py-2 bg-white/10 text-white placeholder:text-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              value={reflection.keep}
              onChange={(e) => setReflection((r) => ({ ...r, keep: e.target.value }))}
              placeholder="例：迷っても一度は自分で選んでみる"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">手放したい反応・思い込み</label>
            <input
              className="w-full rounded-xl px-3 py-2 bg-white/10 text-white placeholder:text-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              value={reflection.release}
              onChange={(e) => setReflection((r) => ({ ...r, release: e.target.value }))}
              placeholder="例：嫌われるかもで止まってしまう癖"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">48時間以内にやる小さな一歩</label>
            <input
              className="w-full rounded-xl px-3 py-2 bg-white/10 text-white placeholder:text-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              value={reflection.nextStep}
              onChange={(e) => setReflection((r) => ({ ...r, nextStep: e.target.value }))}
              placeholder="例：気になっていた人に連絡を1通送る"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
