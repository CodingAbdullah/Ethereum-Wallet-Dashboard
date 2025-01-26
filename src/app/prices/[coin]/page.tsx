import GenericChartPage from "@/app/components/GenericChartPage";
import { coinValidator } from "@/app/utils/functions/coinValidator";
import CoinChartInfoType from "@/app/utils/types/CoinChartInfoType";
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Cryptocurrency Price",
    description: "Analyze a cryptocurrency based on recent market data"
}

// Displaying historical price information of a particular coin
export default async function CoinPriceInformationPage({ params }: { params: { coin: string }}) {
    const parameters = await params;
    const coin = parameters.coin;

    // Check validity of this coin by running a custom function validating if it exists within the Coin Gecko coin list
    const validateCoin: CoinChartInfoType = await coinValidator(coin);

    if (validateCoin) {
        // Render the Generic Chart Page componen if the coin ID is valid
        return (
            <div className="p-4 bg-gray-900 shadow-lg">
                <GenericChartPage 
                    data={{
                        id: coin,
                        name: validateCoin.name, 
                        symbol: validateCoin.symbol.toUpperCase(), 
                        market_data: {
                            current_price: validateCoin.market_data.current_price,
                            price_change_percentage_24h: validateCoin.market_data.price_change_percentage_24h
                        }
                    }} 
                />
            </div>
        )
    }   
    else {
        // Coin ID is not valid, therefore return the error page
        throw new Error();
    }
}

