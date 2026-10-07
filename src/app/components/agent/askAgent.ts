// Opens the "Ask ETH Dashboard" panel and sends a question (used by the Explain buttons)
export const ASK_EVENT = 'ask-eth-dashboard';

export function askAgent(prompt: string) {
    window.dispatchEvent(new CustomEvent<string>(ASK_EVENT, { detail: prompt }));
}
