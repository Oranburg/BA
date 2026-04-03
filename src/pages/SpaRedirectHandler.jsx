import { useEffect } from "react";

export default function SpaRedirectHandler() {
  useEffect(() => {
    const query = window.location.search;
    if (!query.startsWith("?/") || query.length <= 2) return;

    // 404 fallback encodes literal '&' as '~and~' so route/query separators remain parseable.
    const decoded = query.slice(2).replace(/~and~/g, "&");
    const [pathPart, ...searchParts] = decoded.split("&");
    const targetPath = pathPart ? `/${pathPart}` : "/";
    const targetSearch = searchParts.length ? `?${searchParts.join("&")}` : "";
    const target = `${targetPath}${targetSearch}${window.location.hash || ""}`;
    window.history.replaceState(null, "", target);
  }, []);

  return null;
}
