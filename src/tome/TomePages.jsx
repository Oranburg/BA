import { useParams } from "react-router-dom";
import TomeExperience from "./TomeExperience";
import TomeIndexPage from "./TomeIndexPage";

export function TomeHomePage() {
  return <TomeExperience />;
}

export function TomeDocPage() {
  const { docSlug } = useParams();
  return <TomeExperience key={`doc:${docSlug || "none"}`} />;
}

export function TomeSectionPage() {
  const { docSlug, articleSlug, sectionSlug } = useParams();
  return <TomeExperience key={`section:${docSlug || "none"}:${articleSlug || "none"}:${sectionSlug || "none"}`} />;
}

export { TomeIndexPage };
