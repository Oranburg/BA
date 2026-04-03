import { useTheme } from "./ThemeContext";

export default function Navbar() {
  const { isDark, setIsDark } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sprawl-deep-blue/95 backdrop-blur border-b border-sprawl-yellow/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sprawl-yellow rounded flex items-center justify-center">
            <span className="font-headline font-bold text-sprawl-deep-blue text-sm">BA</span>
          </div>
          <div>
            <span className="font-headline font-bold text-sprawl-yellow uppercase tracking-wider text-sm sm:text-base">
              BA
            </span>
            <span className="font-headline text-white/70 uppercase tracking-wider text-sm sm:text-base ml-1">
              : Law of the Firm
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {["Reader", "Simulation Lab", "Toolkit", "Statutes"].map((item) => (
            <a
              key={item}
              href="#"
              className="font-headline text-white/70 hover:text-sprawl-yellow uppercase tracking-wider text-sm transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-sprawl-yellow/40 hover:border-sprawl-yellow text-sprawl-yellow hover:bg-sprawl-yellow/10 transition-all font-ui text-sm"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Light</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <span>Dark</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
