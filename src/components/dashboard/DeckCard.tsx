import { BookOpen, Trash2, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DeckCardProps {
  id: string;
  title: string;
  description?: string | null;
  subject?: string | null;
  cardCount: number;
  onStudy: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

export const DeckCard = ({ id, title, description, subject, cardCount, onStudy, onDelete, onClick }: DeckCardProps) => {
  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-1 border-border"
      onClick={() => onClick(id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {subject && <span className="text-xs text-muted-foreground">{subject}</span>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{cardCount} cards</span>
          <Button
            size="sm"
            className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={(e) => { e.stopPropagation(); onStudy(id); }}
          >
            <Play className="w-3 h-3" />
            Study
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
