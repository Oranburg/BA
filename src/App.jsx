import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/layout/ThemeContext";
import MainLayout from "./components/layout/MainLayout";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import LandingPage from "./pages/LandingPage";
import SpaRedirectHandler from "./pages/SpaRedirectHandler";
import Ch01WhyLaw from "./modules/ch01-why-law/index";
import Ch02Agency from "./modules/ch02-agency/index";
import Ch03Partnership from "./modules/ch03-partnership/index";
import Ch08EntitySelection from "./modules/ch08-entity-selection/index";
import Ch09FiduciaryDuties from "./modules/ch09-fiduciary-duties/index";
import Ch12ShareholderFranchise from "./modules/ch12-shareholder-franchise/index";
import Ch13MA from "./modules/ch13-m-and-a/index";
import Ch15CapitalStructure from "./modules/ch15-capital-structure/index";
import { TomeProvider } from "./tome/TomeContext";
import { TomeDocPage, TomeHomePage, TomeIndexPage, TomeSectionPage } from "./tome/TomePages";
import { APP_ROUTES } from "./routing/routes";
import HashRouteHandler from "./routing/HashRouteHandler";

function Guarded({ label, children }) {
  return <ErrorBoundary label={label}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter basename="/BA/">
      <SpaRedirectHandler />
      <HashRouteHandler />
      <ThemeProvider>
        <TomeProvider>
          <MainLayout>
            <ErrorBoundary label="Application">
              <Routes>
                <Route path={APP_ROUTES.home} element={<Guarded label="Landing Page"><LandingPage /></Guarded>} />
                <Route path={APP_ROUTES.ch01WhyLaw} element={<Guarded label="Ch01 Why Law"><Ch01WhyLaw /></Guarded>} />
                <Route path={APP_ROUTES.ch02Agency} element={<Guarded label="Ch02 Agency"><Ch02Agency /></Guarded>} />
                <Route path={APP_ROUTES.ch03Partnership} element={<Guarded label="Ch03 Partnership"><Ch03Partnership /></Guarded>} />
                <Route path={APP_ROUTES.ch08EntitySelection} element={<Guarded label="Ch08 Entity Selection"><Ch08EntitySelection /></Guarded>} />
                <Route path={APP_ROUTES.ch09FiduciaryDuties} element={<Guarded label="Ch09 Fiduciary Duties"><Ch09FiduciaryDuties /></Guarded>} />
                <Route path={APP_ROUTES.ch12ShareholderFranchise} element={<Guarded label="Ch12 Shareholder Franchise"><Ch12ShareholderFranchise /></Guarded>} />
                <Route path={APP_ROUTES.ch13MA} element={<Guarded label="Ch13 M&amp;A"><Ch13MA /></Guarded>} />
                <Route path={APP_ROUTES.ch15CapitalStructure} element={<Guarded label="Ch15 Capital Structure"><Ch15CapitalStructure /></Guarded>} />
                <Route path={APP_ROUTES.tomeHome} element={<Guarded label="Tome"><TomeHomePage /></Guarded>} />
                <Route path={APP_ROUTES.tomeIndex} element={<Guarded label="Tome Index"><TomeIndexPage /></Guarded>} />
                <Route path={`${APP_ROUTES.tomeHome}/:docSlug`} element={<Guarded label="Tome Document"><TomeDocPage /></Guarded>} />
                <Route path={`${APP_ROUTES.tomeHome}/:docSlug/:articleSlug/:sectionSlug`} element={<Guarded label="Tome Section"><TomeSectionPage /></Guarded>} />
              </Routes>
            </ErrorBoundary>
          </MainLayout>
        </TomeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
