import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt;
    const result = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-4-maverick-17b-128e-instruct",
        messages: [
          {
            role: "system",
            content: "Отвечай на все вопросы максимум в 5 словах",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        logprobs: true,
        temperature: 0.5,
        top_logprobs: 3,
      }),
    });

    const response = await result.json();
    return NextResponse.json({ response });
  } catch (err) {
    console.error("Cerebras error:", err);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
