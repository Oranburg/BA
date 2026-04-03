import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/layout/ThemeContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import SpaRedirectHandler from "./pages/SpaRedirectHandler";
import Ch02Agency from "./modules/ch02-agency/index";
import Ch13MA from "./modules/ch13-m-and-a/index";
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
              <Route path="/ch13-m-and-a" element={<Ch13MA />} />
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
