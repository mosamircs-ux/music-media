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
  AlertCircle,
  Sparkles,
  Radio,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Slider,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@musicmotion/ui";
import type { NormalizedTrack, MusicProviderType } from "@musicmotion/shared";
import { MOCK_GENRES, MOCK_ARTISTS, MOCK_ALBUMS } from "@/lib/mockData";
import { useProjectStore } from "@/stores/projectStore";
import { useRouter } from "@/i18n/routing";
import { useMusicSearch } from "@/hooks/useMusicSearch";

export default function DiscoverPage() {
  const t = useTranslations("discover");
  const router = useRouter();
  const selectTrack = useProjectStore((state) => state.selectTrack);

  const {
    query,
    setQuery,
    provider,
    setProvider,
    genre,
    setGenre,
    bpmMin,
    setBpmMin,
    tracks,
    total,
    isLoading,
    error,
  } = useMusicSearch();

  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null);
  const [restrictedTrackModal, setRestrictedTrackModal] = React.useState<NormalizedTrack | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const recentSearches = ["Cyberpunk", "Lo-Fi Beats", "Cinematic Trailer", "EDM Drop"];

  const handleSelectTrack = (track: NormalizedTrack) => {
    if (!track.isAvailableForVideo) {
      setRestrictedTrackModal(track);
      return;
    }
    selectTrack(track);
    router.push("/create");
  };

  const handleProceedWithRestricted = () => {
    if (restrictedTrackModal) {
      selectTrack(restrictedTrackModal);
      setRestrictedTrackModal(null);
      router.push("/create");
    }
  };

  const togglePlayTrack = (track: NormalizedTrack) => {
    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (track.previewUrl || track.audioUrl) {
        const audio = new Audio(track.previewUrl || track.audioUrl);
        audioRef.current = audio;
        audio.play().catch((err) => console.warn("Audio play prevented:", err));
        audio.onended = () => setPlayingTrackId(null);
      }
      setPlayingTrackId(track.id);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header & Hero Search */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent" className="px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
          <span>Unified Multi-Provider Music Architecture</span>
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks by title, artist, mood, or tags across providers..."
            className="h-14 pl-12 pr-4 rounded-2xl bg-card/80 border-white/10 text-base shadow-xl backdrop-blur-xl"
          />
        </div>

        {/* Provider Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Provider:</span>
          {[
            { id: "all", label: "All Providers", icon: Radio, color: "bg-neutral-800 text-white" },
            { id: "licensed", label: "Jamendo CC (Video Ready)", icon: ShieldCheck, color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
            { id: "spotify", label: "Spotify Discovery", icon: Sparkles, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
            { id: "apple", label: "Apple Music", icon: Music, color: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
            { id: "user-upload", label: "My Uploads", icon: Upload, color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
          ].map((item) => {
            const isSelected = provider === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setProvider(item.id as MusicProviderType | "all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "border-rose-500 bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50"
                    : "border-white/10 bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recent Search Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Tag className="h-3 w-3" /> {t("recentSearches")}:
          </span>
          {recentSearches.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
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
            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{t("uploadOwn")}</h3>
              <p className="text-xs text-muted-foreground">{t("uploadDesc")}</p>
            </div>
          </div>
          <Button
            variant="gradient"
            onClick={() => setProvider("user-upload")}
            className="rounded-xl font-bold"
          >
            <Upload className="h-4 w-4 mr-2" /> Upload Audio
          </Button>
        </div>
      </Card>

      {/* Error State Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Browse by Genre Tiles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-purple-400" />
            <span>{t("genres")}</span>
          </h2>
          {genre && (
            <button
              onClick={() => setGenre(undefined)}
              className="text-xs text-rose-400 font-semibold hover:underline"
            >
              Reset to All Genres
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {MOCK_GENRES.map((g) => {
            const isSelected = genre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGenre(isSelected ? undefined : g.id)}
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
              onClick={() => setQuery(artist.name)}
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
              onClick={() => setQuery(album.title.split(" ")[0])}
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
              {query ? `Search Results for "${query}"` : genre ? `Genre: ${genre.toUpperCase()}` : t("trending")}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {total} tracks found
            </Badge>
          </div>

          {/* BPM Filter */}
          <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-white/5">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Min BPM: {bpmMin ? `${bpmMin} BPM` : "Any"}
            </span>
            <div className="w-32">
              <Slider
                value={bpmMin || 0}
                min={0}
                max={160}
                step={10}
                onChange={(val) => setBpmMin(val === 0 ? undefined : val)}
              />
            </div>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-secondary/30 border border-white/5 p-5 space-y-4" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tracks.length === 0 && (
          <div className="text-center py-16 space-y-4 border border-dashed border-white/10 rounded-3xl p-8">
            <div className="h-14 w-14 rounded-2xl bg-secondary/40 text-muted-foreground mx-auto flex items-center justify-center">
              <Music className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No tracks match your search</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search terms, clearing the BPM filter, or switching to &quot;All Providers&quot;.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setProvider("all");
                setGenre(undefined);
                setBpmMin(undefined);
              }}
              className="rounded-xl text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        )}

        {/* Tracks Grid */}
        {!isLoading && tracks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => {
              const isPlaying = playingTrackId === track.id;
              const albumArt = track.albumArt || track.coverArtUrl;

              // Provider Badge Color
              let providerBadge = {
                text: "Jamendo CC",
                color: "bg-purple-500/10 border-purple-500/20 text-purple-300",
              };
              if (track.provider === "spotify") {
                providerBadge = {
                  text: "Spotify",
                  color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
                };
              } else if (track.provider === "apple") {
                providerBadge = {
                  text: "Apple Music",
                  color: "bg-pink-500/10 border-pink-500/20 text-pink-300",
                };
              } else if (track.provider === "user-upload" || track.provider === "upload") {
                providerBadge = {
                  text: "User Upload",
                  color: "bg-blue-500/10 border-blue-500/20 text-blue-300",
                };
              }

              return (
                <Card
                  key={track.id}
                  className="border-white/10 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Cover Art Image */}
                      <div className="relative h-20 w-20 rounded-2xl bg-secondary flex-shrink-0 overflow-hidden border border-white/10 group-hover:shadow-md">
                        {albumArt ? (
                          <img
                            src={albumArt}
                            alt={track.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-secondary text-muted-foreground">
                            <Music className="h-8 w-8" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => togglePlayTrack(track)}
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
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${providerBadge.color}`}>
                            {providerBadge.text}
                          </span>
                          {!track.isAvailableForVideo && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              Preview Only
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-foreground truncate">{track.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        {track.album && (
                          <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{track.album}</p>
                        )}

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

                    {/* Tags & License Info */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {track.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-2">
                          {tag}
                        </Badge>
                      ))}
                      {track.isAvailableForVideo ? (
                        <Badge variant="success" className="text-[10px] px-2 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Video Cleared</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-2 flex items-center gap-1 text-amber-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Discovery Sample</span>
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  {/* Bottom Action Footer */}
                  <div className="p-4 pt-0 border-t border-border/40 flex items-center gap-2 bg-secondary/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePlayTrack(track)}
                      className="flex-1 rounded-xl border-white/10"
                    >
                      {isPlaying ? "Pause Preview" : "Play Snippet"}
                    </Button>
                    <Button
                      variant={track.isAvailableForVideo ? "gradient" : "outline"}
                      size="sm"
                      onClick={() => handleSelectTrack(track)}
                      className="flex-1 rounded-xl font-bold shadow-md shadow-rose-500/20"
                    >
                      <Scissors className="h-4 w-4 mr-1.5" /> Use This Track
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Restricted Track Compliance Warning Modal */}
      <Dialog
        open={Boolean(restrictedTrackModal)}
        onOpenChange={(open) => {
          if (!open) setRestrictedTrackModal(null);
        }}
      >
        <DialogContent className="max-w-md" onClose={() => setRestrictedTrackModal(null)}>
          <DialogHeader>
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <AlertCircle className="h-5 w-5" />
            </div>
            <DialogTitle>Licensing & Copyright Notice</DialogTitle>
            <DialogDescription>
              This track is from a third-party discovery catalog ({restrictedTrackModal?.provider?.toUpperCase()}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-white/5 space-y-1.5">
              <p className="font-semibold text-foreground">
                &ldquo;{restrictedTrackModal?.title}&rdquo; by {restrictedTrackModal?.artist}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {restrictedTrackModal?.licenseInfo?.notice ||
                  "Third-party commercial streaming catalogs provide 30-second previews and metadata for discovery only. Full audio extraction is prohibited under API terms of service."}
              </p>
            </div>
            <p className="text-muted-foreground">
              💡 For social video exports (TikTok, Reels, Shorts), we recommend using our **Jamendo CC licensed library** or uploading your own original audio tracks.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRestrictedTrackModal(null);
                setProvider("licensed");
              }}
              className="rounded-xl text-xs flex-1"
            >
              Browse Licensed Library
            </Button>
            <Button
              variant="gradient"
              onClick={handleProceedWithRestricted}
              className="rounded-xl font-bold text-xs flex-1"
            >
              Use Preview in Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


