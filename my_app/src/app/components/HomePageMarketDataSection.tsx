'use client';

import useSWR from "swr";
import GenericFetcher from "../utils/functions/GenericFetcher";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

// Home Page Market Data Section Component
export default function HomePageMarketDataSection() {
    const { data: marketData, error: marketError, isLoading: marketDataLoading } = useSWR('api/global-market-data', GenericFetcher, { refreshInterval: 50000 });
    const { data: defiData, error: defiError, isLoading: defiLoading } = useSWR('api/global-defi-data', GenericFetcher, { refreshInterval: 50000 });

    // Conditionally render data
    if (marketError || defiError) {
        return <div>Error Loading Data...</div>
    }
    else if (marketDataLoading || defiLoading) {
        return <div>Loading Data...</div>
    }
    else {
        // Retrieve key information
        const marketTableData = marketData.information.data;
        const { data } = defiData;

        // Render data based on market information
        return (
            <div className="p-6 bg-gray-900 shadow-lg">
                <h2 className="text-2xl mb-6 text-gray-100 mx-auto">Market Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-100">Global Markets</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300">
                            <div className="space-y-2">
                                <p>Active Currencies: <span className="text-gray-100">{marketTableData.active_cryptocurrencies}</span></p>
                                <p>Number of Exchanges: <span className="text-gray-100">{marketTableData.markets}</span></p>
                                <p>Total Market Cap: <span className="text-gray-100">{"$" + Number(marketTableData.total_market_cap.usd).toFixed(2)}</span></p>
                                <p>Market Dominance: 
                                    <span className="text-gray-100"> BTC {Number(marketTableData.market_cap_percentage.btc).toFixed(2) + '%'} | ETH {Number(marketTableData.market_cap_percentage.eth).toFixed(2) + '%'}</span>
                                </p>
                                {
                                    marketTableData.market_cap_change_percentage_24h_usd < 0 ? 
                                        <p>24 Hour Market Cap % Change: 
                                            <span className="text-red-400">{Number(marketTableData.market_cap_change_percentage_24h_usd).toFixed(2) + '%'}</span>
                                        </p>
                                        :
                                        <p>24 Hour Market Cap % Change: 
                                            <span className="text-green-400">{Number(marketTableData.market_cap_change_percentage_24h_usd).toFixed(2) + '%'}</span>
                                        </p>
                                }
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-100">DeFi Markets</CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300">
                            <div className="space-y-2">
                                <p>DeFi Market Cap: <span className="text-gray-100">{"$" + Number(data.defi_market_cap).toFixed(2)}</span></p>
                                <p>ETH Market Cap: <span className="text-gray-100">{"$" + Number(data.eth_market_cap).toFixed(2)}</span></p>
                                <p>Trading Volume: <span className="text-gray-100">{"$" + Number(data.trading_volume_24h).toFixed(2)}</span></p>
                                <p>Top Coin Name: <span className="text-gray-100">{data.top_coin_name}</span></p>
                                <p>Top Coin DeFi Dominance: <span className="text-gray-100">{Number(data.top_coin_defi_dominance).toFixed(2) + '%'}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }
}