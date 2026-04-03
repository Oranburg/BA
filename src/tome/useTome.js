import { useTomeContextInternal } from "./TomeContext";

export function useTome() {
  const ctx = useTomeContextInternal();
  if (!ctx) throw new Error("useTome must be used inside TomeProvider");
  return ctx;
}
