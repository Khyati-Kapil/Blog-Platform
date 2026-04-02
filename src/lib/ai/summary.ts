import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = process.env.GOOGLE_AI_MODEL ?? "gemini-2.0-flash";

function summarizeLocally(body: string, wordTarget = 200) {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Summary pending.";
  const words = cleaned.split(" ");
  const snippet = words.slice(0, wordTarget).join(" ");
  return words.length > wordTarget ? `${snippet}…` : snippet;
}

export async function generatePostSummary(body: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return summarizeLocally(body);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const truncated = body.length > 50_000 ? body.slice(0, 50_000) : body;
  const prompt = `You are an editor. Write a plain-text summary of the following blog post in about 200 words (roughly 180–220 words). No markdown, no bullet list unless essential. Use an informative, neutral tone.\n\n---\n${truncated}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (text) return text;
  } catch {
    // Fall through to local summary when Gemini is unavailable/quota-limited.
  }

  return summarizeLocally(body);
}
