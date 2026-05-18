import N8NWorkflowType from "../types/N8NWorkflowType";

// Constants for working with N8N Workflow Cards
export const N8NWorkflowList: N8NWorkflowType[] = [
    {
        id: 1,
        title: "Market Summarizer Email",
        description: "Planned dashboard workflow that will pull Ethereum market data, trending coins, and top movers from this app's existing API routes and send a clean daily digest straight to your inbox.",
        keyFeatures: "Daily cron trigger, internal market + trending coin endpoints, summary formatter, transactional email delivery.",
        cryptoUseCase: "Skip the manual dashboard check — get a one-glance recap of ETH price, market cap, gainers, and losers delivered automatically each morning.",
        link: "https://n8n.io"
    }
];
