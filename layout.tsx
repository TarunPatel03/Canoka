import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canoka",
  description: "A simple student workspace for assignments, calendars, and notes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
