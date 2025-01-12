// Generic Gas Metrics Type
export default interface GenericGasMetricsType {
    currentBlockNumber: string,
    maxPrice: number,
    msSinceLastBlock: number,
    network: string,
    system: string,
    unit: string
}