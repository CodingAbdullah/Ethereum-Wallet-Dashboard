import EIPProtocolType from "../types/EIPProtocolType";

// Defining an array constant for various EIP Protocols
export const protocolsList: EIPProtocolType[] = [
    {
      id: "ERC20",
      title: "ERC20 - Token Standard",
      description: "Defines a common set of rules for creating and deploying fungible tokens on the Ethereum blockchain.",
      keyFeatures: "totalSupply, balanceOf, transfer, approve, allowance, and transferFrom.",
      link: "https://eips.ethereum.org/EIPS/eip-20"
    },
    {
      id: "ERC721",
      title: "ERC721 - Non-Fungible Token (NFT) Standard",
      description: "Specifies a standard for creating unique digital assets on the Ethereum blockchain.",
      keyFeatures: "ownerOf, safeTransferFrom, approve, getApproved, setApprovalForAll.",
      link: "https://eips.ethereum.org/EIPS/eip-721"
    },
    {
      id: "ERC1155",
      title: "ERC1155 - Multi-Token Standard",
      description: "Allows a single smart contract to represent multiple types of tokens, both fungible and non-fungible.",
      keyFeatures: "Single smart contract can handle both ERC20-like and ERC721-like tokens.",
      link: "https://eips.ethereum.org/EIPS/eip-1155"
    },
    {
      id: "ERC777",
      title: "ERC777 - Token Standard with Hooks",
      description: "Advanced version of the ERC20 standard that includes hooks, enabling more complex interactions with tokens.",
      keyFeatures: "Custom hooks, operators, more flexibility in token interactions.",
      link: "https://eips.ethereum.org/EIPS/eip-777"
    },
    {
      id: "ERC4626",
      title: "ERC4626 - Tokenized Vault Standard",
      description:
        "Defines a uniform interface for tokenized vaults, facilitating yield-bearing assets or financial products.",
      keyFeatures: "Simplifies interacting with yield-bearing tokens and vault protocols.",
      link: "https://eips.ethereum.org/EIPS/eip-4626"
    },
    {
      id: "EIP1559",
      title: "EIP-1559 - Fee Market Change for ETH 1.0 Chain",
      description:
        "Introduced a mechanism to burn part of the transaction fee, reducing ETH supply and making gas fees more predictable.",
      keyFeatures:
        "Introduces a base fee per transaction, burns part of the fee, and enables a more predictable gas fee system.",
      link: "https://eips.ethereum.org/EIPS/eip-1559"
    }
  ]