"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Music2, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const appT = useTranslations("app");

  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-xl mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-md shadow-rose-500/20">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {appT("name")}
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              {appT("tagline")}. Engineered with Next.js 16, Remotion, WaveSurfer.js, and pluggable AI providers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Legal Music Provider Abstraction</span>
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/create" className="hover:text-foreground transition-colors">
                  Creative Studio
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-foreground transition-colors">
                  Licensed Music Library
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-foreground transition-colors">
                  Video Templates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Creator Plans & Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-foreground transition-colors">
                  Project Management
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-foreground transition-colors">
                  Studio Settings
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/60">Jamendo API Cleared</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Tech */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Legal & Tech</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="hover:text-foreground cursor-pointer transition-colors">
                  Commercial Licensing
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer transition-colors">
                  Remotion 4.x Video Stack
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MusicMotion Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted for visual storytellers with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>and AI motion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
