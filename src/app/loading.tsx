import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col bg-apex-navy">
      <div className="flex items-center justify-between border-b border-apex-border bg-apex-surface px-6 py-3">
        <Skeleton className="h-6 w-40 bg-apex-border" />
        <Skeleton className="h-6 w-24 bg-apex-border" />
      </div>
      <main className="flex-1 p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-full rounded-lg bg-apex-surface" />
          ))}
        </div>
      </main>
    </div>
  );
}
