import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from "next";
import MetricsNavbar from "./components/MetricsNavbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethereum Dashboard",
  description: "Powered by Next.js, lookup everything there is to know within the Ethereum ecosystem"
};

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
        <Navbar />
          <MetricsNavbar />
          { children }
          <Analytics mode='production' />
          <Script id="umami-analytics-scripts" 
            src={process.env.UMAMI_URL}
            data-website-id={process.env.UMAMI_DATA_WEBSITE_ID}>
          </Script>
        <Footer />
      </body>
    </html>
  );
}
