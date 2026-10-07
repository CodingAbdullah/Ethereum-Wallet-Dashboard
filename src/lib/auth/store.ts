import { createNonceStore } from "./nonce";

// One nonce store per server instance (Upstash-backed when configured, so instances share it)
export const nonceStore = createNonceStore();
