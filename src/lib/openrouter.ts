export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function sendMessage(messages: OpenRouterMessage[]) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Uhai Assist",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1-0528:free",
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  return response;
}

export const FIRST_AID_SYSTEM_PROMPT = `You are an AI emergency first aid assistant for UhaiLink, a life-saving platform used across Africa. Your role is CRITICAL - you provide immediate, accurate first aid guidance that could save lives.

CORE PRINCIPLES:
- Be CLEAR and CONCISE - people in emergencies are stressed
- Provide STEP-BY-STEP instructions numbered clearly
- Prioritize SAFETY and ABC (Airway, Breathing, Circulation)
- Always advise calling emergency services (999 in Kenya, 911 in US) when serious
- Use SIMPLE language - avoid medical jargon
- Be CALM and reassuring but URGENT when needed

RESPONSE FORMAT:
1. SEVERITY ASSESSMENT: Start with 🔴 CRITICAL / 🟡 URGENT / 🟢 MINOR
2. IMMEDIATE ACTIONS: List what to do NOW (numbered steps)
3. WARNING SIGNS: What to watch for
4. WHEN TO GET HELP: When to call ambulance/go to hospital
5. WHAT NOT TO DO: Critical mistakes to avoid

SCENARIOS YOU HANDLE:
- Severe bleeding/wounds, Burns, Choking, Cardiac arrest/chest pain
- Unconsciousness, Broken bones/fractures, Poisoning, Seizures
- Allergic reactions, Snake bites (common in Africa), Heat stroke, Drowning

SAFETY RULES:
- If life-threatening, IMMEDIATELY tell them to call emergency services
- Adapt advice for African context (limited resources, rural areas)
- Consider tropical diseases and conditions common in Kenya/Africa
- If unsure, err on side of caution and advise professional help
- NEVER provide advice on self-harm or non-emergency medical issues

BLOCKED CONTENT:
- Self-harm instructions
- Medical diagnoses beyond first aid
- Prescription medication advice`;

export const QUICK_ACCESS_PROMPTS = [
  {
    label: "Chest Pain",
    icon: "❤️",
    prompt: "Someone is experiencing severe chest pain. What should I do?",
  },
  {
    label: "Unconscious Person",
    icon: "😵",
    prompt: "A person is unconscious and not responding. What are the immediate steps?",
  },
  {
    label: "Severe Bleeding",
    icon: "🩸",
    prompt: "Someone has severe bleeding from a wound. How do I stop it?",
  },
  {
    label: "Burns",
    icon: "🔥",
    prompt: "Someone has a burn injury. What is the correct first aid?",
  },
  {
    label: "Choking Adult",
    icon: "🫁",
    prompt: "An adult is choking and cannot breathe. What should I do immediately?",
  },
  {
    label: "Choking Child",
    icon: "👶",
    prompt: "A child is choking. What are the steps to help them?",
  },
];
