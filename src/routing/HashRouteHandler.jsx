import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MAX_SCROLL_ATTEMPTS = 10;
const RETRY_MS = 100;

function normalizeHash(hash = "") {
  return decodeURIComponent(hash.replace(/^#/, "")).trim();
}

function scrollToHashTarget(hashTarget) {
  if (!hashTarget) return false;
  const target = document.getElementById(hashTarget);
  if (!target) return false;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function HashRouteHandler() {
  const location = useLocation();

  useEffect(() => {
    const hashTarget = normalizeHash(location.hash);
    if (!hashTarget) return;

    let cancelled = false;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;

      attempts += 1;
      if (scrollToHashTarget(hashTarget)) return;

      if (attempts < MAX_SCROLL_ATTEMPTS) {
        setTimeout(tryScroll, RETRY_MS);
        return;
      }

      console.warn(`[routing] hash target not found: #${hashTarget}`);
    };

    tryScroll();

    return () => {
      cancelled = true;
    };
  }, [location.hash, location.pathname]);

  return null;
}
