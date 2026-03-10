import { ThumbsUp, ThumbsDown, Scale } from "lucide-react";
import { type AIOpinion } from "@/lib/types";

interface OpinionCardProps {
  opinion: AIOpinion;
}

export function OpinionCard({ opinion }: OpinionCardProps) {
  return (
    <div className="rounded-md border border-apex-border bg-apex-navy/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Scale className="h-4 w-4 text-apex-magenta" />
        <span className="font-mono text-xs uppercase text-apex-magenta">AI Cross-Check</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Updated: {opinion.lastUpdated}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5 text-apex-green" />
            <span className="font-mono text-xs uppercase text-apex-green">Pros</span>
          </div>
          <ul className="space-y-1.5">
            {opinion.pros.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                <span className="text-apex-green">+</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <ThumbsDown className="h-3.5 w-3.5 text-apex-red" />
            <span className="font-mono text-xs uppercase text-apex-red">Cons</span>
          </div>
          <ul className="space-y-1.5">
            {opinion.cons.map((c, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                <span className="text-apex-red">-</span> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 border-t border-apex-border pt-3">
        <p className="text-sm italic text-muted-foreground">{opinion.verdict}</p>
      </div>
    </div>
  );
}
