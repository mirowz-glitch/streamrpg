import type { ReactNode } from "react";

interface CodexLayoutProps {
  sidebar: ReactNode;
  reader: ReactNode;
}

// Sprint Codex Framework — layout de tela dividida (estante + reader),
// mesma `.library-screen` de sempre, era repetida em LibraryBuilding/
// BestiaryBuilding/MuseumBuilding.
export function CodexLayout({ sidebar, reader }: CodexLayoutProps) {
  return (
    <div className="library-screen">
      {sidebar}
      {reader}
    </div>
  );
}
