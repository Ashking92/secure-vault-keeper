import { BookOpen, Brain, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-hero overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-10 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">StudyBuddy</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl shadow-glow mb-6 sm:mb-8 animate-float">
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            StudyBuddy <span className="text-primary">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-foreground/80 mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Your smart study companion
          </p>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            Create flashcards, generate quizzes with AI, summarize notes, and track your learning progress — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto btn-glow"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto transition-all duration-300"
              onClick={() => navigate("/auth")}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Sign In
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-20 px-2">
            {[
              {
                icon: BookOpen,
                title: "Smart Flashcards",
                description: "Create decks and study with spaced repetition"
              },
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Summarize notes and generate quizzes instantly"
              },
              {
                icon: BarChart3,
                title: "Track Progress",
                description: "Visualize your learning streaks and stats"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card p-5 sm:p-6 rounded-2xl shadow-card border border-border hover:shadow-glow transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
