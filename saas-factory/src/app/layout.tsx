import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flash Clinic V3",
  description: "Motor de Adquisición Médica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
