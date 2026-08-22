"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Music2,
  Sparkles,
  Layers,
  Video,
  AudioWaveform,
  Captions,
  ShieldCheck,
  ArrowRight,
  Play,
  Share2,
  Sliders,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@musicmotion/ui";

export default function LandingPage() {
  const t = useTranslations("app");
  const commonT = useTranslations("common");
  const musicT = useTranslations("music");
  const captionsT = useTranslations("captions");
  const scenesT = useTranslations("scenes");

  const workflowSteps = [
    {
      step: "01",
      icon: Music2,
      title: "Licensed Music Discovery",
      desc: "Search legal tracks via Jamendo API or upload your own audio with full license integrity.",
      color: "from-rose-500 to-pink-600",
    },
    {
      step: "02",
      icon: AudioWaveform,
      title: "Waveform Trimming",
      desc: "Select the most energetic 15s to 60s section with millisecond-precise audio waveforms.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      step: "03",
      icon: Captions,
      title: "Animated Captions",
      desc: "Add viral pop/karaoke captions with customizable fonts, colors, and timing.",
      color: "from-indigo-500 to-blue-600",
    },
    {
      step: "04",
      icon: Sparkles,
      title: "AI Visual Scenes",
      desc: "Prompt AI to generate thematic high-res vertical visuals matching your music vibe.",
      color: "from-amber-500 to-rose-600",
    },
    {
      step: "05",
      icon: Sliders,
      title: "Timeline Sync & Transitions",
      desc: "Align visual cuts, fade transitions, and text animations directly on the timeline.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      step: "06",
      icon: Video,
      title: "Remotion Video Export",
      desc: "Render high-resolution 9:16 vertical MP4s asynchronously via BullMQ & Redis queues.",
      color: "from-rose-600 to-violet-600",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Glowing Gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[500px] bg-gradient-to-tr from-rose-500/15 via-purple-600/15 to-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Legal & Licensed Music Provider Abstraction</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Turn Licensed Music Into{" "}
          <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            AI-Powered Viral Videos
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("tagline")}. Search tracks, trim waveform clips, generate thematic AI scenes, style kinetic captions, and export studio-quality 9:16 videos with Remotion.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/editor/new">
            <Button
              variant="gradient"
              size="lg"
              className="h-14 px-8 text-base font-bold shadow-xl shadow-rose-500/25 flex items-center gap-3 rounded-xl"
            >
              <span>Launch Studio Editor</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-medium border-white/10 bg-white/5 hover:bg-white/10 rounded-xl"
            >
              <Music2 className="h-5 w-5 mr-2 text-rose-500" />
              <span>Browse Music Library</span>
            </Button>
          </Link>
        </div>

        {/* Feature Pill Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Jamendo & Upload Audio
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> WaveSurfer.js Precision Trimming
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Remotion 4.x Video Engine
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> English & Arabic RTL
          </span>
        </div>
      </section>

      {/* Interactive Studio Mockup Banner */}
      <section className="container mx-auto max-w-5xl px-4 mb-24">
        <div className="relative rounded-3xl border border-white/15 bg-card/60 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-purple-950/40">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-semibold text-muted-foreground ml-2">
                MusicMotion Studio — Live Composition Sandbox
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="accent">9:16 Vertical Reel</Badge>
              <Badge variant="success">30 FPS</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Track Info & Waveform */}
            <div className="space-y-4 md:col-span-2">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Cyberpunk Horizon</h4>
                    <p className="text-xs text-muted-foreground">Neon Pulse • Jamendo Licensed CC</p>
                  </div>
                  <Badge variant="secondary">00:15 - 00:30 (15s)</Badge>
                </div>

                {/* Simulated Waveform with Trimming Region */}
                <div className="h-20 w-full rounded-xl bg-background/80 border border-white/5 flex items-center justify-between px-3 gap-1 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-[25%] right-[45%] bg-rose-500/20 border-x-2 border-rose-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-rose-300 bg-black/60 px-2 py-0.5 rounded">
                      Selected Loop
                    </span>
                  </div>
                  {/* Waveform Bars */}
                  {Array.from({ length: 48 }).map((_, i) => {
                    const height = 15 + Math.sin(i * 0.4) * 25 + Math.random() * 20;
                    const isActive = i >= 12 && i <= 26;
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all ${
                          isActive ? "bg-rose-500" : "bg-muted-foreground/30"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* AI Scenes Grid Preview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-secondary/40 border border-white/5 text-center space-y-2">
                  <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center text-xs font-semibold text-purple-200">
                    Scene 1: Neon City
                  </div>
                  <p className="text-[11px] text-muted-foreground">0.0s - 5.0s</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-white/5 text-center space-y-2">
                  <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-rose-900 to-pink-900 flex items-center justify-center text-xs font-semibold text-rose-200">
                    Scene 2: Cyber Rider
                  </div>
                  <p className="text-[11px] text-muted-foreground">5.0s - 10.0s</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-white/5 text-center space-y-2">
                  <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center text-xs font-semibold text-emerald-200">
                    Scene 3: Hologram
                  </div>
                  <p className="text-[11px] text-muted-foreground">10.0s - 15.0s</p>
                </div>
              </div>
            </div>

            {/* Right Column: Remotion Live Phone Preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 border border-white/5">
              <div className="relative aspect-[9/16] w-full max-w-[220px] rounded-3xl bg-black border-4 border-neutral-800 shadow-2xl overflow-hidden flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-[10px] text-white/70">
                  <span>9:41</span>
                  <div className="h-2 w-8 bg-neutral-800 rounded-full" />
                  <span>5G</span>
                </div>

                {/* Animated Captions Mock */}
                <div className="text-center space-y-1">
                  <div className="inline-block bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-white font-extrabold text-xs shadow-lg">
                    FEEL THE BEAT ⚡
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/60">
                  <span className="font-semibold">@musicmotion</span>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3 fill-current" />
                    <span>0:15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Workflow Section */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            From Licensed Music to Finished Video in Seconds
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Every step designed for creator speed, legal compliance, and high visual engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.step}
                className="group relative overflow-hidden border-white/10 bg-card/40 hover:bg-card/70 transition-all hover:shadow-xl hover:shadow-purple-950/20"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
