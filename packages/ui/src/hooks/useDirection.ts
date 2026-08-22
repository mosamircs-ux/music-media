"use client";

import { useDirectionContext } from "../providers/DirectionProvider";

export function useDirection() {
  return useDirectionContext();
}
