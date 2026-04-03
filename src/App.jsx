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

export default function App() {
  return (
    <BrowserRouter basename="/BA/">
      <SpaRedirectHandler />
      <ThemeProvider>
        <TomeProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/ch02-agency" element={<Ch02Agency />} />
              <Route path="/ch08-entity-selection" element={<Ch08EntitySelection />} />
              <Route path="/ch09-fiduciary-duties" element={<Ch09FiduciaryDuties />} />
              <Route path="/ch12-shareholder-franchise" element={<Ch12ShareholderFranchise />} />
              <Route path="/ch13-m-and-a" element={<Ch13MA />} />
              <Route path="/ch15-capital-structure" element={<Ch15CapitalStructure />} />
              <Route path="/tome" element={<TomeHomePage />} />
              <Route path="/tome/index" element={<TomeIndexPage />} />
              <Route path="/tome/:docSlug" element={<TomeDocPage />} />
              <Route path="/tome/:docSlug/:articleSlug/:sectionSlug" element={<TomeSectionPage />} />
            </Routes>
          </MainLayout>
        </TomeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
