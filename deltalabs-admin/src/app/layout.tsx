import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Delta Labs Admin Portal",
  description: "Enterprise administrative console for Delta Labs ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface-canvas text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
