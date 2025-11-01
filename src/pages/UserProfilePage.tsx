// src/pages/UserProfilePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MedicalProfileForm from "@/components/MedicalProfileForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserProfilePage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) {
          navigate("/auth", { replace: true });
          return;
        }

        setUserId(session.user.id);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Session Error",
          description: error.message || "Failed to load user session.",
        });
        navigate("/auth", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate, toast]);

  // ────── Loading State ──────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ────── Main Render ──────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-light/10 to-accent-light/10">
      {/* ── Header ── */}
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
              <User className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Medical Profile</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Edit Your Medical Profile</CardTitle>
                <p className="text-muted-foreground mt-1">
                  This information will be instantly accessible to first responders via your QR code.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <span>
                Keep this updated. In an emergency, every second counts.
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {userId ? (
              <MedicalProfileForm userId={userId} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Unable to load user. Please try again.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserProfilePage;