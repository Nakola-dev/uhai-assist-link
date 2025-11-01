// src/components/QRCodeDisplay.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Loader2, Copy, Printer } from "lucide-react";

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
        .eq("is_active", true)
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
      const newToken = crypto.randomUUID();
      const { error } = await supabase
        .from("qr_access_tokens")
        .update({ 
          access_token: newToken, 
          is_active: true,
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", userId);
      if (error) throw error;
      setToken(newToken);
      toast({ title: "Regenerated", description: "New QR code generated" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code") as HTMLElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const png = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "uhailink-qr.png";
      link.href = png;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/profile/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "Link copied to clipboard" });
  };

  const printQR = () => window.print();

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
          Print or wear this QR code. First responders scan it to access your medical profile instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center p-8 bg-white rounded-lg shadow-sm">
          <QRCodeSVG
            id="qr-code"
            value={qrUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button onClick={downloadQR} size="sm" className="w-full">
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
          <Button onClick={regenerateToken} variant="outline" size="sm" className="w-full">
            <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
          </Button>
          <Button onClick={copyUrl} variant="outline" size="sm" className="w-full">
            <Copy className="h-4 w-4 mr-1" /> Copy Link
          </Button>
          <Button onClick={printQR} variant="outline" size="sm" className="w-full">
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-sm text-yellow-900 mb-1">Security Note</h4>
          <p className="text-xs text-yellow-700">
            Anyone who scans this QR can view your medical info. Only share with trusted people or wear for emergencies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;