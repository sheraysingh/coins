"use client";

import { useEffect, useState } from "react";
import { PanelWrapper } from "@/components/layout/panel-wrapper";
import { CommunityCard } from "./community-card";
import { OpinionCard } from "./opinion-card";
import { RiskWarning } from "./risk-warning";
import { Skeleton } from "@/components/ui/skeleton";
import { type AIOpinion } from "@/lib/types";

interface SkoolPanelProps {
  refreshKey: number;
}

export function SkoolPanel({ refreshKey }: SkoolPanelProps) {
  const [opinion, setOpinion] = useState<AIOpinion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/insights?type=skool")
      .then((res) => res.json())
      .then((d) => setOpinion(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <PanelWrapper title="Skool — CoinPicks Genesis" accent="amber">
      <div className="space-y-4">
        <RiskWarning />
        <CommunityCard />
        {loading ? (
          <Skeleton className="h-48 w-full bg-apex-border" />
        ) : opinion ? (
          <OpinionCard opinion={opinion} />
        ) : null}
      </div>
    </PanelWrapper>
  );
}
