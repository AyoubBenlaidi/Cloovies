import type { Metadata, Viewport } from "next";
import "@fontsource-variable/figtree";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Club Cinoche",
    template: "%s · Club Cinoche",
  },
  description:
    "Club Cinoche n'est pas un catalogue de films. C'est un club privé : un rituel mensuel autour du cinéma, des votes, des émotions et des débats de fin de soirée.",
  applicationName: "Club Cinoche",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cinoche",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
