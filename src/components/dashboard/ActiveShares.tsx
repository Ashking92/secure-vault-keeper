import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Loader2, Trash2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileShare {
  id: string;
  file_id: string;
  shared_with_email: string;
  created_at: string;
  expires_at: string | null;
  file_name?: string;
}

export const ActiveShares = () => {
  const [shares, setShares] = useState<FileShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get all shares created by the user
      const { data: sharesData, error: sharesError } = await supabase
        .from("file_shares")
        .select("*")
        .eq("shared_by", userData.user.id)
        .order("created_at", { ascending: false });

      if (sharesError) throw sharesError;

      // Get file names for each share
      if (sharesData && sharesData.length > 0) {
        const fileIds = [...new Set(sharesData.map(s => s.file_id))];
        const { data: filesData } = await supabase
          .from("encrypted_files")
          .select("id, file_name")
          .in("id", fileIds);

        const fileNameMap = new Map(filesData?.map(f => [f.id, f.file_name]) || []);
        
        const sharesWithNames = sharesData.map(share => ({
          ...share,
          file_name: fileNameMap.get(share.file_id) || "Unknown file"
        }));

        setShares(sharesWithNames);
      } else {
        setShares([]);
      }
    } catch (error) {
      console.error("Load shares error:", error);
      toast.error("Failed to load shares");
    } finally {
      setLoading(false);
    }
  };

  const revokeShare = async (shareId: string) => {
    setRevoking(shareId);
    try {
      const { error } = await supabase
        .from("file_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;

      setShares(shares.filter(s => s.id !== shareId));
      toast.success("Share revoked successfully");
    } catch (error) {
      console.error("Revoke error:", error);
      toast.error("Failed to revoke share");
    } finally {
      setRevoking(null);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getExpiryText = (expiresAt: string | null) => {
    if (!expiresAt) return "Never expires";
    const expiry = new Date(expiresAt);
    if (isExpired(expiresAt)) return "Expired";
    return `Expires ${expiry.toLocaleDateString()} at ${expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getExpiryBadge = (expiresAt: string | null) => {
    if (!expiresAt) {
      return <Badge variant="secondary">Never expires</Badge>;
    }
    if (isExpired(expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="outline" className="text-primary border-primary">Active</Badge>;
  };

  if (loading) {
    return (
      <Card className="bg-card shadow-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const activeShares = shares.filter(s => !isExpired(s.expires_at));
  const expiredShares = shares.filter(s => isExpired(s.expires_at));

  return (
    <Card className="bg-card shadow-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Active Shares
        </CardTitle>
        <CardDescription>
          {shares.length} total share{shares.length !== 1 ? "s" : ""} • {activeShares.length} active
        </CardDescription>
      </CardHeader>
      <CardContent>
        {shares.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No shared files yet</p>
            <p className="text-sm">Share files from the "My Files" tab</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Shares */}
            {activeShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{share.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Shared with: {share.shared_with_email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(share.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {getExpiryBadge(share.expires_at)}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => revokeShare(share.id)}
                    disabled={revoking === share.id}
                  >
                    {revoking === share.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {/* Expired Shares */}
            {expiredShares.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-4">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Expired Shares ({expiredShares.length})
                  </span>
                </div>
                {expiredShares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 opacity-60"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{share.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Shared with: {share.shared_with_email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Expired {new Date(share.expires_at!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {getExpiryBadge(share.expires_at)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => revokeShare(share.id)}
                        disabled={revoking === share.id}
                      >
                        {revoking === share.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};