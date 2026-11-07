import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider, ToastProvider } from "@/lib/store";
import { UIProvider } from "@/lib/ui-state";
import { Suspense } from "react";
import { Header, HeaderFallback } from "@/components/Header";
import { CookieBar } from "@/components/CookieBar";
import { Analytics } from "@/components/Analytics";
import { Toasts } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Teodo – sledovanie cien inzerátov", template: "%s · Teodo" },
  description: "Vlož odkaz na inzerát z bazára. Teodo postráži jeho cenu a dá ti vedieť, keď zlacnie, zdražie alebo zmizne.",
  applicationName: "Teodo",
};

export const viewport: Viewport = {
  themeColor: "#101217",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- jediný font celej aplikácie */}
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          <UIProvider>
            <ToastProvider>
              <div className="t-page">
                <Suspense fallback={<HeaderFallback />}>
                  <Header />
                </Suspense>
                {children}
              </div>
              <CookieBar />
              <Analytics />
              <Toasts />
            </ToastProvider>
          </UIProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
