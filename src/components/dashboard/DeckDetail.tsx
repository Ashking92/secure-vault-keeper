import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

interface DeckDetailProps {
  deckId: string;
  deckTitle: string;
  onBack: () => void;
  onStudy: (id: string) => void;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export const DeckDetail = ({ deckId, deckTitle, onBack, onStudy }: DeckDetailProps) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCards = async () => {
    const { data } = await supabase.from("flashcards").select("id, front, back").eq("deck_id", deckId).order("created_at");
    if (data) setCards(data);
  };

  useEffect(() => { fetchCards(); }, [deckId]);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim()) return;
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("flashcards").insert({ deck_id: deckId, user_id: user.id, front: front.trim(), back: back.trim() });
      if (error) throw error;
      // Update card count
      await supabase.from("study_decks").update({ card_count: cards.length + 1 }).eq("id", deckId);
      setFront(""); setBack("");
      fetchCards();
      toast.success("Card added!");
    } catch (e: any) { toast.error(e.message); }
    finally { setAdding(false); }
  };

  const handleDelete = async (cardId: string) => {
    await supabase.from("flashcards").delete().eq("id", cardId);
    await supabase.from("study_decks").update({ card_count: Math.max(0, cards.length - 1) }).eq("id", deckId);
    fetchCards();
    toast.success("Card removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <h2 className="text-xl font-bold text-foreground">{deckTitle}</h2>
        </div>
        {cards.length > 0 && (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onStudy(deckId)}>
            <Play className="w-4 h-4" />Study Now
          </Button>
        )}
      </div>

      {/* Add card form */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Front (question)" value={front} onChange={(e) => setFront(e.target.value)} />
          <Input placeholder="Back (answer)" value={back} onChange={(e) => setBack(e.target.value)} />
        </div>
        <Button onClick={handleAdd} disabled={adding || !front.trim() || !back.trim()} size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-3 h-3" />{adding ? "Adding..." : "Add Card"}
        </Button>
      </Card>

      {/* Card list */}
      {cards.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No cards yet. Add your first flashcard above!</p>
      ) : (
        <div className="space-y-2">
          {cards.map((card, i) => (
            <Card key={card.id} className="p-3 flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{card.front}</p>
                  <p className="text-xs text-muted-foreground truncate">{card.back}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete(card.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
