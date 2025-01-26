import { faCode, faChartLine, faBitcoinSign } from "@fortawesome/free-solid-svg-icons";
import AboutPageCardType from "../types/AboutPageCardType";

// Constants for working with About Page Card
export const AboutPageCardList: AboutPageCardType[] = [
    {
        icon: faCode,
        title: "Open Source",
        description: "Our project is continually growing and adding features as the blockchain space evolves. As such, the codebase will always be open source!",
        link: "https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard",
        linkText: "View Source Code"
    },
    {
        icon: faChartLine,
        title: "Live Updates",
        description: "Features are updated in real-time! Explore coin prices, ENS lookups, and information related to your wallet!",
        link: "/prices",
        linkText: "View Coin Prices"
    },
    {
        icon: faBitcoinSign,
        title: "Crypto APIs",
        description: "APIs are the main source of truth. They are verified and secure, meaning you don't have to worry about security!",
        link: "https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard/blob/main/README.md",
        linkText: "View the APIs"
    }
];