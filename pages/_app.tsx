import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CookieConsent from "@/components/analytics/CookieConsent";
import { trackPageView } from "@/lib/analytics/analytics";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <MainLayout>
      <Component {...pageProps} />
      <CookieConsent />
    </MainLayout>
  );
}
