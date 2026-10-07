import { unstable_cache } from "next/cache";
import { beacon } from "./providers/beacon";

const SLOTS_PER_EPOCH = 32;
const GWEI_PER_ETH = 1e9;

// Validator entry/exit queues from the standard Beacon API on a free public node.
// Replaces beaconcha.in, whose free API tier ended in May 2026.
export const getValidatorQueue = unstable_cache(async () => {
    const [deposits, exiting, header] = await Promise.all([
        beacon<{ data: { amount: string }[] }>('/eth/v1/beacon/states/head/pending_deposits'),
        beacon<{ data: unknown[] }>('/eth/v1/beacon/states/head/validators?status=active_exiting'),
        beacon<{ data: { header: { message: { slot: string } } } }>('/eth/v1/beacon/headers/head')
    ]);

    // Every active validator sits in exactly one committee per epoch, spread evenly over its 32 slots,
    // so one slot's committee sizes x 32 gives the active validator count without downloading the full set
    const slot = header.data.header.message.slot;
    const committees = await beacon<{ data: { validators: string[] }[] }>('/eth/v1/beacon/states/head/committees?slot=' + slot);
    const slotValidators = committees.data.reduce((total, committee) => total + committee.validators.length, 0);

    const pendingDepositEth = deposits.data.reduce((total, deposit) => total + Number(deposit.amount), 0) / GWEI_PER_ETH;

    return {
        information: {
            data: {
                pending_deposits: deposits.data.length,
                pending_deposit_eth: Math.round(pendingDepositEth),
                beaconchain_exiting: exiting.data.length,
                validatorscount: slotValidators * SLOTS_PER_EPOCH
            }
        }
    };
}, ['validator-queue'], { revalidate: 600 }); // Beacon responses are large, so refresh every 10 minutes

