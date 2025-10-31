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
  Loader2
} from "lucide-react";
import { sendMessage, FIRST_AID_SYSTEM_PROMPT, QUICK_ACCESS_PROMPTS, OpenRouterMessage } from "@/lib/openrouter";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("medical_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setUserProfile(profile);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSendMessage(prompt), 100);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setIsStreaming(true);

    try {
      const contextInfo = userProfile ?
        `\n\nPATIENT CONTEXT: Blood Type: ${userProfile.blood_type || 'Unknown'}, Allergies: ${userProfile.allergies || 'None reported'}, Chronic Conditions: ${userProfile.chronic_conditions || 'None reported'}`
        : '';

      const openRouterMessages: OpenRouterMessage[] = [
        { role: "system", content: FIRST_AID_SYSTEM_PROMPT + contextInfo },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: messageToSend }
      ];

      const response = await sendMessage(openRouterMessages);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantMessage) {
        speakText(assistantMessage);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to reach AI assistant. Check your internet connection.",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    stopSpeaking();
    toast({ title: "Chat cleared" });
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-br from-destructive/10 via-background to-accent-light/10`}>
      <header className="border-b bg-card/95 backdrop-blur-lg sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive animate-pulse shadow-emergency">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Emergency AI Assistant
                <Badge variant="destructive" className="text-xs">LIVE</Badge>
              </h1>
              <p className="text-xs text-muted-foreground">Powered by DeepSeek AI</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            {!isFullscreen && (
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            )}
          </div>
        </div>
      </header>

      {showDisclaimer && (
        <div className="container mx-auto px-4 pt-4 max-w-4xl">
          <Card className="border-destructive bg-destructive/5 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <p className="font-bold text-sm text-destructive">EMERGENCY DISCLAIMER</p>
                  <p className="text-sm">
                    This is AI-guided first aid only. In life-threatening situations, <span className="font-bold">CALL 999 (Kenya), 911 (US), or your local emergency services IMMEDIATELY</span>. This tool does NOT replace professional medical care.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDisclaimer(false)}
                    className="mt-2"
                  >
                    I Understand
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-4">
        {messages.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {QUICK_ACCESS_PROMPTS.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:border-destructive hover:bg-destructive/5 transition-all"
                onClick={() => handleQuickPrompt(prompt.prompt)}
                disabled={isStreaming}
              >
                <span className="text-3xl">{prompt.icon}</span>
                <span className="text-sm font-semibold text-center">{prompt.label}</span>
              </Button>
            ))}
          </div>
        )}

        <Card className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[65vh]'} flex flex-col shadow-emergency border-2`}>
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Emergency Chat</span>
              {messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(messages[messages.length - 1].content)}
                  className="gap-2"
                >
                  <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse text-primary' : ''}`} />
                  {isSpeaking ? "Stop" : "Speak"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.length === 0 && !showDisclaimer && (
                <div className="text-center text-muted-foreground py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-destructive/30" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Assist</h3>
                  <p className="text-sm">Select a quick action above or describe your emergency below</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2">
                  <div className="max-w-[85%] rounded-2xl px-5 py-3 bg-muted border border-border shadow-md">
                    <div className="flex gap-2 items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">AI is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 bg-muted/20">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Describe the emergency situation (e.g., 'Person collapsed', 'Heavy bleeding')"
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
                  className="resize-none text-base"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isStreaming}
                  size="lg"
                  className="h-auto px-6 bg-destructive hover:bg-destructive/90 shadow-emergency"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent-light/20 border-accent">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p>This AI assistant provides guidance only. Always prioritize calling professional emergency services.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Assistant;
