import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Loader2 } from "lucide-react";

interface QRCodeDisplayProps {
  userId: string;
}

const QRCodeDisplay = ({ userId }: QRCodeDisplayProps) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchToken();
  }, [userId]);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("qr_access_tokens")
        .select("access_token")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setToken(data.access_token);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const regenerateToken = async () => {
    try {
      const { error } = await supabase
        .from("qr_access_tokens")
        .update({ access_token: crypto.randomUUID(), updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;
      toast({ title: "Success", description: "QR code regenerated" });
      fetchToken();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "uhailink-qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const qrUrl = `${window.location.origin}/profile/${token}`;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Your Emergency QR Code
        </CardTitle>
        <CardDescription>
          Print this QR code and wear it as a wristband or keep it in your wallet. First responders can scan it to access your medical information instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center p-8 bg-white rounded-lg">
          <QRCodeSVG
            id="qr-code"
            value={qrUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <Button onClick={downloadQR} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
          <Button onClick={regenerateToken} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>

        <div className="p-4 bg-accent-light rounded-lg border border-accent/20">
          <h4 className="font-semibold mb-2 text-sm">⚠️ Important Security Note</h4>
          <p className="text-sm text-muted-foreground">
            Anyone with access to this QR code can view your medical information. Only share it with trusted individuals or wear it for emergency purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
