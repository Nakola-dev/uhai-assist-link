import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Send,
  AlertCircle,
  Home,
  Volume2,
  X,
  Maximize2,
  Minimize2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface QuickPrompt {
  label: string;
  prompt: string;
  icon: string;
}

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────
const FIRST_AID_SYSTEM_PROMPT = `
You are Uhai Assist — an AI-powered first aid assistant for Kenya and Africa.
Provide clear, step-by-step, life-saving instructions in simple language.
Always start with: "CALL 999 IMMEDIATELY if the situation is life-threatening."
Use patient context if available.
Never give medical advice beyond first aid.
Block self-harm, drug dosage, or non-emergency requests.
`;

const QUICK_ACCESS_PROMPTS: QuickPrompt[] = [
  { label: "Chest Pain", prompt: "Someone is having severe chest pain and difficulty breathing", icon: "🤕" },
  { label: "Unconscious Person", prompt: "An adult is unconscious and not responding", icon: "😵" },
  { label: "Severe Bleeding", prompt: "Heavy bleeding from the arm that won't stop", icon: "🩸" },
  { label: "Burns", prompt: "Child has a burn from hot water on the hand", icon: "🔥" },
  { label: "Choking Adult", prompt: "An adult is choking and cannot speak or breathe", icon: "😷" },
  { label: "Choking Child", prompt: "A child is choking on food and cannot cry", icon: "👶" },
];

// ──────────────────────────────────────────────────────────────
// Reusable OpenRouter API Function
// ──────────────────────────────────────────────────────────────
export const sendMessage = async (messages: OpenRouterMessage[]) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
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
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  return response;
};

// ──────────────────────────────────────────────────────────────
// Offline Fallback Data (Cached Static Guides)
// ──────────────────────────────────────────────────────────────
const OFFLINE_GUIDES: Record<string, string> = {
  "severe bleeding": `
🩸 SEVERE BLEEDING - ACT NOW
1. CALL 999 IMMEDIATELY
2. Apply firm pressure with clean cloth
3. Elevate limb above heart
4. Do NOT remove cloth if soaked — add more on top
5. Keep pressure until help arrives
  `.trim(),
  choking: `
😷 CHOKING - ADULT
1. CALL 999
2. 5 back blows between shoulder blades
3. 5 abdominal thrusts (Heimlich)
4. Repeat until object is out or person collapses
  `.trim(),
  cpr: `
❤️ CPR - UNCONSCIOUS & NOT BREATHING
1. CALL 999
2. 30 chest compressions (100-120/min)
3. 2 rescue breaths
4. Continue until help arrives
  `.trim(),
};

// ──────────────────────────────────────────────────────────────
// Main Component: Assistant (Emergency Mode)
// ──────────────────────────────────────────────────────────────
const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────
  // Effects
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ──────────────────────────────────────────────────────────
  // Utilities
  // ──────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from("medical_profiles")
        .select("blood_type, allergies, chronic_conditions")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setUserProfile(data);
    }
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = "en-KE";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const showOfflineGuide = (query: string) => {
    const lower = query.toLowerCase();
    let guide = "";
    if (lower.includes("bleed")) guide = OFFLINE_GUIDES["severe bleeding"];
    else if (lower.includes("chok")) guide = OFFLINE_GUIDES["choking"];
    else if (lower.includes("cpr") || lower.includes("unconscious")) guide = OFFLINE_GUIDES["cpr"];
    else guide = "CALL 999 NOW. Stay calm. Help is on the way.";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "⚠️ OFFLINE MODE\n\n" + guide },
    ]);
    speakText(guide);
  };

  // ──────────────────────────────────────────────────────────
  // Message Handling
  // ──────────────────────────────────────────────────────────
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSendMessage(prompt), 100);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isStreaming) return;

    // Block harmful content
    const blocked = ["suicide", "kill", "harm", "overdose", "prescription", "dosage"];
    if (blocked.some((term) => messageToSend.toLowerCase().includes(term))) {
      toast({
        variant: "destructive",
        title: "Blocked",
        description: "This request is outside first aid scope.",
      });
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setIsStreaming(true);

    if (isOffline) {
      showOfflineGuide(messageToSend);
      setIsStreaming(false);
      return;
    }

    try {
      // Debug logging
      console.log('Starting message send...');
      
      const contextInfo = userProfile
        ? `\n\nPATIENT CONTEXT: Blood Type: ${userProfile.blood_type || "Unknown"}, Allergies: ${userProfile.allergies || "None"}, Conditions: ${userProfile.chronic_conditions || "None"}`
        : "";

      const openRouterMessages: OpenRouterMessage[] = [
        { role: "system", content: FIRST_AID_SYSTEM_PROMPT + contextInfo },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: messageToSend },
      ];

      // Debug: Log request details
      console.log('OpenRouter Request:', {
        apiKey: import.meta.env.VITE_OPENROUTER_API_KEY ? 'Present' : 'Missing',
        messageCount: openRouterMessages.length,
        lastMessage: messageToSend
      });

      const response = await sendMessage(openRouterMessages);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lineBreak: number;

        while ((lineBreak = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, lineBreak);
          buffer = buffer.slice(lineBreak + 1);

          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantMessage;
                return updated;
              });
            }
          } catch {
            continue;
          }
        }
      }

      if (assistantMessage) speakText(assistantMessage);
    } catch (error: any) {
      console.error('Assistant Error:', {
        message: error.message,
        error: error
      });
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Using offline guide. Check internet.",
      });
      showOfflineGuide(messageToSend);
    } finally {
      setIsStreaming(false);
      console.log('Message handling completed');
    }
  };

  const clearChat = () => {
    setMessages([]);
    stopSpeaking();
    toast({ title: "Chat cleared" });
  };

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────
  return (
    <div
      className={`${
        isFullscreen ? "fixed inset-0 z-50 bg-red-50" : "min-h-screen"
      } bg-gradient-to-br from-red-50 via-background to-orange-50 transition-all`}
    >
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-600 animate-pulse shadow-lg">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-red-700">
                Uhai Assist
                <Badge variant="destructive" className="text-xs animate-pulse">
                  LIVE
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">AI First Aid • DeepSeek R1</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hover:bg-red-100"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat} className="border-red-300">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
            {!isFullscreen && (
              <Button variant="outline" size="sm" onClick={() => navigate("/")} className="border-red-300">
                <Home className="h-4 w-4 mr-1" /> Home
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="container mx-auto px-4 pt-5 max-w-4xl">
          <Card className="border-red-600 bg-red-50 border-2 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-7 w-7 text-red-600 flex-shrink-0 mt-1 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <p className="font-bold text-lg text-red-800">EMERGENCY DISCLAIMER</p>
                  <p className="text-base">
                    This is <strong>AI-guided first aid only</strong>. In life-threatening situations,{" "}
                    <strong className="text-red-700">CALL 999 (Kenya), 911 (US), or local EMS IMMEDIATELY</strong>.
                    This tool <strong>does NOT replace</strong> professional medical care.
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowDisclaimer(false)}
                    className="font-bold"
                  >
                    I Understand — Proceed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-5">
        {/* SOS Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 text-white text-3xl font-bold shadow-2xl animate-pulse"
            onClick={() => handleSendMessage("EMERGENCY: I need help now")}
          >
            SOS
          </Button>
        </div>

        {/* Quick Access */}
        {messages.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {QUICK_ACCESS_PROMPTS.map((item, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 border-2 hover:border-red-500 hover:bg-red-50 transition-all text-lg font-medium"
                onClick={() => handleQuickPrompt(item.prompt)}
                disabled={isStreaming}
              >
                <span className="text-4xl">{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Chat Card */}
        <Card
          className={`${
            isFullscreen ? "h-[calc(100vh-280px)]" : "h-[60vh]"
          } flex flex-col border-2 border-red-200 shadow-2xl overflow-hidden`}
        >
          <CardHeader className="bg-red-50 border-b-2 border-red-200">
            <CardTitle className="text-xl font-bold text-red-800 flex justify-between items-center">
              <span>Emergency First Aid Chat</span>
              {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    isSpeaking
                      ? stopSpeaking()
                      : speakText(messages[messages.length - 1].content)
                  }
                  className="gap-2 text-red-700"
                >
                  <Volume2 className={`h-5 w-5 ${isSpeaking ? "animate-pulse" : ""}`} />
                  {isSpeaking ? "Stop" : "Speak"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto space-y-5 p-5">
              {messages.length === 0 && !showDisclaimer && (
                <div className="text-center py-16">
                  <Activity className="h-20 w-20 mx-auto mb-4 text-red-200" />
                  <h3 className="text-2xl font-bold text-red-700 mb-2">Ready When You Are</h3>
                  <p className="text-lg text-muted-foreground">Tap SOS or describe the emergency</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom duration-300`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-lg text-lg leading-relaxed ${
                      msg.role === "user"
                        ? "bg-red-600 text-white"
                        : "bg-white border-2 border-red-200 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex justify-start animate-in slide-in-from-bottom">
                  <div className="bg-white border-2 border-red-200 rounded-3xl px-6 py-4 shadow-lg">
                    <div className="flex gap-2 items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                      <span className="font-medium text-red-700">AI is responding...</span>
                    </div>
                  </div>
                </div>
              )}

              {isOffline && (
                <div className="flex justify-center">
                  <Badge variant="destructive" className="animate-pulse">
                    Offline Mode Active
                  </Badge>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t-2 border-red-200 p-5 bg-red-50">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Describe the emergency (e.g., 'Person collapsed and not breathing')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isStreaming}
                  rows={2}
                  className="resize-none text-lg border-2 border-red-300 focus:border-red-500"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isStreaming}
                  size="lg"
                  className="h-auto px-6 bg-red-600 hover:bg-red-700 shadow-lg text-white font-bold"
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Warning */}
        <Card className="bg-orange-50 border-orange-300">
          <CardContent className="py-4 text-center">
            <p className="text-sm font-semibold text-orange-800 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              This is first aid guidance only. Always call emergency services first.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Assistant;