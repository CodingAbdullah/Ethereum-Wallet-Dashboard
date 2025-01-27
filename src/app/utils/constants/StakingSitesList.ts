import StakingSitesType from "../types/StakingSitesType";

// Defining an array constant for various Staking Sites
export const stakingSitesList: StakingSitesType[] = [
    {
      id: "beaconchain",
      title: "Beaconcha.in",
      description:
        "An Ethereum 2.0 beacon chain explorer that includes detailed stats on validators, staking rewards, and network activity.",
      website: "https://beaconcha.in"
    },
    {
      id: "etherscan",
      title: "Etherscan (ETH2 section)",
      description:
        "The Ethereum explorer that offers a dedicated section for Ethereum 2.0 staking, showing validator performance and block details.",
      website: "https://etherscan.io/eth2"
    },
    {
      id: "stakingrewards",
      title: "Staking Rewards",
      description:
        "A platform that tracks Ethereum staking rewards and provides insights into staking pools, validator performance, and more.",
      website: "https://www.stakingrewards.com"
    },
    {
      id: "rocketpool",
      title: "Rocket Pool",
      description:
        "A decentralized Ethereum staking platform with detailed stats on validators and the option to stake directly, offering a community-driven staking experience.",
      website: "https://rocketpool.net"
    },
    {
      id: "lido",
      title: "Lido",
      description:
        "Lido is a liquid staking solution for Ethereum, allowing users to stake ETH and get stETH in return, while offering insights into staking pools and validator performance.",
      website: "https://lido.fi"
    },
    {
      id: "myetherwallet",
      title: "Eth2 Staking (MyEtherWallet)",
      description:
        "MyEtherWallet's platform for Ethereum staking that allows users to learn about validator stats, staking rewards, and different staking options.",
      website: "https://www.myetherwallet.com"
    }
]