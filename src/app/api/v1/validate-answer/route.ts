import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ValidateBody {
  prompt: string;
  code?: string;
  acceptedAnswers: string[];
  userAnswer: string;
}

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ correct: false });
  }

  let body: ValidateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ correct: false });
  }

  if (!body.prompt || !body.userAnswer || !body.acceptedAnswers?.length) {
    return NextResponse.json({ correct: false });
  }

  const systemPrompt = `You are a strict programming answer validator. A quiz asked the user to predict the output of code or answer a technical question. The accepted answers are provided. The user gave a different answer. Determine if the user's answer is semantically equivalent to one of the accepted answers.

Rules:
- Compare meaning, not exact formatting. Whitespace differences, quotes vs no quotes, trailing newlines, and minor formatting variations should be accepted.
- For code output questions, the answer must produce the same observable result.
- "True" and "true" are equivalent. "False" and "false" are equivalent.
- If the user's answer conveys the same value/result as an accepted answer, respond YES.
- If the user's answer is wrong or materially different, respond NO.
- Respond with ONLY "YES" or "NO", nothing else.`;

  const userMessage = `Question: ${body.prompt}
${body.code ? `Code:\n${body.code}\n` : ""}
Accepted answers: ${body.acceptedAnswers.map((a) => `"${a}"`).join(", ")}
User's answer: "${body.userAnswer}"

Is the user's answer correct?`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 3,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ correct: false });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim()?.toUpperCase();

    return NextResponse.json({ correct: answer === "YES" });
  } catch {
    return NextResponse.json({ correct: false });
  }
}
