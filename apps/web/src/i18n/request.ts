import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "ar")) {
    locale = routing.defaultLocale;
  }

  // Load locale messages from shared package
  const messages =
    locale === "ar"
      ? (await import("@musicmotion/shared/i18n/messages/ar.json")).default
      : (await import("@musicmotion/shared/i18n/messages/en.json")).default;

  return {
    locale,
    messages,
  };
});
