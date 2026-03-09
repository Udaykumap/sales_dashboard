import type { Metadata } from "next";
import "./globals.css";
import "./layout.css";
import "./dashboard.css";
import "./pages.css";

export const metadata: Metadata = {
  title: "Sales Dashboard",
  description: "Sales management dashboard for admins and sales users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
