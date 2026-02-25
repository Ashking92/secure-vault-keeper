import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, Settings, Menu, X } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useProfile } from "@/hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CreateDeckDialog } from "@/components/dashboard/CreateDeckDialog";
import { DeckCard } from "@/components/dashboard/DeckCard";
import { DeckDetail } from "@/components/dashboard/DeckDetail";
import { StudyMode } from "@/components/dashboard/StudyMode";
import { NotesTab } from "@/components/dashboard/NotesTab";
import type { User } from "@supabase/supabase-js";

type View = "list" | "detail" | "study";

interface Deck {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  card_count: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useProfile();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDecks = async () => {
    const { data } = await supabase.from("study_decks").select("*").order("updated_at", { ascending: false });
    if (data) setDecks(data);
  };

  useEffect(() => { if (user) fetchDecks(); }, [user]);

  const handleDeleteDeck = async (id: string) => {
    await supabase.from("study_decks").delete().eq("id", id);
    fetchDecks();
    toast.success("Deck deleted");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">StudyBuddy</h1>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}><Settings className="h-5 w-5" /></Button>
              <button onClick={() => navigate("/profile")} className="hover:opacity-80 transition-opacity">
                <ProfileAvatar avatarUrl={profile?.avatar_url ?? null} displayName={profile?.display_name ?? null} email={user?.email} size="sm" />
              </button>
              <Button variant="outline" onClick={handleSignOut} className="gap-2"><LogOut className="w-4 h-4" />Sign Out</Button>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border mt-3 pt-3 pb-2 animate-page-in flex flex-col gap-2">
              <p className="text-xs text-muted-foreground px-2">{user?.email}</p>
              <Button variant="ghost" onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} className="justify-start gap-2">
                <ProfileAvatar avatarUrl={profile?.avatar_url ?? null} displayName={profile?.display_name ?? null} email={user?.email} size="sm" />Profile
              </Button>
              <Button variant="ghost" onClick={() => { navigate("/settings"); setMobileMenuOpen(false); }} className="justify-start gap-2"><Settings className="h-4 w-4" />Settings</Button>
              <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-2 text-destructive"><LogOut className="w-4 h-4" />Sign Out</Button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto">
          {view === "study" && selectedDeck ? (
            <StudyMode deckId={selectedDeck.id} deckTitle={selectedDeck.title} onBack={() => setView("list")} />
          ) : view === "detail" && selectedDeck ? (
            <DeckDetail deckId={selectedDeck.id} deckTitle={selectedDeck.title} onBack={() => { setView("list"); fetchDecks(); }} onStudy={() => setView("study")} />
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">Welcome back! 👋</h2>
                <p className="text-sm text-muted-foreground">Ready to study? Here's your overview.</p>
              </div>

              <StatsOverview />

              <Tabs defaultValue="decks" className="mt-8 space-y-4">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                  <TabsTrigger value="decks" className="text-xs sm:text-sm py-2">My Decks</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs sm:text-sm py-2">Notes & AI</TabsTrigger>
                </TabsList>

                <TabsContent value="decks" className="space-y-4">
                  <div className="flex justify-end">
                    <CreateDeckDialog onCreated={fetchDecks} />
                  </div>
                  {decks.length === 0 ? (
                    <div className="text-center py-16">
                      <Brain className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">No decks yet. Create your first study deck!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {decks.map((deck) => (
                        <DeckCard
                          key={deck.id}
                          id={deck.id}
                          title={deck.title}
                          description={deck.description}
                          subject={deck.subject}
                          cardCount={deck.card_count}
                          onStudy={(id) => { setSelectedDeck(decks.find((d) => d.id === id) ?? null); setView("study"); }}
                          onDelete={handleDeleteDeck}
                          onClick={(id) => { setSelectedDeck(decks.find((d) => d.id === id) ?? null); setView("detail"); }}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes">
                  <NotesTab />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
