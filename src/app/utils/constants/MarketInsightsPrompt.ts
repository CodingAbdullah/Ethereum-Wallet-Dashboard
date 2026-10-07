// Constant for working and generated Market Insights data
export const MARKET_INSIGHTS_PROMPT = `Provide a detailed analysis with the following sections (use clear headers):

## SUMMARY
[Brief overview of current market conditions]

## BITCOIN ANALYSIS
[Detailed Bitcoin analysis]

## ETHEREUM ANALYSIS
[Detailed Ethereum analysis]

## OVERALL MARKET OVERVIEW
[General market trends and conditions]

## TRENDING COINS ANALYSIS
[Analysis of currently trending cryptocurrencies]

## TOP GAINERS ANALYSIS
[Analysis of top performing coins]

## DEFI & STABLECOINS
[DeFi value locked by chain, DEX volume and stablecoin supply]

## DERIVATIVES & STAKING
[ETH funding rates, open interest, options put/call ratio, and ETH staking ratio and yield]

## CONCLUSION
[Key takeaways and market outlook]

Make the analysis clear and insightful, and base every number on the data above. Describe conditions and risks; this is not financial advice, so don't tell readers what to buy or sell.`;