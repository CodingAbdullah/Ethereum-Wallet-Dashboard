'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from "../../../../components/ui/button";

// Custom Error Page for the Trending Collections Pages
export default function TrendingCollectionsPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  // Render Custom Error Page for Trending Collections
  return (
    <div className="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-100 mb-4">Invalid Collection</h1>
        <p className="text-xl text-gray-400 mb-8">
          We are having trouble retrieving the data of this particular NFT collection. This could be due to network issues or an invalid collection ID. 
          <br />
          <b>If a collection is not deployed on Ethereum, we cannot provide information for it at this time.</b>
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            asChild
            variant="outline"
            className="inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-900 hover:bg-gray-800 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-600 transition-colors duration-200"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}