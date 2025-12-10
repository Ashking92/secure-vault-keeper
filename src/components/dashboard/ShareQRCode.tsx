import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareQRCodeProps {
  shareId: string;
  fileName: string;
  expiresAt: string | null;
}

export const ShareQRCode = ({ shareId, fileName, expiresAt }: ShareQRCodeProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/download/${shareId}`;
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };
  
  const downloadQR = () => {
    const svg = document.getElementById(`qr-${shareId}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `qr-${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };
  
  const formatExpiry = (date: string | null) => {
    if (!date) return "Never expires";
    const expiry = new Date(date);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Expires in ${days} days`;
    if (hours > 0) return `Expires in ${hours} hours`;
    return "Expires soon";
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-background rounded-lg border border-border animate-page-in">
      <div className="p-4 bg-white rounded-xl shadow-md">
        <QRCodeSVG
          id={`qr-${shareId}`}
          value={shareUrl}
          size={180}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <div className="text-center space-y-1">
        <p className="font-medium text-foreground text-sm">{fileName}</p>
        <p className="text-xs text-muted-foreground">{formatExpiry(expiresAt)}</p>
      </div>
      
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="flex-1 gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadQR}
          className="flex-1 gap-2"
        >
          <Download className="w-4 h-4" />
          Save QR
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center break-all px-2">
        {shareUrl}
      </p>
    </div>
  );
};
