"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Check, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button, Card, Badge, Switch } from "@musicmotion/ui";
import { MOCK_PRICING_PLANS } from "@/lib/mockData";

export default function PricingPage() {
  const t = useTranslations("pricing");

  const [isAnnual, setIsAnnual] = React.useState(true);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const faqs = [
    {
      q: "How does the legal music licensing work?",
      a: "MusicMotion integrates directly with Jamendo API v3.0, granting you legal clearance to use tracks for personal and commercial video creations on social media platforms without copyright strikes.",
    },
    {
      q: "Can I upload and use my own audio tracks?",
      a: "Yes! On Creator Pro and Studio plans, you can upload any original MP3, WAV, or AAC audio file up to 50MB and use our WaveSurfer trimmer to generate AI scenes.",
    },
    {
      q: "How fast is video rendering?",
      a: "Our rendering pipeline runs on high-performance Remotion and BullMQ workers with FFmpeg. Typical 15-30 second reels export in under 20 seconds.",
    },
    {
      q: "Can I cancel or change my plan anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your account settings with zero penalties.",
    },
  ];

  const featureComparison = [
    { name: "Monthly AI Scene Credits", free: "30", pro: "300", studio: "1,200" },
    { name: "Export Resolution", free: "720p HD", pro: "1080p Full HD", studio: "4K Ultra HD" },
    { name: "Frame Rate", free: "30 FPS", pro: "60 FPS", studio: "60 FPS" },
    { name: "Watermark Removed", free: false, pro: true, studio: true },
    { name: "Custom Audio Uploads", free: false, pro: true, studio: true },
    { name: "All 9 AI Visual Styles", free: false, pro: true, studio: true },
    { name: "Commercial Jamendo License", free: false, pro: true, studio: true },
    { name: "Priority Render Queue", free: false, pro: true, studio: true },
    { name: "Team Seats", free: "1", pro: "1", studio: "5 Seats" },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent" className="px-3 py-1">
          <Zap className="h-3.5 w-3.5 mr-1" />
          <span>Flexible Creator Plans</span>
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("subtitle")}
        </p>

        {/* Monthly / Annual Switch */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-xs font-bold ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("monthly")}
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={`text-xs font-bold ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            {t("annual")}
          </span>
          <Badge variant="success" className="text-[10px]">{t("discount")}</Badge>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_PRICING_PLANS.map((plan) => {
          const price = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;
          return (
            <Card
              key={plan.id}
              className={`border-white/10 bg-card/60 p-6 sm:p-8 flex flex-col justify-between relative shadow-xl ${
                plan.isPopular
                  ? "border-rose-500/60 shadow-2xl shadow-rose-950/40 ring-1 ring-rose-500/40"
                  : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-rose-500 text-white font-bold uppercase text-[10px]">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black">${price}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-white/5 text-xs font-bold text-rose-400">
                  ⚡ {plan.creditsMonthly} AI Credits per month
                </div>

                <div className="border-t border-border/40 pt-4 space-y-3 text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-muted-foreground">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link href="/create">
                  <Button
                    variant={plan.isPopular ? "gradient" : "outline"}
                    className="w-full rounded-2xl font-bold py-6 text-sm"
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <section className="space-y-6 pt-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("featuresTitle")}
          </h2>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="p-4 font-bold text-foreground">Feature</th>
                <th className="p-4 font-bold text-foreground">Free Starter</th>
                <th className="p-4 font-bold text-rose-400">Creator Pro</th>
                <th className="p-4 font-bold text-purple-400">Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {featureComparison.map((row, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-medium text-foreground">{row.name}</td>
                  <td className="p-4 text-muted-foreground">
                    {typeof row.free === "boolean" ? (
                      row.free ? <Check className="h-4 w-4 text-emerald-400" /> : "—"
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="p-4 font-bold text-rose-300">
                    {typeof row.pro === "boolean" ? (
                      row.pro ? <Check className="h-4 w-4 text-emerald-400" /> : "—"
                    ) : (
                      row.pro
                    )}
                  </td>
                  <td className="p-4 font-bold text-purple-300">
                    {typeof row.studio === "boolean" ? (
                      row.studio ? <Check className="h-4 w-4 text-emerald-400" /> : "—"
                    ) : (
                      row.studio
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto space-y-6 pt-8 pb-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("faqTitle")}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-card/60 p-4 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex items-center justify-between w-full text-left font-bold text-xs sm:text-sm text-foreground"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-rose-400" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/40 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
