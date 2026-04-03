import { useEffect } from "react";

export default function SpaRedirectHandler() {
  useEffect(() => {
    const query = window.location.search;
    if (!query.startsWith("?/") || query.length <= 2) return;

    // 404 fallback encodes literal '&' as '~and~' so route/query separators remain parseable.
    const decoded = query.slice(2).replace(/~and~/g, "&");
    const firstAmpIndex = decoded.indexOf("&");
    const pathPart = firstAmpIndex === -1 ? decoded : decoded.slice(0, firstAmpIndex);
    const searchPart = firstAmpIndex === -1 ? "" : decoded.slice(firstAmpIndex + 1);
    const targetPath = pathPart ? `/${pathPart}` : "/";
    const targetSearch = searchPart ? `?${searchPart}` : "";
    const target = `${targetPath}${targetSearch}${window.location.hash || ""}`;
    window.history.replaceState(null, "", target);
  }, []);

  return null;
}
