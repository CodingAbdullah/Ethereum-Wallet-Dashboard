import Link from 'next/link';
import HomeSearchBox from './components/HomeSearchBox';
import HomeStatRow from './components/HomeStatRow';
import HomeSummaryCards from './components/HomeSummaryCards';
import HomePageMarketDataSection from './components/HomePageMarketDataSection';
import HomePageGlobalMarketCapChart from './components/HomePageGlobalMarketCapChart';
import HomePageTrendingCoinsTable from './components/HomePageTrendingCoinsTable';
import HomePageTrendingCollectionsTable from './components/HomePageTrendingCollectionsTable';
import type { Metadata } from "next"

// Custom Metadata
export const metadata: Metadata = {
  title: { absolute: "Ethereum Dashboard" },
  description: "Live Ethereum data: wallets, tokens, DeFi, layer 2s, gas, supply, MEV and more"
}

// Home Page Custom Component
export default function HomePage() {

  // Return JSX for the Home Page component
  return (
    <div className="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 break-words">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
            Ethereum Dashboard
          </span>
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Wallets, tokens, DeFi and layer 2s in one place. Connect a wallet for <Link href="/me" className="underline">your own dashboard</Link>, or <Link href="/about" className="underline">learn more</Link>.
        </p>
        <HomeSearchBox />
      </div>

      <div className="container mx-auto w-full max-w-6xl mt-10 space-y-8">
        <HomeStatRow />
        <HomeSummaryCards />
      </div>

      <hr className='mt-10 border-gray-700' />
      <HomePageMarketDataSection />
      <HomePageGlobalMarketCapChart />
      <HomePageTrendingCoinsTable />
      <HomePageTrendingCollectionsTable />
    </div>
  )
}
