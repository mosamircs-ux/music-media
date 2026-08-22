"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  User,
  Sliders,
  CreditCard,
  Globe,
  Save,
  Check,
} from "lucide-react";
import {
  Button,
  Card,
  Input,
  Badge,
  Switch,
  Select,
  Avatar,
  Progress,
} from "@musicmotion/ui";
import { MOCK_USER } from "@/lib/mockData";
import { useRouter, usePathname } from "@/i18n/routing";
import type { VisualStyle, AspectRatio } from "@musicmotion/shared";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = React.useState<"profile" | "preferences" | "billing" | "localization">("profile");
  const [name, setName] = React.useState(MOCK_USER.name);
  const [email, setEmail] = React.useState(MOCK_USER.email);
  const [defaultStyle, setDefaultStyle] = React.useState<VisualStyle>("Cinematic");
  const [defaultAspect, setDefaultAspect] = React.useState<AspectRatio>("9:16");
  const [autoEnhance, setAutoEnhance] = React.useState(true);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "en" | "ar" });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your creator profile, video export defaults, billing and localization.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-1 p-2 rounded-2xl bg-card/60 border border-white/10">
          {[
            { id: "profile", label: t("profile"), icon: User },
            { id: "preferences", label: t("preferences"), icon: Sliders },
            { id: "billing", label: t("billing"), icon: CreditCard },
            { id: "localization", label: t("localization"), icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  isSelected
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Form Area */}
        <div className="md:col-span-8">
          <Card className="border-white/10 bg-card/60 p-6 shadow-xl">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar src={MOCK_USER.avatarUrl} alt={name} size="xl" fallback="AV" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{name}</h3>
                    <p className="text-xs text-muted-foreground">{email}</p>
                    <Badge variant="accent" className="mt-1 text-[9px] uppercase">
                      {MOCK_USER.tier} Plan
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">{t("name")}</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-xs bg-background/80" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">{t("email")}</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-10 text-xs bg-background/80" />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="gradient" className="rounded-xl font-bold gap-2">
                    {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    <span>{isSaved ? "Saved!" : t("saveChanges")}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "preferences" && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">{t("defaultStyle")}</label>
                    <Select
                      value={defaultStyle}
                      onChange={(val) => setDefaultStyle(val as VisualStyle)}
                      options={[
                        { value: "Cinematic", label: "Cinematic (Atmospheric)" },
                        { value: "Anime", label: "Anime (Vibrant Art)" },
                        { value: "Realistic", label: "Realistic (Photorealism)" },
                        { value: "Dreamy", label: "Dreamy (Soft Fantasy)" },
                        { value: "Dark", label: "Dark (Cyberpunk Glow)" },
                        { value: "Retro", label: "Retro (80s Synthwave)" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">{t("defaultAspect")}</label>
                    <Select
                      value={defaultAspect}
                      onChange={(val) => setDefaultAspect(val as AspectRatio)}
                      options={[
                        { value: "9:16", label: "9:16 Vertical Reel (TikTok/Instagram)" },
                        { value: "16:9", label: "16:9 Landscape (YouTube)" },
                        { value: "1:1", label: "1:1 Square (Feed)" },
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground">{t("promptEnhancer")}</span>
                      <p className="text-[11px] text-muted-foreground">Automatically enrich lyrics into 8k visual prompts</p>
                    </div>
                    <Switch checked={autoEnhance} onCheckedChange={setAutoEnhance} />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="gradient" className="rounded-xl font-bold gap-2">
                    {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    <span>{isSaved ? "Saved!" : t("saveChanges")}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* BILLING TAB */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-purple-950/40 border border-white/10 flex items-center justify-between">
                  <div>
                    <Badge variant="accent" className="uppercase font-bold text-[9px] mb-1">{MOCK_USER.tier} PLAN</Badge>
                    <h3 className="text-lg font-black text-foreground">$29 / month</h3>
                    <p className="text-xs text-muted-foreground">Next billing date: September 15, 2026</p>
                  </div>
                  <Button variant="gradient" size="sm" className="rounded-xl font-bold">
                    Upgrade Plan
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>AI Scene Credits Remaining</span>
                    <span className="font-bold text-rose-400">{MOCK_USER.creditsRemaining} / {MOCK_USER.creditsTotal}</span>
                  </div>
                  <Progress value={(MOCK_USER.creditsRemaining / MOCK_USER.creditsTotal) * 100} />
                </div>
              </div>
            )}

            {/* LOCALIZATION TAB */}
            {activeTab === "localization" && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground block">{t("language")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className={`p-4 rounded-2xl border text-left font-bold text-xs transition-all ${
                        locale === "en" ? "border-rose-500 bg-rose-500/10 text-rose-400" : "border-white/5 bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      🇺🇸 English (LTR)
                    </button>
                    <button
                      onClick={() => handleLanguageChange("ar")}
                      className={`p-4 rounded-2xl border text-right font-bold text-xs transition-all ${
                        locale === "ar" ? "border-rose-500 bg-rose-500/10 text-rose-400" : "border-white/5 bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      🇸🇦 العربية (RTL)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
