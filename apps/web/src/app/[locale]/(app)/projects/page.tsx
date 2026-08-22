"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import {
  FolderKanban,
  Plus,
  Clock,
  Search,
  Download,
  Film,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Input } from "@musicmotion/ui";
import { MOCK_PROJECTS } from "@/lib/mockData";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredProjects = MOCK_PROJECTS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <FolderKanban className="h-7 w-7 text-purple-400" />
            <span>My Video Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage, duplicate, and export your AI music video creations.
          </p>
        </div>

        <Link href="/create">
          <Button variant="gradient" className="rounded-2xl font-bold shadow-lg shadow-rose-500/20 gap-2">
            <Plus className="h-4 w-4" />
            <span>New Video Project</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-card/60 border border-white/10 backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name..."
            className="pl-10 h-10 rounded-xl bg-background/60 text-xs border-white/10"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["all", "completed", "ready", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-2 border-white/15 bg-card/20 p-12 text-center rounded-3xl space-y-4">
          <Film className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No projects found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or start a new project.</p>
          </div>
          <Link href="/create">
            <Button variant="gradient" className="rounded-xl font-bold">
              Create First Video
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <Card
              key={p.id}
              className="border-white/10 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
            >
              {/* Thumbnail Container */}
              <div className="aspect-[9/16] relative bg-secondary overflow-hidden max-h-[220px]">
                <img
                  src={p.thumbnailUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"}
                  alt={p.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={p.status === "completed" ? "success" : "accent"}>
                    {p.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/80 font-mono text-[10px]">
                    {p.videoConfig.duration}s • {p.videoConfig.aspectRatio}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground truncate">{p.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    🎵 {p.trackSelection?.track?.title || "Original Audio"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> 2 hours ago
                  </span>
                  <span className="font-semibold text-rose-400">{p.scenes.length} AI Scenes</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/projects/${p.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs border-white/10">
                      Open Editor
                    </Button>
                  </Link>
                  {p.status === "completed" && (
                    <Button variant="gradient" size="sm" className="rounded-xl text-xs">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
