import { useEffect } from "react";

export default function SpaRedirectHandler() {
  useEffect(() => {
    const query = window.location.search;
    if (!query.startsWith("?/")) return;

    const decoded = query
      .slice(2)
      .split("&")
      .map((segment) => segment.replace(/~and~/g, "&"))
      .join("?");
    const targetPath = decoded ? `/${decoded}` : "/";
    const target = `${targetPath}${window.location.hash || ""}`;
    window.history.replaceState(null, "", target);
  }, []);

  return null;
}
