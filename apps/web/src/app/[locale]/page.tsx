"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Music2,
  Sparkles,
  Video,
  AudioWaveform,
  Captions,
  ArrowRight,
  Play,
  Sliders,
  CheckCircle2,
  Quote,
  Check,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Switch } from "@musicmotion/ui";
import { MOCK_TEMPLATES, MOCK_TESTIMONIALS, MOCK_PRICING_PLANS } from "@/lib/mockData";
import * as React from "react";

export default function LandingPage() {
  const t = useTranslations("hero");
  const [isAnnual, setIsAnnual] = React.useState(true);

  const visualStyles = [
    { name: "Cinematic", desc: "Moody volumetric lighting, anamorphic lens flares, movie atmosphere", color: "from-blue-600 to-indigo-900" },
    { name: "Anime", desc: "Makoto Shinkai aesthetic, vibrant sky gradients, hand-drawn anime vibe", color: "from-pink-500 to-purple-600" },
    { name: "Realistic", desc: "Ultra-sharp photorealism, natural golden hour lighting, 8k depth", color: "from-amber-600 to-rose-700" },
    { name: "Dreamy", desc: "Soft pastel hues, ethereal fog, floating orbs, mystical aura", color: "from-purple-500 to-cyan-600" },
    { name: "Dark", desc: "High-contrast shadows, gothic neon glow, intense bass energy", color: "from-neutral-800 to-neutral-950" },
    { name: "Retro", desc: "VHS tape scanlines, 80s synth aesthetic, vintage film grain", color: "from-fuchsia-600 to-rose-500" },
    { name: "Fantasy", desc: "Magical crystals, enchanted forest biomes, mythical creatures", color: "from-emerald-600 to-teal-800" },
    { name: "Minimal", desc: "Clean geometric framing, monochrome elegance, Apple-style clarity", color: "from-slate-700 to-zinc-900" },
    { name: "Music Video", desc: "Dynamic stage lasers, strobe highlights, concert energy", color: "from-rose-600 to-violet-700" },
  ];

  const workflowSteps = [
    {
      step: "01",
      icon: Music2,
      title: "1. Select Licensed Track",
      desc: "Browse legal tracks via Jamendo API or upload your own audio files.",
      color: "from-rose-500 to-pink-600",
    },
    {
      step: "02",
      icon: AudioWaveform,
      title: "2. Waveform Trimming",
      desc: "Isolate the most energetic section with millisecond-accurate audio waveforms.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      step: "03",
      icon: Captions,
      title: "3. Animated Captions",
      desc: "Add viral pop, typewriter, or karaoke lyrics synchronized to the vocal beat.",
      color: "from-indigo-500 to-blue-600",
    },
    {
      step: "04",
      icon: Sparkles,
      title: "4. AI Visual Scenes",
      desc: "Prompt AI to generate vertical visuals matching your selected genre & mood.",
      color: "from-amber-500 to-rose-600",
    },
    {
      step: "05",
      icon: Sliders,
      title: "5. Transition & Sync",
      desc: "Fine-tune scene durations, motion zoom cuts, and color grades.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      step: "06",
      icon: Video,
      title: "6. Remotion MP4 Export",
      desc: "Render high-bitrate 9:16 vertical videos in background BullMQ queues.",
      color: "from-rose-600 to-violet-600",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Glowing Ambient Gradients */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 -z-10 w-[900px] h-[550px] bg-gradient-to-tr from-rose-500/15 via-purple-600/15 to-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="container mx-auto max-w-6xl px-4 pt-16 pb-20 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>{t("badge")}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl mx-auto leading-[1.05] mb-6">
          Turn Music Into{" "}
          <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Visual Stories
          </span>
        </h1>

        <p className="text-lg sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          {t("subtitle")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/create">
            <Button
              variant="gradient"
              size="lg"
              className="h-14 px-8 text-base font-bold shadow-xl shadow-rose-500/25 flex items-center gap-3 rounded-2xl"
            >
              <span>{t("cta")}</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/discover">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-semibold border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl"
            >
              <Music2 className="h-5 w-5 mr-2 text-rose-500" />
              <span>{t("secondaryCta")}</span>
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t("pill1")}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t("pill2")}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t("pill3")}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t("pill4")}
          </span>
        </div>
      </section>

      {/* 2. INTERACTIVE STUDIO SANDBOX BANNER */}
      <section className="container mx-auto max-w-5xl px-4 mb-28">
        <div className="relative rounded-3xl border border-white/15 bg-card/60 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-purple-950/40">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-semibold text-muted-foreground ml-2">
                MusicMotion Creative Suite — Remotion Live Sandbox
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="accent">9:16 Vertical Reel</Badge>
              <Badge variant="success">30 FPS 1080p</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Track Info & Waveform */}
            <div className="space-y-4 md:col-span-2">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Cyberpunk Horizon</h4>
                    <p className="text-xs text-muted-foreground">Alex Stoner • Jamendo Licensed CC</p>
                  </div>
                  <Badge variant="secondary">00:15 - 00:30 (15s Loop)</Badge>
                </div>

                {/* Simulated Waveform with Trimming Region */}
                <div className="h-20 w-full rounded-xl bg-background/80 border border-white/5 flex items-center justify-between px-3 gap-1 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-[25%] right-[45%] bg-rose-500/20 border-x-2 border-rose-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-rose-300 bg-black/70 px-2 py-0.5 rounded">
                      Selected Audio Section
                    </span>
                  </div>
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
                    Scene 1: Cyber City
                  </div>
                  <p className="text-[11px] text-muted-foreground">0.0s - 5.0s</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-white/5 text-center space-y-2">
                  <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-rose-900 to-pink-900 flex items-center justify-center text-xs font-semibold text-rose-200">
                    Scene 2: Neon Rider
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
                  <span>12:00</span>
                  <div className="h-2 w-8 bg-neutral-800 rounded-full" />
                  <span>5G</span>
                </div>

                {/* Animated Captions Mock */}
                <div className="text-center space-y-1">
                  <div className="inline-block bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-white font-extrabold text-xs shadow-lg animate-bounce">
                    TURN MUSIC INTO STORIES ⚡
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/60">
                  <span className="font-semibold">@musicmotion</span>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3 fill-current text-rose-500" />
                    <span>0:15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKFLOW SECTION (6 STEPS) */}
      <section className="container mx-auto max-w-6xl px-4 py-16 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="accent" className="mb-3">CREATION PIPELINE</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            How MusicMotion Works
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            From discovering legal music to rendering vertical viral videos with automated AI sync.
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
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. AI VISUAL STYLES SHOWCASE */}
      <section className="container mx-auto max-w-6xl px-4 py-16 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="success" className="mb-3">AI VISUAL ENGINE</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            9 Curated Visual Styles
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Switch styles with one click. Our AI prompt enhancer tailors lighting, camera angles, and textures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visualStyles.map((style) => (
            <div
              key={style.name}
              className="p-5 rounded-2xl border border-white/10 bg-secondary/30 hover:bg-secondary/60 transition-all space-y-3 group"
            >
              <div className={`h-24 w-full rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-inner`}>
                <span className="text-lg font-black text-white drop-shadow-md tracking-wider">
                  {style.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {style.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TEMPLATES SHOWCASE */}
      <section className="container mx-auto max-w-6xl px-4 py-16 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Badge variant="accent" className="mb-3">VIRAL TEMPLATES</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready-to-Use Video Presets
            </h2>
          </div>
          <Link href="/templates">
            <Button variant="outline" size="sm" className="rounded-xl border-white/10">
              <span>View All Templates</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TEMPLATES.slice(0, 3).map((tpl) => (
            <Card key={tpl.id} className="border-white/10 bg-card/60 overflow-hidden flex flex-col justify-between group">
              <div className="aspect-[9/16] relative bg-secondary overflow-hidden max-h-[300px]">
                <img
                  src={tpl.thumbnailUrl}
                  alt={tpl.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="accent">{tpl.visualStyle}</Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/70">{tpl.defaultDuration}s</Badge>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-base text-foreground">{tpl.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>
                <div className="pt-2">
                  <Link href={`/create?template=${tpl.id}`}>
                    <Button variant="gradient" size="sm" className="w-full rounded-xl font-bold">
                      Use Template
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="container mx-auto max-w-6xl px-4 py-16 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-3">CREATOR LOVE</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Trusted by 50,000+ Creators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TESTIMONIALS.map((test, i) => (
            <Card key={i} className="border-white/10 bg-card/40 p-6 flex flex-col justify-between space-y-4">
              <Quote className="h-6 w-6 text-rose-500/40" />
              <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;{test.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <img src={test.avatar} alt={test.author} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{test.author}</h4>
                  <p className="text-[10px] text-muted-foreground">{test.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. PRICING PREVIEW */}
      <section className="container mx-auto max-w-6xl px-4 py-16 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="accent" className="mb-3">TRANSPARENT PLANS</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Simple Pricing for Every Creator
          </h2>
          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-bold ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-xs font-bold ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
            </span>
            <Badge variant="success" className="text-[10px]">Save 20%</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;
            return (
              <Card
                key={plan.id}
                className={`border-white/10 bg-card/60 p-6 flex flex-col justify-between relative ${
                  plan.isPopular ? "border-rose-500/50 shadow-2xl shadow-rose-950/30 ring-1 ring-rose-500/40" : ""
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="bg-rose-500 text-white font-bold uppercase text-[10px]">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">${price}</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                  <div className="border-t border-border/40 pt-4 space-y-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-muted-foreground">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6">
                  <Link href="/pricing">
                    <Button
                      variant={plan.isPopular ? "gradient" : "outline"}
                      className="w-full rounded-xl font-bold"
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
