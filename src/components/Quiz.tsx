"use client";

import { useMemo, useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import { score, type ScoreResult } from "@/lib/scoring";
import { RESULTS, BRIDGE, MACRO_LABEL } from "@/lib/results";

type Stage = "intro" | "quiz" | "result";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL ?? "https://line.me/";

const DEEP = "#6B53B8";
const ON_ACCENT = "#3D3357";

/* ===== ブランド表記（ここを編集すれば全ページに反映） ===== */
const TITLE_BLACK = "Diet"; // タイトル前半（黒）
const TITLE_ACCENT = "Type Check"; // タイトル後半（指し色）
const KICKER = "PERSONAL DIET ANALYSIS"; // タイトル下の英字
const COMPANY = "andme Inc."; // フッターの会社名

/* ===== グラフの色（マクロ別） ===== */
const MACRO_COLOR: Record<"P" | "F" | "C", string> = {
  C: "#97BA8D", // 炭水化物
  F: "#F5CB72", // 脂質
  P: "#F69DA6", // たんぱく質
};
const BAR_ORDER = ["P", "F", "C"] as const; // たんぱく質→脂質→炭水化物

/* ===== 広告の印（utm_content）をURLから読み取る ===== */
function getUtmContent(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("utm_content");
}

export default function Quiz() {
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];

  function choose(optIdx: number) {
    const next = { ...answers, [q.id]: optIdx };
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      const r = score(next);
      setResult(r);
      setStage("result");
      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: next,
          scores: r.scores,
          type: r.type,
          utm_content: getUtmContent(),
        }),
      }).catch(() => {});
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }
  function restart() {
    setAnswers({});
    setStep(0);
    setResult(null);
    setStage("intro");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-8 sm:py-10">
      <BrandHeader />

      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_4px_30px_rgba(90,80,130,0.08)]">
        <div className="px-6 py-9 sm:px-9 sm:py-11">
          {stage === "intro" && <Intro onStart={() => setStage("quiz")} />}
          {stage === "quiz" && (
            <QuizStep
              key={q.id}
              step={step}
              total={total}
              question={q}
              selected={answers[q.id]}
              onChoose={choose}
              onBack={back}
            />
          )}
          {stage === "result" && result && (
            <Result result={result} onRestart={restart} />
          )}
        </div>
        <div className="h-1.5 w-full bg-accent" />
      </div>

      <BrandFooter />
    </main>
  );
}

/* ---------------- Header (全ページ共通) ---------------- */
function BrandHeader() {
  return (
    <header className="mb-7 flex flex-col items-center text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: DEEP }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" aria-hidden="true">
          <path d="M12 2c.45 4 2.55 6.1 6 6.5-3.45.4-5.55 2.5-6 6.5-.45-4-2.55-6.1-6-6.5 3.45-.4 5.55-2.5 6-6.5z" />
        </svg>
      </div>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {TITLE_BLACK}{" "}
        <span style={{ color: DEEP }}>{TITLE_ACCENT}</span>
      </h1>
      <p className="mt-1.5 font-sans text-[11px] tracking-[0.25em] text-muted">
        {KICKER}
      </p>
    </header>
  );
}

/* ---------------- Footer (全ページ共通) ---------------- */
function BrandFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 flex flex-col items-center text-center">
      <p className="font-sans text-[10px] tracking-[0.3em] text-muted">
        PRODUCED BY
      </p>
      <p className="mt-1 font-display text-base font-bold text-ink">{COMPANY}</p>
      <p className="mt-3 max-w-xs font-sans text-[11px] leading-relaxed text-muted">
        ※本診断はおおよその傾向を知るための簡易チェックであり、医学的な診断ではありません。
      </p>
      <p className="mt-2 font-sans text-[11px] text-muted">
        © {year} {COMPANY}
      </p>
    </footer>
  );
}

