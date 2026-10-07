import { providerFetch } from "./http";

// Ethplorer API, free with the public "freekey" key or a free personal key
// (https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API)
const ETHPLORER_URL = 'https://api.ethplorer.io';

export function ethplorer<T>(path: string, revalidate: number = 3600): Promise<T> {
    const separator = path.includes('?') ? '&' : '?';
    return providerFetch<T>('Ethplorer', ETHPLORER_URL + path + separator + 'apiKey=' + (process.env.ETHPLORER_API_KEY || 'freekey'), { revalidate });
}
