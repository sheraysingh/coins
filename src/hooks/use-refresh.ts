"use client";

import { useState, useCallback } from "react";

export function useRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 2000);
  }, []);

  return { refreshKey, isRefreshing, refresh };
}
