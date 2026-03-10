import { Users, DollarSign, ExternalLink } from "lucide-react";
import { SKOOL_COMMUNITY } from "@/lib/constants";

export function CommunityCard() {
  const c = SKOOL_COMMUNITY;

  return (
    <div className="rounded-md border border-apex-border bg-apex-navy/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{c.name}</h3>
        <a
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-apex-cyan"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">by {c.creator}</p>
      <div className="mb-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-mono text-sm">
          <DollarSign className="h-3.5 w-3.5 text-apex-green" />
          {c.price}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-sm">
          <Users className="h-3.5 w-3.5 text-apex-cyan" />
          {c.members}
        </span>
      </div>
      <ul className="space-y-1">
        {c.benefits.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-apex-cyan">&#8250;</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
