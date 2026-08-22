"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { FolderKanban, Plus, Video, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@musicmotion/ui";

export default function ProjectsPage() {
  const t = useTranslations("nav");
  const commonT = useTranslations("common");

  const mockProjects = [
    {
      id: "proj-1",
      title: "Cyberpunk Night Drive",
      status: "ready",
      trackName: "Neon Cyberpunk Drift",
      duration: "15s",
      aspectRatio: "9:16",
      updatedAt: "2 hours ago",
    },
    {
      id: "proj-2",
      title: "Lo-Fi Coding Beats Reel",
      status: "completed",
      trackName: "Lo-Fi Midnight Chill",
      duration: "30s",
      aspectRatio: "9:16",
      updatedAt: "Yesterday",
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-purple-500" />
            <span>{t("projects")}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your AI music video creations, drafts, and rendered exports.
          </p>
        </div>

        <Link href="/editor/new">
          <Button variant="gradient" className="rounded-xl font-semibold gap-2">
            <Plus className="h-4 w-4" />
            <span>{t("create")}</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockProjects.map((p) => (
          <Card
            key={p.id}
            className="border-white/10 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={p.status === "completed" ? "success" : "accent"}>
                  {p.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {p.updatedAt}
                </span>
              </div>
              <CardTitle className="text-lg font-bold mt-2">{p.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl">
                <span>🎵 {p.trackName}</span>
                <span className="font-semibold">{p.duration} • {p.aspectRatio}</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link href={`/editor/${p.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full rounded-lg border-white/10">
                    Open Editor
                  </Button>
                </Link>
                {p.status === "completed" && (
                  <Button variant="secondary" size="sm" className="rounded-lg">
                    <Video className="h-4 w-4 mr-1.5" /> Download MP4
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
