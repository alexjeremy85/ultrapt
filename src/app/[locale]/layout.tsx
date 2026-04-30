import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NavigationProgress } from "@/components/NavigationProgress";

export const metadata: Metadata = {
  title: "Ultra Personal Trainer",
  description:
    "Plataforma completa para personal trainers: capte, atenda, prescreva treinos e cobre seus alunos online.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ultra PT",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // viewportFit cover: deixa o conteudo ir pra debaixo do notch/dynamic
  // island. Combinado com env(safe-area-inset-*) nos elementos fixos,
  // evita corte no primeiro paint do iOS Safari.
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
