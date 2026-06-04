import { QUESTIONS, type Macro, type Question } from "./questions";

export type Scores = Record<Macro, number>;

export type ScoreResult = {
  scores: Scores;
  type: Macro; // dominant (over-consumed) macro
  // relative share (0-100) of each macro, for the tendency bars
  share: Record<Macro, number>;
};

// answers: map of questionId -> selected option index
export function score(answers: Record<string, number>): ScoreResult {
  const scores: Scores = { P: 0, F: 0, C: 0 };
  let strictChosen = false;

  for (const q of QUESTIONS) {
    const idx = answers[q.id];
    if (idx === undefined) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    if (opt.strict) strictChosen = true;
    (Object.keys(opt.add) as Macro[]).forEach((m) => {
      scores[m] += opt.add[m] ?? 0;
    });
  }

  const total = scores.P + scores.F + scores.C || 1;
  const share: Record<Macro, number> = {
    P: Math.round((scores.P / total) * 100),
    F: Math.round((scores.F / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };

  const type = pickType(scores, strictChosen);
  return { scores, type, share };
}

// Tie-break priority for this audience: C > F > P.
// Exception: a strict carb-restricter who ties P with C lands in P (頑張りすぎ型).
function pickType(scores: Scores, strict: boolean): Macro {
  const max = Math.max(scores.P, scores.F, scores.C);
  const top = (["C", "F", "P"] as Macro[]).filter((m) => scores[m] === max);
  if (top.length === 1) return top[0];
  if (strict && top.includes("P")) return "P";
  return top[0]; // C > F > P order
}

export function isComplete(
  answers: Record<string, number>,
  questions: Question[] = QUESTIONS
): boolean {
  return questions.every((q) => answers[q.id] !== undefined);
}
