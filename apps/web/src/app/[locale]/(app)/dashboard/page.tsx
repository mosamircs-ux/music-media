"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Plus,
  Coins,
  Video,
  HardDrive,
  Clock,
  ArrowRight,
  Play,
  Download,
  Share2,
  FolderKanban,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@musicmotion/ui";
import { MOCK_USER, MOCK_PROJECTS } from "@/lib/mockData";
import * as React from "react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  const storagePercentage = Math.round(
    (MOCK_USER.storageUsedBytes / MOCK_USER.storageLimitBytes) * 100
  );
  const creditsPercentage = Math.round(
    (MOCK_USER.creditsRemaining / MOCK_USER.creditsTotal) * 100
  );

  const completedProjects = MOCK_PROJECTS.filter((p) => p.status === "completed");
  const draftProjects = MOCK_PROJECTS.filter((p) => p.status !== "completed");

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-card border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">👋</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {t("welcome")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            You are on the <span className="font-bold text-rose-400 uppercase">{MOCK_USER.tier} Plan</span>. Ready to create your next viral AI music video?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/create">
            <Button variant="gradient" size="lg" className="rounded-2xl font-bold shadow-lg shadow-rose-500/25 gap-2">
              <Plus className="h-5 w-5" />
              <span>{t("createNew")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Credits */}
        <Card className="border-white/10 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("creditsRemaining")}</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">{MOCK_USER.creditsRemaining}</span>
            <span className="text-xs text-muted-foreground">/ {MOCK_USER.creditsTotal}</span>
          </div>
          <Progress value={creditsPercentage} />
        </Card>

        {/* Stat 2: Videos Exported */}
        <Card className="border-white/10 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("videosRendered")}</span>
            <Video className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">12</span>
            <span className="text-[10px] text-emerald-400 font-bold">+4 this week</span>
          </div>
          <div className="text-[10px] text-muted-foreground">1080p 60FPS Quality</div>
        </Card>

        {/* Stat 3: Cloud Storage */}
        <Card className="border-white/10 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("storageUsed")}</span>
            <HardDrive className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">4.0 GB</span>
            <span className="text-xs text-muted-foreground">/ 20 GB</span>
          </div>
          <Progress value={storagePercentage} />
        </Card>

        {/* Stat 4: Hours Saved */}
        <Card className="border-white/10 bg-card/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Editing Hours Saved</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">18.5 hrs</span>
            <span className="text-[10px] text-emerald-400 font-bold">~92% faster</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Automated AI sync & cuts</div>
        </Card>
      </div>

      {/* Recent Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold tracking-tight">{t("recentProjects")}</h2>
          </div>
          <Link href="/projects" className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1">
            <span>{t("viewAll")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_PROJECTS.map((proj) => (
            <Card key={proj.id} className="border-white/10 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={proj.status === "completed" ? "success" : "accent"}>
                    {proj.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Updated recently</span>
                </div>
                <CardTitle className="text-base font-bold mt-2">{proj.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 text-xs text-muted-foreground">
                  <span>🎵 {proj.trackSelection?.track?.title || "Custom Track"}</span>
                  <span className="font-semibold">{proj.videoConfig.duration}s • {proj.videoConfig.aspectRatio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/projects/${proj.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10">
                      Open Studio Editor
                    </Button>
                  </Link>
                  {proj.status === "completed" && (
                    <Button variant="gradient" size="sm" className="rounded-xl">
                      <Download className="h-4 w-4 mr-1" /> Export
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Generated Videos Gallery */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-rose-500" />
          <h2 className="text-xl font-bold tracking-tight">{t("generatedVideos")}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {completedProjects.map((proj) => (
            <Card key={proj.id} className="border-white/10 bg-card/60 overflow-hidden group">
              <div className="aspect-[9/16] relative bg-secondary overflow-hidden max-h-[320px]">
                <img
                  src={proj.thumbnailUrl}
                  alt={proj.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="gradient" size="icon" className="h-10 w-10 rounded-full">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </Button>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge variant="success">Rendered MP4</Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/80">{proj.videoConfig.duration}s</Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <h4 className="text-sm font-bold truncate">{proj.title}</h4>
                <div className="flex items-center justify-between pt-1">
                  <Button variant="outline" size="sm" className="rounded-lg text-xs border-white/10">
                    <Download className="h-3.5 w-3.5 mr-1" /> Download
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs">
                    <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Drafts & In Progress */}
      {draftProjects.length > 0 && (
        <section className="space-y-4 pb-8">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">{t("drafts")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftProjects.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{p.title}</h4>
                  <p className="text-xs text-muted-foreground">{p.scenes.length} AI Scenes • {p.videoConfig.duration}s</p>
                </div>
                <Link href={`/projects/${p.id}`}>
                  <Button variant="outline" size="sm" className="rounded-xl border-white/10 text-xs">
                    Resume
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
