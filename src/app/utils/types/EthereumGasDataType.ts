// Custom Ethereum Gas Data Type
export default interface EthereumGasDataType {
    blockPrices: object[],
    currentBlockNumber: number,
    maxPrice: number,
    msSinceLastBlock: number,
    network: string,
    system: string,
    unit: string
}