/* ---------------- Intro ---------------- */
function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="animate-fadeUp rounded-full bg-accentSoft px-3.5 py-1 font-sans text-[11px] font-bold tracking-[0.18em] text-accentDeep">
        DIET TYPE CHECK
      </span>
      <p className="mt-4 animate-fadeUp font-sans text-[11px] tracking-[0.25em] text-muted [animation-delay:60ms]">
        PRESENTED BY {COMPANY.toUpperCase()}
      </p>

      <h2 className="mt-4 animate-fadeUp font-display text-2xl font-bold leading-snug text-ink sm:text-3xl [animation-delay:120ms]">
        あなたに合う痩せ方は、
        <br />
        <span style={{ color: DEEP }}>3つのタイプ</span>でわかる。
      </h2>

      <p className="mt-5 animate-fadeUp font-sans text-[15px] leading-relaxed text-ink/75 [animation-delay:180ms]">
        10問・約60秒。タップで答えるだけ。
        <br />
        ダイエットがうまくいかなかった
        <span className="font-medium text-ink">本当の理由</span>
        が、PFC（たんぱく質・脂質・炭水化物）の傾向から見えてきます。
      </p>

      <div className="mt-9 w-full animate-fadeUp [animation-delay:210ms]">
        <p className="mb-3 text-center font-sans text-xs tracking-wide text-muted">
          あなたはどのタイプ？
        </p>
        <img
          src="/types-hero.png"
          alt="3つの痩せ方タイプ"
          className="w-full rounded-2xl"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <button
        onClick={onStart}
        className="mt-9 inline-flex animate-fadeUp items-center gap-2 rounded-full px-8 py-4 font-sans text-base font-bold text-white shadow-lg shadow-accentDeep/20 transition hover:opacity-90 active:scale-[0.98] [animation-delay:240ms]"
        style={{ backgroundColor: DEEP }}
      >
        診断をはじめる
        <span aria-hidden="true">→</span>
      </button>
      <p className="mt-4 animate-fadeUp font-sans text-xs text-muted [animation-delay:300ms]">
        ※ 登録などは不要です。結果はその場で表示されます。
      </p>
    </div>
  );
}

/* ---------------- Question ---------------- */
function QuizStep({
  step,
  total,
  question,
  selected,
  onChoose,
  onBack,
}: {
  step: number;
  total: number;
  question: (typeof QUESTIONS)[number];
  selected: number | undefined;
  onChoose: (i: number) => void;
  onBack: () => void;
}) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="flex flex-col">
      <div className="mb-7">
        <div className="mb-2 flex items-center justify-between font-sans text-xs text-muted">
          <button
            onClick={onBack}
            disabled={step === 0}
            className="transition disabled:opacity-0"
          >
            ← 戻る
          </button>
          <span>
            質問 {step + 1} <span className="text-line">/</span> {total}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <h2
        key={question.id}
        className="animate-fadeUp font-display text-xl font-bold leading-relaxed text-ink sm:text-2xl"
      >
        {question.text}
      </h2>

      <div className="mt-7 flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const active = selected === i;
          return (
            <button
              key={i}
              onClick={() => onChoose(i)}
              className={[
                "animate-fadeUp rounded-2xl border px-5 py-4 text-left font-sans text-[15px] leading-relaxed transition active:scale-[0.99]",
                active
                  ? "border-accent bg-accent"
                  : "border-line bg-white text-ink hover:border-accent/60 hover:bg-accentSoft",
              ].join(" ")}
              style={active ? { color: ON_ACCENT } : undefined}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Result ---------------- */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-4 w-1.5 rounded-full bg-accent" />
      <h3 className="font-display text-lg font-bold text-ink">{children}</h3>
    </div>
  );
}

