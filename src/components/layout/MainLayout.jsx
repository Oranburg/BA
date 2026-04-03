import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-sprawl-deep-blue transition-colors duration-300">
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="border-t border-sprawl-yellow/20 py-8 text-center">
        <p className="font-ui text-sm text-gray-500 dark:text-gray-400">
          © 2025 Professor Seth C. Oranburg · BA: Law of the Firm ·{" "}
          <span className="text-sprawl-yellow">The Neon Edge</span>
        </p>
      </footer>
    </div>
  );
}
