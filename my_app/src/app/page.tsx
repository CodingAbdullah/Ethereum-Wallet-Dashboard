import Link from 'next/link';
import { Button } from '../app/components/ui/button';
import HomePageWalletForm from './components/HomePageWalletForm';
import HomePageMarketDataSection from './components/HomePageMarketDataSection';
import HomePageGlobalMarketCapChart from './components/HomePageGlobalMarketCapChart';
import HomePageTrendingCoinsTable from './components/HomePageTrendingCoinsTable';

// Home Page Custom Component
export default function HomePage() {
  // Return JSX for the Home Page component
  return (
    <div className="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
      <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 text-center">
        DASHBOARD
      </h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg mb-8">
          Deep dive into wallet information, price action, and much more! Here is a link to all <b>EVM-compatible</b> chains and their IDs: <Link href="https://chainlist.org" target="_blank" rel="noreferrer" className="text-grey hover:text-silver-300 transition-colors"><b>ChainList. </b></Link> 
        </p>
        <HomePageWalletForm />
        <div className="mt-8 text-center">
          <label className="text-lg mb-2 block pt-3">Learn more</label>
          <Button className="bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105" asChild>
            <Link href="/about">About</Link>
          </Button>
        </div>
      </div>
      <hr className='mt-5' />
      <HomePageMarketDataSection />
      <HomePageGlobalMarketCapChart />
      <HomePageTrendingCoinsTable />
    </div>
  )
}