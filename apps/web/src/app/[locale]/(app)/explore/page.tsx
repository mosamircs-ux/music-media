"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, Music, Play, Pause, Scissors, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, Input, Badge } from "@musicmotion/ui";
import type { Track } from "@musicmotion/shared";
import { MOCK_TRACKS } from "@/lib/mockData";
import { useProjectStore } from "@/stores/projectStore";
import { useRouter } from "@/i18n/routing";

export default function ExploreMusicPage() {
  const t = useTranslations("music");
  const router = useRouter();
  const selectTrack = useProjectStore((state) => state.selectTrack);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null);

  const mockTracks: Track[] = MOCK_TRACKS;

  const handleSelectTrack = (track: Track) => {
    selectTrack(track);
    router.push("/editor/new");
  };

  const filteredTracks = mockTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <Music className="h-8 w-8 text-rose-500" />
            <span>Licensed Music Explorer</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Search hundreds of thousands of legally cleared tracks via Jamendo API or upload your own audio.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10 h-11 bg-card/80 border-white/10 rounded-xl"
          />
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track) => {
          const isPlaying = playingTrackId === track.id;
          return (
            <Card
              key={track.id}
              className="border-white/10 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  {/* Cover Art / Placeholder */}
                  <div className="relative h-16 w-16 rounded-xl bg-secondary flex-shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                    <Music className="h-7 w-7 text-rose-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-foreground truncate">{track.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">
                        {Math.floor(track.duration / 60)}:
                        {String(Math.floor(track.duration % 60)).padStart(2, "0")}
                      </span>
                      {track.bpm && (
                        <span className="text-[11px] font-medium text-purple-400">
                          • {track.bpm} BPM
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {track.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="success" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>CC Licensed</span>
                  </Badge>
                </div>
              </CardContent>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center gap-2 border-t border-border/40 mt-2 bg-secondary/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlayingTrackId(isPlaying ? null : track.id)}
                  className="flex-1 rounded-lg border-white/10"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-1 text-rose-500" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1 text-emerald-400" /> Play Demo
                    </>
                  )}
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => handleSelectTrack(track)}
                  className="flex-1 rounded-lg font-semibold"
                >
                  <Scissors className="h-4 w-4 mr-1" /> Use in Video
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
