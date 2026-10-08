import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from "next";
import MetricsNavbar from "./components/MetricsNavbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Script from "next/script";
import Providers from "./providers";
import ServiceWorker from "./components/ServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION = "Free Ethereum analytics: wallets, tokens, NFTs, DeFi, staking and layer 2s, with alerts, an AI assistant and safe, simulated transactions.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ethereumdashboard.dev"),
  title: { default: "Ethereum Dashboard", template: "%s · Ethereum Dashboard" },
  description: DESCRIPTION,
  applicationName: "Ethereum Dashboard",
  openGraph: { type: "website", siteName: "Ethereum Dashboard", title: "Ethereum Dashboard", description: DESCRIPTION, url: "/" },
  twitter: { card: "summary_large_image", title: "Ethereum Dashboard", description: DESCRIPTION },
  appleWebApp: { capable: true, title: "ETH Dashboard", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" }
};

export const viewport: Viewport = { themeColor: "#111827" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
            <MetricsNavbar />
            { children }
            <Analytics mode='production' />
            <ServiceWorker />
            <Script id="umami-analytics-scripts" 
              src={process.env.UMAMI_URL}
              data-website-id={process.env.UMAMI_DATA_WEBSITE_ID}>
            </Script>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
