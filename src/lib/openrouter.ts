// src/lib/openrouter.ts
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Sends messages to DeepSeek R1 via OpenRouter (free tier)
 * @param messages - Array of chat messages
 * @returns Streaming Response from OpenRouter
 */
export async function sendMessage(messages: OpenRouterMessage[]): Promise<Response> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_OPENROUTER_API_KEY is missing. Add it to your .env file.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "UhaiLink Emergency AI",
    },
    body: JSON.stringify({
      model: "anthropic/claude-2",
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 600,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenRouter API Error:", response.status, error);
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  return response;
}

/* ──────────────────────── LIFE-SAVING SYSTEM PROMPT ──────────────────────── */
export const FIRST_AID_SYSTEM_PROMPT = `You are UhaiLink AI — a life-saving emergency first aid assistant used across Kenya and Africa.

CRITICAL RULES:
- Be CLEAR, CALM, and URGENT
- Use SIMPLE language — no medical jargon
- STEP-BY-STEP instructions (numbered)
- Prioritize ABC: Airway, Breathing, Circulation
- ALWAYS say "CALL 999 or 112 NOW" in bold if life-threatening
- Adapt for African context: rural areas, limited resources
- Consider malaria, snake bites, heat stroke, road accidents

RESPONSE FORMAT:
1. SEVERITY: 🔴 CRITICAL | 🟡 URGENT | 🟢 MINOR
2. IMMEDIATE ACTIONS (numbered steps)
3. WARNING SIGNS to watch
4. WHEN TO CALL AMBULANCE
5. WHAT NOT TO DO

COMMON EMERGENCIES:
• Severe bleeding • Burns • Choking • Heart attack
• Unconscious • Broken bones • Poisoning • Seizures
• Allergic reaction • Snake bite • Heat stroke • Drowning

SAFETY:
- If in doubt → CALL 999/112
- NEVER diagnose or prescribe
- NEVER advise self-harm or delay help`;

/* ──────────────────────── QUICK ACCESS BUTTONS ──────────────────────── */
export const QUICK_ACCESS_PROMPTS = [
  {
    label: "Chest Pain",
    icon: "❤️",
    prompt: "Someone is having severe chest pain and shortness of breath. What should I do immediately?",
  },
  {
    label: "Unconscious",
    icon: "😵",
    prompt: "A person is unconscious and not responding. What are the first steps to take?",
  },
  {
    label: "Severe Bleeding",
    icon: "🩸",
    prompt: "Someone is bleeding heavily from a deep wound. How do I stop the bleeding?",
  },
  {
    label: "Burns",
    icon: "🔥",
    prompt: "Someone has a serious burn from fire or hot liquid. What is the correct first aid?",
  },
  {
    label: "Choking Adult",
    icon: "🫁",
    prompt: "An adult is choking and cannot speak or breathe. What should I do right now?",
  },
  {
    label: "Choking Child",
    icon: "👶",
    prompt: "A child is choking and cannot cry or breathe. What are the emergency steps?",
  },
  {
    label: "Snake Bite",
    icon: "🐍",
    prompt: "Someone was bitten by a snake in a rural area. What should I do before help arrives?",
  },
  {
    label: "Seizure",
    icon: "⚡",
    prompt: "A person is having a seizure and shaking uncontrollably. How do I keep them safe?",
  },
] as const;