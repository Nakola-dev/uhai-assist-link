import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    console.log('Emergency chat request received');

    return new Response(
      JSON.stringify({
        error: 'AI Emergency Chat is currently unavailable. Please call emergency services at 999 or 112 for immediate assistance.'
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

    /* LOVABLE API Integration temporarily disabled
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an AI emergency first aid assistant for UhaiLink, a life-saving platform used across Africa. Your role is CRITICAL - you provide immediate, accurate first aid guidance that could save lives.

CORE PRINCIPLES:
- Be CLEAR and CONCISE - people in emergencies are stressed
- Provide STEP-BY-STEP instructions
- Prioritize SAFETY and ABC (Airway, Breathing, Circulation)
- Always advise calling emergency services when serious
- Use SIMPLE language - avoid medical jargon
- Be CALM and reassuring but URGENT when needed

RESPONSE FORMAT:
1. Assess the situation quickly
2. Provide immediate action steps (numbered)
3. Explain what to watch for (warning signs)
4. When to call ambulance/go to hospital
5. What NOT to do

EXAMPLE SCENARIOS YOU HANDLE:
- Severe bleeding/wounds
- Burns
- Choking
- Cardiac arrest/chest pain
- Unconsciousness
- Broken bones/fractures
- Poisoning
- Seizures
- Allergic reactions
- Snake bites (common in Africa)
- Heat stroke
- Drowning

IMPORTANT: 
- If life-threatening, IMMEDIATELY tell them to call emergency services
- Adapt advice for African context (limited resources, rural areas)
- Consider tropical diseases and conditions common in Kenya/Africa
- If unsure, err on side of caution and advise professional help

Start every response with severity assessment: 🔴 CRITICAL, 🟡 URGENT, or 🟢 MINOR`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
    */

  } catch (error) {
    console.error('Emergency chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
