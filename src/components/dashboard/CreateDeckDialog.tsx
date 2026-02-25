import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateDeckDialogProps {
  onCreated: () => void;
}

export const CreateDeckDialog = ({ onCreated }: CreateDeckDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("study_decks").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        subject: subject.trim() || null,
      });
      if (error) throw error;
      toast.success("Deck created!");
      setTitle(""); setDescription(""); setSubject("");
      setOpen(false);
      onCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to create deck");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          New Deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Study Deck</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="e.g. Biology Chapter 5" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subject (optional)</Label>
            <Input placeholder="e.g. Biology" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea placeholder="What's this deck about?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button onClick={handleCreate} disabled={loading || !title.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Creating..." : "Create Deck"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
