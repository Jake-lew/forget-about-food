import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forget About Food — Meal Planning Made Effortless",
  description:
    "AI-powered weekly meal planning with smart shopping lists, budget tracking, and meal prep guidance. Stop stressing about what's for dinner.",
  openGraph: {
    title: "Forget About Food",
    description: "Your week. Your meals. Zero stress.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
