import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultra Personal Trainer",
  description:
    "Plataforma completa para personal trainers: capte, atenda, prescreva treinos e cobre seus alunos online.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
