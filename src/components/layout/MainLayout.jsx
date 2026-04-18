import Navbar from "./Navbar";
import ErrorBoundary from "../ui/ErrorBoundary";
import TomePanel from "../../tome/TomePanel";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-sprawl-deep-blue transition-colors duration-300">
      <Navbar />
      <main className="pt-16">{children}</main>
      <ErrorBoundary label="Tome Panel">
        <TomePanel />
      </ErrorBoundary>
      <footer className="border-t border-sprawl-yellow/20 py-8 px-6 bg-sprawl-deep-blue">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-ui text-gray-500 text-sm">
            <a href="https://oranburg.law" className="text-gray-400 hover:text-sprawl-yellow transition-colors">oranburg.law</a>
            {" \u00b7 "}
            <a href="https://oranburg.law/courses/ba/" className="text-gray-400 hover:text-sprawl-yellow transition-colors">Course Page</a>
            {" \u00b7 "}
            <a href="https://oranburg.law/scholarship/" className="text-gray-400 hover:text-sprawl-yellow transition-colors">Scholarship</a>
          </p>
          <p className="font-ui text-gray-600 text-sm mt-2">
            &copy; 2026 Seth C. Oranburg. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
