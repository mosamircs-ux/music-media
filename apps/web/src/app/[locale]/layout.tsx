import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider, DirectionProvider } from "@musicmotion/ui";
import { getDirection, type Locale } from "@musicmotion/shared";
import { Navbar } from "@/components/Navbar";
import "../globals.css";

export const metadata: Metadata = {
  title: "MusicMotion — Licensed Music to AI Viral Videos",
  description:
    "Transform legally licensed music into synchronized, high-impact vertical videos with AI visual scenes and animated captions.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const validLocale = locale as Locale;
  const messages = await getMessages();
  const dir = getDirection(validLocale);

  return (
    <html lang={validLocale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-rose-500 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <DirectionProvider locale={validLocale}>
            <NextIntlClientProvider messages={messages} locale={validLocale}>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
            </NextIntlClientProvider>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
