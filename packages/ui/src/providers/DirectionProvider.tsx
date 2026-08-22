"use client";

import * as React from "react";
import type { Direction, Locale } from "@musicmotion/shared";
import { getDirection } from "@musicmotion/shared";

export interface DirectionContextValue {
  locale: Locale;
  direction: Direction;
  isRtl: boolean;
}

const DirectionContext = React.createContext<DirectionContextValue>({
  locale: "en",
  direction: "ltr",
  isRtl: false,
});

export interface DirectionProviderProps {
  locale: Locale;
  children: React.ReactNode;
}

export function DirectionProvider({ locale, children }: DirectionProviderProps) {
  const direction = getDirection(locale);
  const isRtl = direction === "rtl";

  React.useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [direction, locale]);

  return (
    <DirectionContext.Provider value={{ locale, direction, isRtl }}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirectionContext(): DirectionContextValue {
  return React.useContext(DirectionContext);
}
