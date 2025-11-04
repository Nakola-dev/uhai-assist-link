// src/pages/UserQRPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, QrCode, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserQRPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  /* --------------------------------------------------------------
   * 1. Auth + Session + Token Setup
   * ------------------------------------------------------------ */
  useEffect(() => {
    const init = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please sign in again.",
        });
        navigate("/auth", { replace: true });
        return;
      }

      setUserId(session.user.id);
      await ensureToken(session.user.id);
    };

    init();

    // Listen for auth changes (e.g., sign-out in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth", { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  /* --------------------------------------------------------------
   * 2. Ensure Token Exists (create if missing)
   * ------------------------------------------------------------ */
  const ensureToken = async (uid: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("qr_access_tokens")
        .select("access_token")
        .eq("user_id", uid)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.access_token) {
        setToken(data.access_token);
      } else {
        const newToken = crypto.randomUUID();
        const { error: insErr } = await supabase
          .from("qr_access_tokens")
          .insert({
            user_id: uid,
            access_token: newToken,
            is_active: true,
          });

        if (insErr) throw insErr;
        setToken(newToken);
      }
    } catch (err: any) {
      console.error("Token fetch/create error:", err);
      toast({
        variant: "destructive",
        title: "QR Token Error",
        description: err.message || "Failed to load QR code.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------------
   * 3. Regenerate Token
   * ------------------------------------------------------------ */
  const handleRegenerate = async () => {
    if (!userId) return;

    setRegenerating(true);
    try {
      const newToken = crypto.randomUUID();

      const { error } = await supabase
        .from("qr_access_tokens")
        .update({
          access_token: newToken,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      setToken(newToken);
      toast({
        title: "Success",
        description: "QR code regenerated successfully",
      });
    } catch (err: any) {
      console.error("Regenerate error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to regenerate QR code.",
      });
    } finally {
      setRegenerating(false);
    }
  };

  /* --------------------------------------------------------------
   * 4. Loading UI
   * ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
        <div className="flex items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-lg font-medium">Generating your QR code...</span>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------
   * 5. Main Render
   * ------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/user")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">My QR Code</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Emergency QR Code</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Print or wear this code – first responders can scan it to view your medical profile instantly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <span>
                <strong>Security Tip:</strong> Regenerate your QR code if you suspect it has been compromised.
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {regenerating ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Regenerating QR code...</p>
              </div>
            ) : (
              <QRCodeDisplay token={token} onRegenerate={handleRegenerate} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserQRPage;