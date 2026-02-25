import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface StudyModeProps {
  deckId: string;
  deckTitle: string;
  onBack: () => void;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  review_count: number;
}

export const StudyMode = ({ deckId, deckTitle, onBack }: StudyModeProps) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [studied, setStudied] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchCards = async () => {
      const { data } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("next_review", { ascending: true });
      if (data && data.length > 0) setCards(data);
      else { toast.info("No cards in this deck yet"); onBack(); }
    };
    fetchCards();
  }, [deckId, onBack]);

  const handleAnswer = async (isCorrect: boolean) => {
    const card = cards[currentIndex];
    if (isCorrect) setCorrect((c) => c + 1);
    setStudied((s) => s + 1);

    // Update card difficulty and next review
    const newDifficulty = isCorrect ? Math.max(0, card.difficulty - 1) : card.difficulty + 1;
    const hoursUntilReview = Math.pow(2, Math.max(0, 3 - newDifficulty)) * 24;
    const nextReview = new Date(Date.now() + hoursUntilReview * 3600000).toISOString();

    await supabase.from("flashcards").update({
      difficulty: newDifficulty,
      review_count: card.review_count + 1,
      next_review: nextReview,
    }).eq("id", card.id);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    } else {
      setFinished(true);
      // Save study session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("study_sessions").insert({
          user_id: user.id,
          deck_id: deckId,
          cards_studied: studied + 1,
          correct_answers: correct + (isCorrect ? 1 : 0),
          duration_seconds: Math.round((Date.now() - startTime) / 1000),
          session_type: "review",
        });
      }
    }
  };

  if (cards.length === 0) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading cards...</div>;
  }

  if (finished) {
    const pct = Math.round(((correct) / (studied)) * 100);
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Session Complete! 🎉</h2>
        <p className="text-muted-foreground mb-6">You studied {studied} cards from "{deckTitle}"</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4"><p className="text-2xl font-bold text-primary">{studied}</p><p className="text-xs text-muted-foreground">Studied</p></Card>
          <Card className="p-4"><p className="text-2xl font-bold text-accent">{correct}</p><p className="text-xs text-muted-foreground">Correct</p></Card>
          <Card className="p-4"><p className="text-2xl font-bold text-foreground">{pct}%</p><p className="text-xs text-muted-foreground">Accuracy</p></Card>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back to Decks</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setCurrentIndex(0); setFlipped(false); setCorrect(0); setStudied(0); setFinished(false); }}>
            <RotateCcw className="w-4 h-4 mr-2" />Study Again
          </Button>
        </div>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <span className="text-sm text-muted-foreground">{currentIndex + 1} / {cards.length}</span>
      </div>

      <div className="perspective-1000 mb-6" onClick={() => setFlipped(!flipped)}>
        <Card className="min-h-[250px] flex items-center justify-center p-8 cursor-pointer transition-all duration-300 hover:shadow-glow">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">{flipped ? "Answer" : "Question"}</p>
            <p className="text-xl font-medium text-foreground">{flipped ? card.back : card.front}</p>
            {!flipped && <p className="text-xs text-muted-foreground mt-4">Tap to reveal answer</p>}
          </div>
        </Card>
      </div>

      {flipped && (
        <div className="flex gap-3 justify-center animate-in fade-in duration-300">
          <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleAnswer(false)}>
            <X className="w-4 h-4" />Wrong
          </Button>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleAnswer(true)}>
            <Check className="w-4 h-4" />Correct
          </Button>
        </div>
      )}
    </div>
  );
};
