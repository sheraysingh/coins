import { cn } from "@/lib/utils";

interface PanelWrapperProps {
  title: string;
  accent?: "cyan" | "magenta" | "amber";
  children: React.ReactNode;
  className?: string;
}

const accentColors = {
  cyan: "border-t-apex-cyan",
  magenta: "border-t-apex-magenta",
  amber: "border-t-apex-amber",
};

const accentTextColors = {
  cyan: "text-apex-cyan",
  magenta: "text-apex-magenta",
  amber: "text-apex-amber",
};

export function PanelWrapper({
  title,
  accent = "cyan",
  children,
  className,
}: PanelWrapperProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-apex-border border-t-2 bg-apex-surface",
        accentColors[accent],
        className
      )}
    >
      <div className="border-b border-apex-border px-4 py-2.5">
        <h2 className={cn("font-mono text-sm font-semibold tracking-wider uppercase", accentTextColors[accent])}>
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
