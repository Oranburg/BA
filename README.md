# BA: Law of the Firm — The Neon Edge

An interactive educational web application for the law course **Business Associations: Law of the Firm** by Professor Seth C. Oranburg. Built with React + Vite + Tailwind CSS.

## Features

- **Landing page** with hero section, Four Problems of the Firm, and 16-chapter curriculum roadmap
- **Interactive Toolkit** components:
  - **Fiduciary Shield Analyzer** — Business Judgment Rule tipping-point calculator
  - **Tome of Law** — Retrieve verbatim statutory text (RSA, RUPA, RULLCA, MBCA, DGCL, UVTA)
  - **Veil-Piercing Wall** — Drag-and-drop corporate veil integrity tester
  - **Investigation Desk** — Tabbed case file viewer (Zeeva v. Sammy)
  - **Mad-Libs Holding** — Build a court's holding with inline select menus
  - **Authority Matrix** — Classify agent actions by authority type (quiz)
- **Casebook Reader** with paragraph-level anchor deep-linking (`3689B` IDs)
- **Dark/light mode** toggle
- 16 chapter modules (ch01–ch16) covering Agency through Conclusion

## Tech Stack

- [Vite](https://vitejs.dev) + [React 19](https://react.dev)
- [Tailwind CSS v3](https://tailwindcss.com) with custom "Sprawl" design palette
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [react-router-dom](https://reactrouter.com)
- [@dnd-kit](https://dndkit.com) for drag-and-drop interactions

## Getting Started

```bash
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build
```

## Project Structure

```
src/
  components/
    layout/         # Navbar, MainLayout, ThemeContext
    toolkit/        # Interactive law toolkit components
  data/
    statutes/       # Statutory text database
    caselaw/        # Case law data (future)
  modules/
    ch01-why-law/   # Chapter stubs (ch01–ch16)
    ...
  pages/            # LandingPage
  reader/           # CasebookReader with para-ID anchors
```

## The Four Problems of the Firm

| Problem | Description | Key Chapters |
|---------|-------------|--------------|
| **Attribution** | Who is responsible for an agent's acts? | 2, 7 |
| **Governance** | Who controls the firm? | 5, 6, 9, 12, 13 |
| **Risk** | Who bears the firm's losses? | 3, 10, 15 |
| **Partitioning** | How are asset pools separated? | 4, 11, 14 |
