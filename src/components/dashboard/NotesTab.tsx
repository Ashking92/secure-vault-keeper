import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  created_at: string;
}

export const NotesTab = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchNotes = async () => {
    const { data } = await supabase.from("study_notes").select("*").order("created_at", { ascending: false });
    if (data) setNotes(data);
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("study_notes").insert({ user_id: user.id, title: title.trim(), content: content.trim() });
      if (error) throw error;
      setTitle(""); setContent(""); setShowForm(false);
      fetchNotes();
      toast.success("Note saved!");
    } catch (e: any) { toast.error(e.message); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("study_notes").delete().eq("id", id);
    fetchNotes();
    toast.success("Note deleted");
  };

  const handleSummarize = async (note: Note) => {
    setSummarizing(note.id);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-notes", {
        body: { content: note.content, title: note.title },
      });
      if (error) throw error;
      const summary = data?.summary;
      if (summary) {
        await supabase.from("study_notes").update({ summary }).eq("id", note.id);
        fetchNotes();
        toast.success("Summary generated!");
      }
    } catch (e: any) {
      toast.error("Failed to summarize. Try again later.");
    } finally {
      setSummarizing(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />{showForm ? "Cancel" : "New Note"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-3 animate-in fade-in duration-200">
          <Input placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Paste your study notes here..." className="min-h-[120px]" value={content} onChange={(e) => setContent(e.target.value)} />
          <Button onClick={handleAdd} disabled={adding || !title.trim() || !content.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {adding ? "Saving..." : "Save Note"}
          </Button>
        </Card>
      )}

      {notes.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No notes yet. Add notes and use AI to summarize them!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="p-4 group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{note.title}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-primary"
                    onClick={() => handleSummarize(note)}
                    disabled={summarizing === note.id}
                  >
                    {summarizing === note.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Summarize
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleDelete(note.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{note.content}</p>
              {note.summary && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-1">✨ AI Summary</p>
                  <p className="text-sm text-foreground">{note.summary}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
