import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Flash Clinic | SaaS de Optimización Operativa para Médicos",
  description: "Detén la hemorragia financiera de tu clínica con el sistema inteligente de recuperación de citas y automatización de procesos.",
  keywords: ["CRM Médico", "Optimización de Clientes", "No-show Médicos", "SaaS para Clínicas", "Automatización Médica"],
  authors: [{ name: "Flash Clinic Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} antialiased selection:bg-sky-500/30 selection:text-sky-400`}>
        {children}
      </body>
    </html>
  );
}
