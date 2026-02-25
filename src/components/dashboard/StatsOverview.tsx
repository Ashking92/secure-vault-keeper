import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BookOpen, Brain, Target, Clock } from "lucide-react";

export const StatsOverview = () => {
  const [stats, setStats] = useState({ decks: 0, cards: 0, sessions: 0, accuracy: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [decksRes, cardsRes, sessionsRes] = await Promise.all([
        supabase.from("study_decks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("study_sessions").select("cards_studied, correct_answers").eq("user_id", user.id),
      ]);

      const totalStudied = sessionsRes.data?.reduce((sum, s) => sum + s.cards_studied, 0) ?? 0;
      const totalCorrect = sessionsRes.data?.reduce((sum, s) => sum + s.correct_answers, 0) ?? 0;
      const accuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;

      setStats({
        decks: decksRes.count ?? 0,
        cards: cardsRes.count ?? 0,
        sessions: sessionsRes.data?.length ?? 0,
        accuracy,
      });
    };
    fetchStats();
  }, []);

  const items = [
    { icon: BookOpen, label: "Decks", value: stats.decks, color: "text-primary" },
    { icon: Brain, label: "Cards", value: stats.cards, color: "text-primary" },
    { icon: Clock, label: "Sessions", value: stats.sessions, color: "text-accent" },
    { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="p-4 text-center">
          <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
          <p className="text-2xl font-bold text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </Card>
      ))}
    </div>
  );
};
