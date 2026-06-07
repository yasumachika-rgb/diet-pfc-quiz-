"use client";

import { useMemo, useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import { score, type ScoreResult } from "@/lib/scoring";
import { RESULTS, BRIDGE, MACRO_LABEL } from "@/lib/results";

type Stage = "intro" | "quiz" | "result";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL ?? "https://line.me/";
const SAMPLE_URL = process.env.NEXT_PUBLIC_SAMPLE_REPORT_URL ?? "";

const ON_ACCENT = "#3D3357";
const DEEP = "#6B53B8";

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
        body: JSON.stringify({ answers: next, scores: r.scores, type: r.type }),
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
    <main className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8 sm:py-12">
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
    </main>
  );
}

/* ---------------- Intro ---------------- */
function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className="animate-fadeUp font-sans text-sm tracking-widest text-accentDeep">
        DIET TYPE CHECK
      </p>
      <h1 className="animate-fadeUp font-display text-3xl font-bold leading-snug text-ink sm:text-4xl [animation-delay:80ms]">
        あなたに合う
        <br />
        <span className="relative inline-block">
          <span className="relative z-10">痩せ方</span>
          <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-accent/70" />
        </span>
        診断
      </h1>
      <p className="mt-6 animate-fadeUp font-sans text-base leading-relaxed text-ink/80 [animation-delay:160ms]">
        10問・約60秒。タップで答えるだけ。
        <br />
        ダイエットがうまくいかなかった
        <span className="font-medium text-ink">本当の理由</span>
        が、PFC（たんぱく質・脂質・糖質）の傾向から見えてきます。
      </p>

      <button
        onClick={onStart}
        className="mt-10 animate-fadeUp rounded-full bg-accent px-8 py-4 font-sans text-base font-bold shadow-lg shadow-accent/30 transition hover:bg-[#C2ABFB] active:scale-[0.98] [animation-delay:240ms]"
        style={{ color: ON_ACCENT }}
      >
        診断をはじめる
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
    <div className="flex flex-1 flex-col">
      <div className="mb-8">
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
        className="animate-fadeUp font-display text-xl font-semibold leading-relaxed text-ink sm:text-2xl"
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
      <span
        className="h-4 w-1.5 rounded-full"
        style={{ backgroundColor: "#D0BDFF" }}
      />
      <h3 className="font-display text-lg font-semibold text-ink">{children}</h3>
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
      (["C", "F", "P"] as const).map((m) => ({
        m,
        label: MACRO_LABEL[m],
        share: result.share[m],
        dominant: m === result.type,
      })),
    [result]
  );

  return (
    <div className="flex flex-1 flex-col">
      <p className="animate-fadeUp font-sans text-sm tracking-widest text-accentDeep">
        あなたのタイプは
      </p>
      <h1 className="mt-2 animate-fadeUp font-display text-3xl font-bold leading-snug text-ink sm:text-4xl [animation-delay:80ms]">
        {r.label}
      </h1>

      {/* illustration (上のほう) — user supplies /public/type-c.png 等。無ければ自動で非表示 */}
      <img
        src={imgSrc}
        alt={r.label}
        className="mx-auto mt-6 w-full max-w-xs animate-fadeUp rounded-2xl [animation-delay:120ms]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />

      <p className="mt-5 animate-fadeUp font-display text-lg text-ink/80 [animation-delay:160ms]">
        {r.catch}
      </p>

      {/* tendency bars */}
      <div className="mt-7 animate-fadeUp rounded-2xl border border-line bg-white p-5 [animation-delay:200ms]">
        <p className="mb-4 font-sans text-xs tracking-wide text-muted">
          あなたの傾向（PFCの偏り）
        </p>
        <div className="flex flex-col gap-3.5">
          {bars.map((b) => (
            <div key={b.m} className="flex items-center gap-3">
              <span className="w-16 shrink-0 font-sans text-sm text-ink">
                {b.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-accentSoft">
                <div
                  className="h-full origin-left rounded-full"
                  style={{
                    width: `${Math.max(b.share, 4)}%`,
                    backgroundColor: b.dominant ? r.accent : "#E2E0E8",
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

      {/* ── 解説セクション ── */}
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

        {SAMPLE_URL && (
          <img
            src={SAMPLE_URL}
            alt="3日間レポートのサンプル"
            className="mt-5 w-full rounded-xl border border-line"
          />
        )}

        <a
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
