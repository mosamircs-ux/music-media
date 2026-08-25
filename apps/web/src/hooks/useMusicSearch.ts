"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NormalizedTrack, MusicProviderType, SearchResult } from "@musicmotion/shared";
import { MOCK_TRACKS } from "@/lib/mockData";

export interface UseMusicSearchOptions {
  initialQuery?: string;
  initialProvider?: MusicProviderType | "all";
  initialGenre?: string;
  limit?: number;
  debounceMs?: number;
}

export function useMusicSearch({
  initialQuery = "",
  initialProvider = "all",
  initialGenre,
  limit = 20,
  debounceMs = 300,
}: UseMusicSearchOptions = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [provider, setProvider] = useState<MusicProviderType | "all">(initialProvider);
  const [genre, setGenre] = useState<string | undefined>(initialGenre);
  const [bpmMin, setBpmMin] = useState<number | undefined>(undefined);
  const [bpmMax, setBpmMax] = useState<number | undefined>(undefined);

  const [tracks, setTracks] = useState<NormalizedTrack[]>(MOCK_TRACKS);
  const [total, setTotal] = useState<number>(MOCK_TRACKS.length);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeSearch = useCallback(
    async (
      searchQuery: string,
      targetProvider: MusicProviderType | "all",
      targetGenre?: string,
      targetBpmMin?: number,
      targetBpmMax?: number,
      pageNumber = 1
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const offset = (pageNumber - 1) * limit;
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (targetProvider && targetProvider !== "all") params.set("provider", targetProvider);
        if (targetGenre) params.set("genre", targetGenre);
        if (targetBpmMin) params.set("bpmMin", String(targetBpmMin));
        if (targetBpmMax) params.set("bpmMax", String(targetBpmMax));
        params.set("limit", String(limit));
        params.set("offset", String(offset));

        const res = await fetch(`/api/music/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch tracks (${res.status})`);
        }

        const data: SearchResult = await res.json();

        // If backend returned results, use them; otherwise fallback to curated mock data
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
          setTotal(data.total);
          setHasMore(data.hasMore);
          setPage(pageNumber);
        } else {
          // Client-side fallback to mock dataset
          let filtered = [...MOCK_TRACKS];
          if (targetProvider && targetProvider !== "all") {
            filtered = filtered.filter((t) => t.provider === targetProvider);
          }
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
              (t) =>
                t.title.toLowerCase().includes(q) ||
                t.artist.toLowerCase().includes(q) ||
                t.tags?.some((tag) => tag.toLowerCase().includes(q))
            );
          }
          if (targetGenre) {
            filtered = filtered.filter((t) =>
              t.tags?.some((tg) => tg.toLowerCase() === targetGenre.toLowerCase())
            );
          }
          if (targetBpmMin) {
            filtered = filtered.filter((t) => (t.bpm || 0) >= targetBpmMin);
          }

          setTracks(filtered);
          setTotal(filtered.length);
          setHasMore(false);
          setPage(pageNumber);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.warn("Search fetch error, falling back to local dataset:", err);
          setError("Could not reach search provider. Displaying offline licensed tracks.");
          setTracks(MOCK_TRACKS);
          setTotal(MOCK_TRACKS.length);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  // Debounced search trigger on query or filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch(query, provider, genre, bpmMin, bpmMax, 1);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, provider, genre, bpmMin, bpmMax, debounceMs, executeSearch]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      executeSearch(query, provider, genre, bpmMin, bpmMax, page + 1);
    }
  }, [isLoading, hasMore, query, provider, genre, bpmMin, bpmMax, page, executeSearch]);

  return {
    query,
    setQuery,
    provider,
    setProvider,
    genre,
    setGenre,
    bpmMin,
    setBpmMin,
    bpmMax,
    setBpmMax,
    tracks,
    total,
    page,
    hasMore,
    isLoading,
    error,
    loadMore,
    refresh: () => executeSearch(query, provider, genre, bpmMin, bpmMax, page),
  };
}
