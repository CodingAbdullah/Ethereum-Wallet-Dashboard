import type { Address } from "viem";
import type { ChainKey } from "../chains";

// Well-known contract addresses for the on-chain actions (safe in the browser)

// Wrapped native token per chain (WETH; WPOL on Polygon)
export const WRAPPED_NATIVE: Partial<Record<ChainKey, { address: Address; symbol: string }>> = {
    eth: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH' },
    base: { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
    optimism: { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
    arbitrum: { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH' },
    linea: { address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', symbol: 'WETH' },
    polygon: { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WPOL' },
    sepolia: { address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', symbol: 'WETH' }
};

// Liquid staking on Ethereum mainnet
export const LIDO_STETH: Address = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
export const ROCKET_RETH: Address = '0xae78736Cd615f374D3085123A210448E74Fc6393';

export interface KnownToken { address: Address; symbol: string; decimals: number }

// Common tokens offered as quick picks in Send and Swap (any other token can be pasted by address)
const USDC: Partial<Record<ChainKey, Address>> = {
    eth: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', linea: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff'
};
const USDT: Partial<Record<ChainKey, Address>> = {
    eth: '0xdAC17F958D2ee523a2206206994597C13D831ec7', arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
};
const DAI: Partial<Record<ChainKey, Address>> = {
    eth: '0x6B175474E89094C44Da98b954EedeAC495271d0F', base: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', arbitrum: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    optimism: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
};

export function commonTokens(chain: ChainKey): KnownToken[] {
    const list: KnownToken[] = [];
    if (USDC[chain]) list.push({ address: USDC[chain]!, symbol: 'USDC', decimals: 6 });
    if (USDT[chain]) list.push({ address: USDT[chain]!, symbol: 'USDT', decimals: 6 });
    if (DAI[chain]) list.push({ address: DAI[chain]!, symbol: 'DAI', decimals: 18 });
    const wrapped = WRAPPED_NATIVE[chain];
    if (wrapped) list.push({ ...wrapped, decimals: 18 });
    if (chain === 'eth') list.push({ address: LIDO_STETH, symbol: 'stETH', decimals: 18 }, { address: ROCKET_RETH, symbol: 'rETH', decimals: 18 });
    return list;
}
