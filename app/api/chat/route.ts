import { NextResponse } from "next/server";

type Turn = { role: "system" | "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Turn[] };

    const system: Turn = {
      role: "system",
      content: `
あなたは「物語診断AI」。
目的：ユーザーの人生を4章（幼稚園/小学校/中学校/高校）でたどり、各章で“選択（転機）”を1つ抽出して構造化する。
トーン：短文、安心、非ジャッジ。断定しすぎない（「〜の傾向」）。
進め方：
- 質問は一度に1〜2個まで
- 章の流れ：夢中だったこと→迷った出来事→二択に整形→（後で採点）→転機カード下書き→確認
- 詰まったら候補リストを出して助ける
      `.trim(),
    };

    const body = {
      model: "gpt-4.1-mini",
      messages: [system, ...messages],
      temperature: 0.4,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: t }, { status: 500 });
    }

    const json = await r.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}