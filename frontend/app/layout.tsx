import type { ReactNode } from "react";
import "./globals.css";
import { SeoProvider } from "../context/SeoContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SeoProvider>{children}</SeoProvider>
      </body>
    </html>
  );
}
