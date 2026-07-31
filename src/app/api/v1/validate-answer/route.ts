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

  const systemPrompt = `You are a programming answer validator for a developer quiz app. A quiz asked the user to predict the output of code or answer a technical question. The accepted answers are provided. The user gave a different answer. Determine if the user's answer is correct.

Rules:
- Compare meaning, not exact formatting. Whitespace differences, quotes vs no quotes, trailing newlines, and minor formatting variations should be accepted.
- For code output questions, the answer must produce the same observable result.
- For conceptual or descriptive questions, accept any answer that conveys the same core idea as an accepted answer, even if worded differently or less precisely.
- "True" and "true" are equivalent. "False" and "false" are equivalent.
- Accept synonyms, rephrasings, and different levels of specificity as long as the answer is technically correct and conveys the same meaning.
- When in doubt, lean towards accepting the answer if the user clearly demonstrates understanding of the concept.
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
