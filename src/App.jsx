import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/layout/ThemeContext";
import MainLayout from "./components/layout/MainLayout";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import LandingPage from "./pages/LandingPage";
import SpaRedirectHandler from "./pages/SpaRedirectHandler";
import Ch01WhyLaw from "./modules/ch01-why-law/index";
import Ch02Agency from "./modules/ch02-agency/index";
import Ch03Partnership from "./modules/ch03-partnership/index";
import Ch05LLCs from "./modules/ch05-llcs/index";
import Ch07DAOs from "./modules/ch07-daos/index";
import Ch08EntitySelection from "./modules/ch08-entity-selection/index";
import Ch09FiduciaryDuties from "./modules/ch09-fiduciary-duties/index";
import Ch10StayingPrivate from "./modules/ch10-staying-private/index";
import Ch11GoingPublic from "./modules/ch11-going-public/index";
import Ch12ShareholderFranchise from "./modules/ch12-shareholder-franchise/index";
import Ch13MA from "./modules/ch13-m-and-a/index";
import Ch15CapitalStructure from "./modules/ch15-capital-structure/index";
import Ch16Conclusion from "./modules/ch16-conclusion/index";
import { TomeProvider } from "./tome/TomeContext";
import { TomeDocPage, TomeHomePage, TomeIndexPage, TomeSectionPage } from "./tome/TomePages";
import { APP_ROUTES } from "./routing/routes";
import HashRouteHandler from "./routing/HashRouteHandler";
import ScrollToTop from "./routing/ScrollToTop";

function Guarded({ label, children }) {
  return <ErrorBoundary label={label}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter basename="/BA/">
      <SpaRedirectHandler />
      <ScrollToTop />
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
                <Route path={APP_ROUTES.ch05LLCs} element={<Guarded label="Ch05 LLCs"><Ch05LLCs /></Guarded>} />
                <Route path={APP_ROUTES.ch07DAOs} element={<Guarded label="Ch07 DAOs"><Ch07DAOs /></Guarded>} />
                <Route path={APP_ROUTES.ch08EntitySelection} element={<Guarded label="Ch08 Entity Selection"><Ch08EntitySelection /></Guarded>} />
                <Route path={APP_ROUTES.ch09FiduciaryDuties} element={<Guarded label="Ch09 Fiduciary Duties"><Ch09FiduciaryDuties /></Guarded>} />
                <Route path={APP_ROUTES.ch10StayingPrivate} element={<Guarded label="Ch10 Staying Private"><Ch10StayingPrivate /></Guarded>} />
                <Route path={APP_ROUTES.ch11GoingPublic} element={<Guarded label="Ch11 Going Public"><Ch11GoingPublic /></Guarded>} />
                <Route path={APP_ROUTES.ch12ShareholderFranchise} element={<Guarded label="Ch12 Shareholder Franchise"><Ch12ShareholderFranchise /></Guarded>} />
                <Route path={APP_ROUTES.ch13MA} element={<Guarded label="Ch13 M&amp;A"><Ch13MA /></Guarded>} />
                <Route path={APP_ROUTES.ch15CapitalStructure} element={<Guarded label="Ch15 Capital Structure"><Ch15CapitalStructure /></Guarded>} />
                <Route path={APP_ROUTES.ch16Conclusion} element={<Guarded label="Ch16 Conclusion"><Ch16Conclusion /></Guarded>} />
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
