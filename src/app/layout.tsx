import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroSim - Stroke Clinical Decision Support",
  description: "AI-powered clinical decision support system for stroke care teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
