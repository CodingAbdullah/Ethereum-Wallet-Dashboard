import { spawn, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
    createPublicClient, createWalletClient, erc20Abi, http, maxUint256, parseAbi, parseEther, parseUnits,
    type Abi, type Address, type Chain, type Hex
} from "viem";
import { base, mainnet } from "viem/chains";

// Local test chains for the end-to-end tests. Each one is a blank anvil chain with the same chain ID as
// Ethereum or Base, set up with:
// - two test tokens (USDX, 6 decimals; DAIX, 18) and three approvals from the test wallet to revoke
// - WETH at its real address
// - the official Uniswap v3 build (npm artifacts) with a USDX/WETH pool, and QuoterV2 / SwapRouter02
//   copied to their real addresses, so the app's swap code runs unchanged
// Nothing touches a real network, so the tests are deterministic and need no RPC key.

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const artifacts = JSON.parse(fs.readFileSync(path.join(here, 'contracts/artifacts.json'), 'utf8')) as Record<'TestToken' | 'WETH', { abi: Abi; bytecode: Hex; deployedBytecode: Hex }>;
const uniswap = (p: string) => require('@uniswap/' + p) as { abi: Abi; bytecode: Hex };

// anvil's first default account: unlocked, so the node signs for it (no key in the browser)
export const ACCOUNT: Address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
export const SPENDER_1: Address = '0x1111111111111111111111111111111111111111';
export const SPENDER_2: Address = '0x2222222222222222222222222222222222222222';
export const RECIPIENT: Address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

export interface ChainFixture {
    chainId: number;
    rpc: string;
    usdx: Address;
    daix: Address;
    weth: Address;
    approvalTx: Hex;            // a mined transaction, for the lookup tests
}

const SETUP: Record<number, { chain: Chain; weth: Address; quoter: Address; router: Address }> = {
    1: { chain: mainnet, weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' },
    8453: { chain: base, weth: '0x4200000000000000000000000000000000000006', quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', router: '0x2626664c2603336E57B271c5C0b26F421741e481' }
};

export async function startAnvil(port: number, chainId: number): Promise<ChildProcess> {
    const anvil = spawn(process.env.ANVIL_BIN || 'anvil', ['--port', String(port), '--chain-id', String(chainId), '--silent'], { stdio: 'ignore' });
    const rpc = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) {
        try {
            const r = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }) });
            if (r.ok) return anvil;
        }
        catch { /* not up yet */ }
        await new Promise(r => setTimeout(r, 100));
    }
    anvil.kill();
    throw new Error(`anvil did not start on port ${port}. Install Foundry (https://getfoundry.sh) or set ANVIL_BIN.`);
}

const sqrt = (n: bigint): bigint => {
    if (n < BigInt(2)) return n;
    let x = n, y = (x + BigInt(1)) / BigInt(2);
    while (y < x) { x = y; y = (x + n / x) / BigInt(2); }
    return x;
};

export async function setupChain(port: number, chainId: number): Promise<ChainFixture> {
    const { chain, weth, quoter: realQuoter, router: realRouter } = SETUP[chainId];
    const rpc = `http://127.0.0.1:${port}`;
    const wallet = createWalletClient({ chain, transport: http(rpc), account: ACCOUNT });
    const pub = createPublicClient({ chain, transport: http(rpc) });
    const wait = async (hash: Hex) => {
        const receipt = await pub.waitForTransactionReceipt({ hash });
        if (receipt.status !== 'success') throw new Error('setup transaction reverted');
        return receipt;
    };
    const deploy = async (a: { abi: Abi; bytecode: Hex }, args: unknown[]) => (await wait(await wallet.deployContract({ abi: a.abi, bytecode: a.bytecode, args } as never))).contractAddress!;
    const write = async (address: Address, abi: Abi, functionName: string, args: unknown[] = [], value?: bigint) =>
        wait(await wallet.writeContract({ address, abi, functionName, args, value } as never));
    const setCode = (address: Address, code: Hex) => pub.request({ method: 'anvil_setCode' as never, params: [address, code] as never });

    // Tokens and approvals
    const usdx = await deploy(artifacts.TestToken, ['Test USD', 'USDX', 6, parseUnits('1000000', 6)]);
    const daix = await deploy(artifacts.TestToken, ['Test DAI', 'DAIX', 18, parseUnits('500000', 18)]);
    const { transactionHash: approvalTx } = await write(usdx, erc20Abi, 'approve', [SPENDER_1, maxUint256]);
    await write(daix, erc20Abi, 'approve', [SPENDER_2, parseUnits('1000', 18)]);
    await write(usdx, erc20Abi, 'approve', [SPENDER_2, maxUint256]);

    // WETH at its real address
    await setCode(weth, artifacts.WETH.deployedBytecode);

    // Uniswap v3 with a USDX/WETH pool at 3,000 USDX per WETH (0.05% fee), full-range liquidity
    const factory = await deploy(uniswap('v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'), []);
    const npm = uniswap('v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');
    const positions = await deploy(npm, [factory, weth, '0x0000000000000000000000000000000000000001']);
    const quoter = await deploy(uniswap('v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'), [factory, weth]);
    const router = await deploy(uniswap('swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json'), ['0x000000000000000000000000000000000000dEaD', factory, positions, weth]);
    const usdxFirst = usdx.toLowerCase() < weth.toLowerCase();
    const [token0, token1] = usdxFirst ? [usdx, weth] : [weth, usdx];
    // sqrtPriceX96 = sqrt(token1 raw per token0 raw) * 2^96
    const [num, den] = usdxFirst ? [BigInt(10) ** BigInt(18), BigInt(3000) * BigInt(10) ** BigInt(6)] : [BigInt(3000) * BigInt(10) ** BigInt(6), BigInt(10) ** BigInt(18)];
    await write(positions, npm.abi, 'createAndInitializePoolIfNecessary', [token0, token1, 500, sqrt(num * BigInt(2) ** BigInt(192) / den)]);
    await write(weth, parseAbi(['function deposit() payable']), 'deposit', [], parseEther('100'));
    for (const token of [weth, usdx]) await write(token, erc20Abi, 'approve', [positions, maxUint256]);
    const amounts: Record<string, bigint> = { [usdx.toLowerCase()]: parseUnits('300000', 6), [weth.toLowerCase()]: parseEther('100') };
    await write(positions, npm.abi, 'mint', [{
        token0, token1, fee: 500, tickLower: -887270, tickUpper: 887270,
        amount0Desired: amounts[token0.toLowerCase()], amount1Desired: amounts[token1.toLowerCase()],
        amount0Min: BigInt(0), amount1Min: BigInt(0), recipient: ACCOUNT, deadline: BigInt(2) ** BigInt(40)
    }]);
    // The quoter's and router's settings are immutables inside their code, so copying the code is enough
    for (const [from, to] of [[quoter, realQuoter], [router, realRouter]] as const) {
        await setCode(to, (await pub.getCode({ address: from }))!);
    }
    return { chainId, rpc, usdx, daix, weth, approvalTx };
}

export const readClient = (rpc: string) => createPublicClient({ transport: http(rpc) });
