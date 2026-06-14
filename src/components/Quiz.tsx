"use client";

import { useEffect, useMemo, useState } from "react";
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

  // 表紙に着いた瞬間、到達を1回だけ記録する
  useEffect(() => {
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utm_content: getUtmContent() }),
    }).catch(() => {});
  }, []);

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

      <h2 className="mt-4 animate-fadeUp font-display text-2xl font-bold leading-snug text-ink sm:text-3xl
