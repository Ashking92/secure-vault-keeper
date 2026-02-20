import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

export const QRScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>("qr-reader-" + Math.random().toString(36).slice(2));

  const startScanning = async () => {
    setScanning(true);
    try {
      const scanner = new Html5Qrcode(containerRef.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText) => {
          handleScanResult(decodedText);
          stopScanning();
        },
        () => {} // ignore errors during scanning
      );
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Could not access camera. Please grant camera permissions.");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (e) {
      // ignore
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const handleScanResult = (url: string) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname;
      
      if (path.startsWith("/download/")) {
        toast.success("QR code scanned! Redirecting...");
        navigate(path);
      } else {
        toast.error("Invalid QR code. Not a valid share link.");
      }
    } catch {
      toast.error("Invalid QR code content.");
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className="shadow-card cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanLine className="w-5 h-5 text-primary" />
          Scan QR Code
        </CardTitle>
        <CardDescription>
          Scan a QR code to access shared encrypted files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {scanning ? (
          <div className="space-y-3 animate-page-in">
            <div
              id={containerRef.current}
              className="w-full rounded-lg overflow-hidden border border-border"
            />
            <Button
              variant="outline"
              onClick={stopScanning}
              className="w-full gap-2"
            >
              <X className="w-4 h-4" />
              Stop Scanner
            </Button>
          </div>
        ) : (
          <Button
            onClick={startScanning}
            className="w-full gap-2 bg-gradient-primary"
            variant="glow"
          >
            <Camera className="w-4 h-4" />
            Open Scanner
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
