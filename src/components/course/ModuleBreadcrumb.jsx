import { Link } from "react-router-dom";
import { APP_ROUTES, HASH_TARGETS, getHomeHashLink } from "../../routing/routes";

export default function ModuleBreadcrumb({ chapterNum, title }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-ui text-sm text-gray-500 dark:text-gray-400 mb-4">
      <Link to={APP_ROUTES.home} className="hover:text-sprawl-yellow transition-colors">
        Home
      </Link>
      <span className="text-sprawl-yellow/40">›</span>
      <Link to={getHomeHashLink(HASH_TARGETS.courseMap)} className="hover:text-sprawl-yellow transition-colors">
        Chapters
      </Link>
      <span className="text-sprawl-yellow/40">›</span>
      <span className="text-gray-300">Ch {chapterNum}: {title}</span>
    </nav>
  );
}
