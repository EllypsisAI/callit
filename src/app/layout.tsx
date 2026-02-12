import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "CallIt — Forudsig, Konkurrér, Vind",
  description:
    "Brug dine calls til at forudsige resultaterne i dine yndlingsskaberes turneringer. Ingen rigtige penge — bare bragging rights.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await getCurrentUser();

  return (
    <html lang="da">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Sora:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavBar user={user} profile={profile} />
        {children}
      </body>
    </html>
  );
}