function Result({
  result,
  onRestart,
}: {
  result: ScoreResult;
  onRestart: () => void;
}) {
  const r = RESULTS[result.type];
  const imgSrc = `/type-${r.type.toLowerCase()}.png`;
  const bars = useMemo(
    () =>
      BAR_ORDER.map((m) => ({
        m,
        label: MACRO_LABEL[m],
        share: result.share[m],
        dominant: m === result.type,
      })),
    [result]
  );

  return (
    <div className="flex flex-col">
      <p className="animate-fadeUp font-sans text-sm tracking-widest text-accentDeep">
        あなたのタイプは
      </p>
      <h1 className="mt-2 animate-fadeUp font-display text-3xl font-bold leading-snug text-ink sm:text-4xl [animation-delay:80ms]">
        {r.label}
      </h1>

      <img
        src={imgSrc}
        alt={r.label}
        className="mx-auto mt-6 w-full max-w-xs animate-fadeUp rounded-2xl [animation-delay:120ms]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />

      <p className="mt-5 animate-fadeUp font-sans text-xs tracking-wide text-muted [animation-delay:160ms]">
        あなたの傾向（PFCの偏り）
      </p>

      {/* tendency bars */}
      <div className="mt-3 animate-fadeUp rounded-2xl border border-line bg-white p-5 [animation-delay:200ms]">
        <div className="flex flex-col gap-3.5">
          {bars.map((b) => (
            <div key={b.m} className="flex items-center gap-3">
              <span className="w-16 shrink-0 font-sans text-sm text-ink">
                {b.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F0F0F2]">
                <div
                  className="h-full origin-left rounded-full"
                  style={{
                    width: `${Math.max(b.share, 4)}%`,
                    backgroundColor: MACRO_COLOR[b.m],
                    animation: "grow 0.8s cubic-bezier(0.22,1,0.36,1) both",
                  }}
                />
              </div>
              {b.dominant && (
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 font-sans text-xs font-bold text-white"
                  style={{ backgroundColor: DEEP }}
                >
                  多め
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 font-sans text-[11px] leading-relaxed text-muted">
          ※ これはおおよその傾向です。正確な数値ではありません。
        </p>
      </div>

      {/* 解説セクション */}
      <section className="mt-9 animate-fadeUp [animation-delay:260ms]">
        <SectionHeading>タイプの特徴</SectionHeading>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink/90">
          {r.features}
        </p>
      </section>

      <section className="mt-8 animate-fadeUp [animation-delay:300ms]">
        <SectionHeading>なぜ痩せにくくなるのか</SectionHeading>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink/90">
          {r.whyHard}
        </p>
      </section>

      <section className="mt-8 animate-fadeUp [animation-delay:340ms]">
        <SectionHeading>痩せるためのチェックポイント7</SectionHeading>
        <ol className="mt-4 flex flex-col gap-3">
          {r.checkpoints.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold"
                style={{ backgroundColor: "#F4F0FF", color: DEEP }}
              >
                {i + 1}
              </span>
              <span className="font-sans text-[15px] leading-relaxed text-ink/90">
                {c}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 animate-fadeUp rounded-2xl bg-accentSoft p-5 [animation-delay:380ms]">
        <SectionHeading>あなたへのメッセージ</SectionHeading>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink/90">
          {r.message}
        </p>
      </section>

      {/* bridge + CTA */}
      <div className="mt-9 animate-fadeUp rounded-3xl border border-accent/40 bg-accentSoft p-6 [animation-delay:420ms]">
        <p className="font-sans text-[15px] leading-relaxed text-ink">{BRIDGE}</p>

        <img
          src="/sample_report.png"
          alt="3日間レポートのサンプル"
          className="mt-5 w-full rounded-xl border border-line"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        </a>

        
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block rounded-full px-6 py-4 text-center font-sans text-base font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: DEEP }}
        >
          3日間の食事アドバイス体験を受ける
        </a>
        <p className="mt-3 text-center font-sans text-xs text-ink/60">
          あなた専用のカロリー＆PFCレポートを無料でお返しします
        </p>
      </div>

      <button
        onClick={onRestart}
        className="mx-auto mt-8 font-sans text-sm text-muted underline-offset-4 transition hover:underline"
      >
        もう一度診断する
      </button>
    </div>
  );
}
