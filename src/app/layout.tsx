import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alfa GT 1300 Junior — Modern Harness",
  description:
    "Reliability-refresh wiring harness reference for the Alfa Romeo Giulia GT 1300 Junior (10530).",
  // Reachable by link, but keep it out of search engines.
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/", label: "Overview" },
  { href: "/original", label: "Original" },
  { href: "/explorer", label: "Explorer" },
  { href: "/wires", label: "Wire schedule" },
  { href: "/fuses", label: "Fuses & relays" },
  { href: "/lengths", label: "Lengths" },
  { href: "/bom", label: "BOM" },
  { href: "/shopping", label: "Shopping list" },
  { href: "/compliance", label: "Compliance" },
  { href: "/build", label: "Build sheets" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="no-print border-b bg-panel sticky top-0 z-20">
            <div className="flex items-center gap-4 px-4 py-2.5">
              <Link href="/" className="flex items-center gap-2.5 shrink-0">
                <span className="w-2.5 h-6 rounded-sm bg-accent inline-block" />
                <span className="font-semibold tracking-tight">
                  Alfa GT 1300 Junior <span className="text-muted font-normal">· harness</span>
                </span>
              </Link>
              <nav className="flex flex-wrap gap-0.5 text-sm">
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="px-2.5 py-1 rounded text-muted hover:text-fg hover:bg-panel-2 transition-colors"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
          <footer className="no-print border-t text-xs text-muted px-4 py-3">
            Reliability-refresh harness · based on the factory diagram (owners manual #1490, 11/69) ·
            advisory only — verify against the car and Statens vegvesen.
          </footer>
        </div>
      </body>
    </html>
  );
}
