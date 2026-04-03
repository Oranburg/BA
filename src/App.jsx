import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/layout/ThemeContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import SpaRedirectHandler from "./pages/SpaRedirectHandler";
import Ch02Agency from "./modules/ch02-agency/index";
import Ch08EntitySelection from "./modules/ch08-entity-selection/index";
import Ch09FiduciaryDuties from "./modules/ch09-fiduciary-duties/index";
import Ch12ShareholderFranchise from "./modules/ch12-shareholder-franchise/index";
import Ch13MA from "./modules/ch13-m-and-a/index";
import Ch15CapitalStructure from "./modules/ch15-capital-structure/index";
import { TomeProvider } from "./tome/TomeContext";
import { TomeDocPage, TomeHomePage, TomeIndexPage, TomeSectionPage } from "./tome/TomePages";
import { APP_ROUTES } from "./routing/routes";
import HashRouteHandler from "./routing/HashRouteHandler";

export default function App() {
  return (
    <BrowserRouter basename="/BA/">
      <SpaRedirectHandler />
      <HashRouteHandler />
      <ThemeProvider>
        <TomeProvider>
          <MainLayout>
            <Routes>
              <Route path={APP_ROUTES.home} element={<LandingPage />} />
              <Route path={APP_ROUTES.ch02Agency} element={<Ch02Agency />} />
              <Route path={APP_ROUTES.ch08EntitySelection} element={<Ch08EntitySelection />} />
              <Route path={APP_ROUTES.ch09FiduciaryDuties} element={<Ch09FiduciaryDuties />} />
              <Route path={APP_ROUTES.ch12ShareholderFranchise} element={<Ch12ShareholderFranchise />} />
              <Route path={APP_ROUTES.ch13MA} element={<Ch13MA />} />
              <Route path={APP_ROUTES.ch15CapitalStructure} element={<Ch15CapitalStructure />} />
              <Route path={APP_ROUTES.tomeHome} element={<TomeHomePage />} />
              <Route path={APP_ROUTES.tomeIndex} element={<TomeIndexPage />} />
              <Route path={`${APP_ROUTES.tomeHome}/:docSlug`} element={<TomeDocPage />} />
              <Route path={`${APP_ROUTES.tomeHome}/:docSlug/:articleSlug/:sectionSlug`} element={<TomeSectionPage />} />
            </Routes>
          </MainLayout>
        </TomeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
