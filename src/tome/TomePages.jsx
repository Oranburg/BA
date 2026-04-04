import TomeCourseView from "./TomeCourseView";
import TomeDocReader from "./TomeDocReader";

export function TomeHomePage() {
  return <TomeCourseView />;
}

export function TomeDocPage() {
  return <TomeDocReader />;
}

export function TomeSectionPage() {
  return <TomeDocReader />;
}

export function TomeIndexPage() {
  return <TomeCourseView />;
}
