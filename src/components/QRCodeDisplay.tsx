// src/components/QRCodeDisplay.tsx
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, Copy, Printer, Loader2 } from "lucide-react";

interface QRCodeDisplayProps {
  token: string;
  onRegenerate: () => void;
}

const QRCodeDisplay = ({ token, onRegenerate }: QRCodeDisplayProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // ────── Construct Public Profile URL ──────
  const qrUrl = `${window.location.origin}/profile/${token}`;

  // ────── Download QR as PNG ──────
  const downloadQR = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const svg = document.getElementById("qr-code") as HTMLElement;
      if (!svg) throw new Error("QR code not found");

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const png = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.download = `uhailink-qr-${token.slice(0, 8)}.png`;
        link.href = png;
        link.click();

        toast({
          title: "Downloaded!",
          description: "QR code saved to your device.",
        });
      };

      img.onerror = () => {
        throw new Error("Failed to load QR image");
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err: any) {
      console.error("Download error:", err);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: err.message || "Could not download QR code.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // ────── Copy Public Link ──────
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast({
        title: "Copied!",
        description: "Emergency profile link copied to clipboard.",
      });
    } catch (err) {
      console.error("Copy failed:", err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy link.",
      });
    }
  };

  // ────── Print QR Code ──────
  const printQR = () => {
    if (isPrinting) return;
    setIsPrinting(true);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Print Blocked",
        description: "Popup blocker prevented printing.",
      });
      setIsPrinting(false);
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>UhaiLink QR Code</title>
          <style>
            @page { margin: 0.5in; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              background: #f9fafb;
            }
            .container {
              text-align: center;
              background: white;
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            h1 { font-size: 1.5rem; margin-bottom: 1rem; color: #1f2937; }
            p { color: #6b7280; margin-bottom: 1.5rem; font-size: 0.95rem; }
            .qr { margin: 1.5rem 0; }
            .note {
              margin-top: 1.5rem;
              padding: 1rem;
              background: #fffbeb;
              border: 1px solid #fbbf24;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>UhaiLink Emergency QR</h1>
            <p>Scan in emergencies to access medical profile</p>
            <div class="qr">
              ${document.getElementById("qr-code")?.outerHTML || ""}
            </div>
            <div class="note">
              <strong>Security:</strong> Only share with trusted individuals or wear visibly.
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
      toast({ title: "Print Ready", description: "QR code sent to printer." });
    }, 500);
  };

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          Your Emergency QR Code
        </CardTitle>
        <CardDescription className="text-sm">
          Print or wear this QR code. First responders scan it to access your medical profile instantly.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center p-8 bg-white rounded-lg shadow-inner">
          <QRCodeSVG
            id="qr-code"
            value={qrUrl}
            size={256}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "/logo.svg", // Optional: add your logo
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={downloadQR}
            size="sm"
            className="w-full"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Download
          </Button>

          <Button
            onClick={onRegenerate}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>

          <Button
            onClick={copyUrl}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Link
          </Button>

          <Button
            onClick={printQR}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isPrinting}
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-1" />
            )}
            Print
          </Button>
        </div>

        {/* Security Note */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-sm text-amber-900 mb-1">Security Note</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            Anyone who scans this QR can view your medical info. 
            Only share with trusted people or wear for emergencies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;