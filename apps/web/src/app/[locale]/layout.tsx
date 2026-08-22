import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider, DirectionProvider } from "@musicmotion/ui";
import { getDirection, type Locale } from "@musicmotion/shared";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "../globals.css";

export const metadata: Metadata = {
  title: "MusicMotion — Turn Music Into Visual Stories",
  description:
    "Choose a song, select the exact moment, add captions, and generate an AI-powered music video with Remotion and licensed tracks.",
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
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-rose-500 selection:text-white flex flex-col">
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
                <Footer />
              </div>
            </NextIntlClientProvider>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
