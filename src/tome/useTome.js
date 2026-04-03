import { useContext } from "react";
import TomeContext from "./context";

export function useTome() {
  const ctx = useContext(TomeContext);
  if (!ctx) throw new Error("useTome must be used inside TomeProvider");
  return ctx;
}
