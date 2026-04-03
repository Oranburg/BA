import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/layout/ThemeContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import Ch02Agency from "./modules/ch02-agency/index";
import Ch13MA from "./modules/ch13-m-and-a/index";

export default function App() {
  return (
    <BrowserRouter basename="/BA/">
      <ThemeProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/ch02-agency" element={<Ch02Agency />} />
            <Route path="/ch13-m-and-a" element={<Ch13MA />} />
          </Routes>
        </MainLayout>
      </ThemeProvider>
    </BrowserRouter>
  );
}
