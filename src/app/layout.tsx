import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNS Content Analyzer",
  description: "Optimize your short-form video content with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
