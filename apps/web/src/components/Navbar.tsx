"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  Music2,
  LayoutDashboard,
  Compass,
  PlusCircle,
  FolderKanban,
  LayoutTemplate,
  Coins,
  Settings,
  LogOut,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { Button, Avatar, Badge } from "@musicmotion/ui";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { MOCK_USER } from "@/lib/mockData";
import * as React from "react";

export function Navbar() {
  const t = useTranslations("nav");
  const appT = useTranslations("app");
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/discover", label: t("discover"), icon: Compass },
    { href: "/create", label: t("create"), icon: PlusCircle, isHighlight: true },
    { href: "/projects", label: t("projects"), icon: FolderKanban },
    { href: "/templates", label: t("templates"), icon: LayoutTemplate },
    { href: "/pricing", label: t("pricing"), icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-md shadow-rose-500/20">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {appT("name")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-rose-400 font-bold">
              Studio AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                  link.isHighlight
                    ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold shadow-md shadow-rose-500/20 hover:opacity-95"
                    : isActive
                    ? "bg-secondary text-foreground font-bold border border-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Credits & Toggles & User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Credits Widget */}
          <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-white/10 text-xs font-bold hover:bg-secondary transition-colors">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-amber-300">{MOCK_USER.creditsRemaining}</span>
            <span className="text-muted-foreground text-[10px]">credits</span>
          </Link>

          <LanguageToggle />
          <ThemeToggle />

          {/* User Profile Trigger & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-rose-500/40 transition-all focus:outline-none"
            >
              <Avatar src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} size="sm" fallback="AV" />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-border/40">
                    <p className="text-xs font-bold text-foreground truncate">{MOCK_USER.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{MOCK_USER.email}</p>
                    <Badge variant="accent" className="mt-1 text-[9px] uppercase px-2">
                      {MOCK_USER.tier} Plan
                    </Badge>
                  </div>
                  <div className="py-1 text-xs">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{t("dashboard")}</span>
                    </Link>
                    <Link
                      href="/projects"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      <FolderKanban className="h-4 w-4" />
                      <span>{t("projects")}</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t("settings")}</span>
                    </Link>
                    <div className="my-1 border-t border-border/40" />
                    <Link
                      href="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("logout")}</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden h-9 w-9 rounded-xl border-white/10 bg-white/5"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-secondary text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className="h-4 w-4 text-rose-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
