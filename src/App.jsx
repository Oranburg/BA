import { ThemeProvider } from "./components/layout/ThemeContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <LandingPage />
      </MainLayout>
    </ThemeProvider>
  );
}
