"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { Button, Card, CardContent, Input, Badge } from "@musicmotion/ui";
import { MOCK_TEMPLATES } from "@/lib/mockData";
import type { TemplateCategory } from "@musicmotion/shared";

export default function TemplatesPage() {
  const t = useTranslations("templates");

  const [selectedCategory, setSelectedCategory] = React.useState<TemplateCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: "all", label: t("all") },
    { id: "reels", label: t("reels") },
    { id: "lyrics", label: t("lyrics") },
    { id: "visualizer", label: t("visualizer") },
    { id: "podcast", label: t("podcast") },
    { id: "lofi", label: t("lofi") },
    { id: "cinematic", label: t("cinematic") },
  ];

  const filteredTemplates = MOCK_TEMPLATES.filter((tpl) => {
    const matchesCat = selectedCategory === "all" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent" className="px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          <span>Trending Creative Presets</span>
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("subtitle")}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by style, genre, or tag..."
            className="h-12 pl-11 rounded-2xl bg-card/80 border-white/10 text-xs shadow-lg"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => (
          <Card
            key={tpl.id}
            className="border-white/10 bg-card/60 hover:bg-card/90 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
          >
            <div className="aspect-[9/16] relative bg-secondary overflow-hidden max-h-[300px]">
              <img
                src={tpl.thumbnailUrl}
                alt={tpl.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <Badge variant="accent">{tpl.visualStyle}</Badge>
                {tpl.isTrending && (
                  <Badge variant="default" className="bg-rose-500 text-white text-[9px] font-bold">
                    🔥 Hot
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="bg-black/80 font-mono text-[10px]">
                  {tpl.defaultDuration}s
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground truncate">{tpl.title}</h3>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {tpl.rating}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {tpl.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>🎵 {tpl.musicGenre}</span>
                <span>{tpl.scenesCount} Scenes • {tpl.downloadsCount.toLocaleString()} uses</span>
              </div>

              <div className="pt-2">
                <Link href={`/create?template=${tpl.id}`}>
                  <Button variant="gradient" size="sm" className="w-full rounded-xl font-bold">
                    {t("useTemplate")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
