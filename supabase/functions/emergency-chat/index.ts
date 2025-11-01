// functions/emergency-chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    console.log("Emergency chat request received:", messages);

    // ────── GET API KEY FROM ENV ──────
    const OPENROUTER_API_KEY = Deno.env.get("VITE_OPENROUTER_API_KEY");

    if (!OPENROUTER_API_KEY) {
      throw new Error("VITE_OPENROUTER_API_KEY is not configured");
    }

    // ────── SYSTEM PROMPT (LIFE-SAVING AI) ──────
    const systemPrompt = `You are UhaiLink AI — a life-saving emergency first aid assistant used across Kenya and Africa.

CRITICAL RULES:
- Be CLEAR, CALM, and URGENT
- Use SIMPLE language — no jargon
- STEP-BY-STEP instructions
- Prioritize ABC: Airway, Breathing, Circulation
- ALWAYS advise calling 999 or 112 if serious
- Adapt for African context: rural areas, limited resources
- Start with severity: 🔴 CRITICAL | 🟡 URGENT | 🟢 MINOR

RESPONSE FORMAT:
1. Severity assessment
2. Immediate actions (numbered)
3. Warning signs to watch
4. When to call ambulance
5. What NOT to do

COMMON EMERGENCIES:
• Severe bleeding • Burns • Choking • Heart attack
• Unconscious • Broken bones • Poisoning • Seizures
• Allergic reaction • Snake bite • Heat stroke • Drowning

If life-threatening: IMMEDIATELY say "CALL 999 or 112 NOW" in bold.`;

    // ────── CALL DEEPSEEK R1 via OpenRouter ──────
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://uhailink.co.ke",
        "X-Title": "UhaiLink Emergency AI",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    // ────── HANDLE ERRORS ──────
    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in 30 seconds." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      throw new Error("AI service failed");
    }

    // ────── STREAM RESPONSE ──────
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Emergency chat error:", error);

    // ────── FALLBACK MESSAGE (LIFE-SAVING) ──────
    return new Response(
      JSON.stringify({
        error: "AI is temporarily down. CALL 999 or 112 IMMEDIATELY for help.",
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});