"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import {
  Search,
  Music,
  Play,
  Pause,
  Scissors,
  ShieldCheck,
  Upload,
  Flame,
  Disc3,
  Tag,
  Users,
  Layers,
} from "lucide-react";
import { Button, Card, CardContent, Input, Badge, Slider } from "@musicmotion/ui";
import type { Track } from "@musicmotion/shared";
import { MOCK_TRACKS, MOCK_GENRES, MOCK_ARTISTS, MOCK_ALBUMS } from "@/lib/mockData";
import { useProjectStore } from "@/stores/projectStore";
import { useRouter } from "@/i18n/routing";

export default function DiscoverPage() {
  const t = useTranslations("discover");
  const router = useRouter();
  const selectTrack = useProjectStore((state) => state.selectTrack);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedGenre, setSelectedGenre] = React.useState<string>("all");
  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null);
  const [bpmFilter, setBpmFilter] = React.useState<number>(0);
  const recentSearches = ["Cyberpunk", "Lo-Fi Beats", "Cinematic Trailer", "EDM Drop"];

  const handleSelectTrack = (track: Track) => {
    selectTrack(track);
    router.push("/create");
  };

  const filteredTracks = MOCK_TRACKS.filter((track) => {
    const matchesQuery =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenre === "all" ||
      track.tags?.some((tag) => tag.toLowerCase().includes(selectedGenre.toLowerCase()));

    const matchesBpm = bpmFilter === 0 || (track.bpm && track.bpm >= bpmFilter);

    return matchesQuery && matchesGenre && matchesBpm;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header & Hero Search */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent" className="px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
          <span>100% Legal & Cleared Music Catalog</span>
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("subtitle")}
        </p>

        {/* Big Spotify-Style Search Input */}
        <div className="relative max-w-2xl mx-auto pt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-14 pl-12 pr-4 rounded-2xl bg-card/80 border-white/10 text-base shadow-xl backdrop-blur-xl"
          />
        </div>

        {/* Recent Search Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Tag className="h-3 w-3" /> {t("recentSearches")}:
          </span>
          {recentSearches.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Upload Own Audio Dropzone Card */}
      <Card className="border-dashed border-2 border-white/20 bg-secondary/20 p-6 rounded-3xl hover:bg-secondary/40 transition-colors">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{t("uploadOwn")}</h3>
              <p className="text-xs text-muted-foreground">{t("uploadDesc")}</p>
            </div>
          </div>
          <Button variant="gradient" className="rounded-xl font-bold">
            <Upload className="h-4 w-4 mr-2" /> Upload Audio
          </Button>
        </div>
      </Card>

      {/* 3. Browse by Genre Tiles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-purple-400" />
            <span>{t("genres")}</span>
          </h2>
          {selectedGenre !== "all" && (
            <button
              onClick={() => setSelectedGenre("all")}
              className="text-xs text-rose-400 font-semibold hover:underline"
            >
              Reset to All Genres
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {MOCK_GENRES.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(isSelected ? "all" : g.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? "border-rose-500 ring-2 ring-rose-500/30 bg-card"
                    : "border-white/10 bg-card/60 hover:bg-card/90"
                }`}
              >
                <div className={`h-10 w-full rounded-xl bg-gradient-to-br ${g.gradient} mb-2 flex items-center justify-center shadow-inner`}>
                  <Music className="h-4 w-4 text-white drop-shadow" />
                </div>
                <h4 className="text-xs font-bold text-foreground truncate">{g.name}</h4>
                <p className="text-[10px] text-muted-foreground">{g.count}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Artists Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-rose-400" />
            <span>Featured Artists</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_ARTISTS.map((artist) => (
            <div
              key={artist.id}
              onClick={() => setSearchQuery(artist.name)}
              className="p-4 rounded-2xl bg-card/60 border border-white/10 hover:bg-card/90 transition-all text-center space-y-3 cursor-pointer group shadow-lg"
            >
              <div className="relative h-24 w-24 mx-auto rounded-full overflow-hidden border-2 border-rose-500/30 group-hover:border-rose-500 group-hover:scale-105 transition-all shadow-md">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground truncate">{artist.name}</h4>
                <p className="text-[10px] text-muted-foreground truncate">{artist.genre}</p>
                <span className="text-[9px] font-semibold text-rose-400 mt-1 block">
                  {artist.monthlyListeners} monthly
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Curated Albums Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span>Curated Soundtracks & Albums</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_ALBUMS.map((album) => (
            <div
              key={album.id}
              onClick={() => setSearchQuery(album.title.split(" ")[0])}
              className="p-4 rounded-2xl bg-card/60 border border-white/10 hover:bg-card/90 transition-all flex items-center gap-3.5 cursor-pointer group shadow-lg"
            >
              <img
                src={album.coverArtUrl}
                alt={album.title}
                className="h-16 w-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground truncate">{album.title}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{album.artist}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                  <span>{album.genre}</span>
                  <span>•</span>
                  <span>{album.tracksCount} tracks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Trending & Track Catalog */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-bold tracking-tight">
              {selectedGenre === "all" ? t("trending") : `Genre: ${selectedGenre.toUpperCase()}`}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {filteredTracks.length} tracks
            </Badge>
          </div>

          {/* BPM Filter */}
          <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-white/5">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Min BPM: {bpmFilter === 0 ? "Any" : `${bpmFilter} BPM`}
            </span>
            <div className="w-32">
              <Slider
                value={bpmFilter}
                min={0}
                max={160}
                step={10}
                onChange={setBpmFilter}
              />
            </div>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track) => {
            const isPlaying = playingTrackId === track.id;
            return (
              <Card
                key={track.id}
                className="border-white/10 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Cover Art Image */}
                    <div className="relative h-20 w-20 rounded-2xl bg-secondary flex-shrink-0 overflow-hidden border border-white/10 group-hover:shadow-md">
                      <img
                        src={track.coverArtUrl}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => setPlayingTrackId(isPlaying ? null : track.id)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity hover:bg-black/60"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6 fill-current text-rose-500" />
                        ) : (
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-foreground truncate">{track.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{track.album}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {Math.floor(track.duration / 60)}:
                          {String(Math.floor(track.duration % 60)).padStart(2, "0")}
                        </span>
                        {track.bpm && (
                          <span className="text-[11px] font-semibold text-purple-400">
                            • {track.bpm} BPM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Animated Waveform Snippet Bar */}
                  <div className="h-10 w-full rounded-xl bg-background/80 border border-white/5 flex items-center justify-between px-3 gap-0.5 overflow-hidden">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all ${
                          isPlaying ? "bg-rose-500 animate-pulse" : "bg-muted-foreground/30"
                        }`}
                        style={{
                          height: `${20 + Math.sin(i * 0.5) * 40 + (isPlaying ? Math.random() * 30 : 0)}%`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Tags & License */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {track.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2">
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="success" className="text-[10px] px-2 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{t("licensed")}</span>
                    </Badge>
                  </div>
                </CardContent>

                {/* Bottom Action Footer */}
                <div className="p-4 pt-0 border-t border-border/40 flex items-center gap-2 bg-secondary/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPlayingTrackId(isPlaying ? null : track.id)}
                    className="flex-1 rounded-xl border-white/10"
                  >
                    {isPlaying ? "Pause Preview" : "Play Snippet"}
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleSelectTrack(track)}
                    className="flex-1 rounded-xl font-bold shadow-md shadow-rose-500/20"
                  >
                    <Scissors className="h-4 w-4 mr-1.5" /> {t("select")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

