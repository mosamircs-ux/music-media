"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { Button } from "@musicmotion/ui";

export function LanguageToggle() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = currentLocale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className="flex items-center gap-2 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
      title="Switch Language / تغيير اللغة"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-semibold uppercase">{currentLocale === "en" ? "العربية" : "English"}</span>
    </Button>
  );
}
