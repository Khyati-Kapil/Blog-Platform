import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = process.env.GOOGLE_AI_MODEL ?? "gemini-2.0-flash";

export async function generatePostSummary(body: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const truncated = body.length > 50_000 ? body.slice(0, 50_000) : body;
  const prompt = `You are an editor. Write a plain-text summary of the following blog post in about 200 words (roughly 180–220 words). No markdown, no bullet list unless essential. Use an informative, neutral tone.\n\n---\n${truncated}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text;
}
