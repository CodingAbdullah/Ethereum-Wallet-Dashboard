// Regenerates artifacts.json from the .sol files: npx -p solc@0.8.28 node e2e/contracts/compile.mjs
// (solc isn't a project dependency; the compiled output is committed so tests and CI don't need a compiler)
import fs from 'node:fs';
import { createRequire } from 'node:module';
const solc = createRequire(import.meta.url)('solc');
const dir = new URL('.', import.meta.url).pathname;
const sources = Object.fromEntries(['TestToken.sol', 'WETH.sol'].map(f => [f, { content: fs.readFileSync(dir + f, 'utf8') }]));
const out = JSON.parse(solc.compile(JSON.stringify({ language: 'Solidity', sources, settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'] } } } })));
if (out.errors?.some(e => e.severity === 'error')) throw new Error(JSON.stringify(out.errors, null, 2));
const pick = c => ({ abi: c.abi, bytecode: '0x' + c.evm.bytecode.object, deployedBytecode: '0x' + c.evm.deployedBytecode.object });
fs.writeFileSync(dir + 'artifacts.json', JSON.stringify({ TestToken: pick(out.contracts['TestToken.sol'].TestToken), WETH: pick(out.contracts['WETH.sol'].WETH) }) + '\n');
console.log('wrote artifacts.json');
