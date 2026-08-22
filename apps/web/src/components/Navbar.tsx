"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Music2, Sparkles, FolderKanban, PlusCircle } from "lucide-react";
import { Button } from "@musicmotion/ui";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const t = useTranslations("nav");
  const appT = useTranslations("app");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-md shadow-rose-500/20">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {appT("name")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              AI Video Creator
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("home")}
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Music2 className="h-4 w-4 text-rose-500" />
            {t("explore")}
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FolderKanban className="h-4 w-4 text-purple-500" />
            {t("projects")}
          </Link>
        </nav>

        {/* Actions & Toggles */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/editor/new">
            <Button
              variant="gradient"
              size="sm"
              className="hidden sm:inline-flex items-center gap-2 shadow-md shadow-rose-500/20 font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t("create")}</span>
              <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
