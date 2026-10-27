import type { Metadata } from "next";
import type { ReactNode } from "react";
import project from "../project.json";
import "./globals.css";

export const metadata: Metadata = { title: project.name };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
