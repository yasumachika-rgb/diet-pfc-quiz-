import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const { answers, scores, type, utm_content } = (payload ?? {}) as {
    answers?: Record<string, number>;
    scores?: Record<string, number>;
    type?: string;
    utm_content?: string;
  };

  if (!answers || !type) {
    return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await supabase
    .from("quiz_results")
    .insert({ answers, scores, type, utm_content: utm_content ?? null });

  if (error) {
    console.error("supabase insert error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
