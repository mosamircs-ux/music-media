"use client";

import { useDirectionContext, type DirectionContextValue } from "../providers/DirectionProvider";

export function useDirection(): DirectionContextValue {
  return useDirectionContext();
}
