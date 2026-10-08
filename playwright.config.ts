import { defineConfig, devices } from "@playwright/test";

// End-to-end tests (npm run test:e2e). They need a production build (npm run build) and Foundry's anvil.
// The app runs against two local chains started by e2e/global-setup.ts (see e2e/chain.ts), never a real network.
const PORT = 3210;

export default defineConfig({
    testDir: './e2e',
    globalSetup: './e2e/global-setup.ts',
    fullyParallel: false,
    workers: 1,                     // the tests share the two local chains
    retries: process.env.CI ? 1 : 0,
    timeout: 90_000,
    reporter: process.env.CI ? [['github'], ['list']] : 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'retain-on-failure',
        // Use a preinstalled Chromium when PW_CHROMIUM_PATH is set (otherwise: npx playwright install chromium)
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 900 } } },
        { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ }
    ],
    webServer: {
        command: `npx next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
            ETH_RPC_URL: 'http://127.0.0.1:8645',
            RPC_URL_BASE: 'http://127.0.0.1:8646',
            // Every test runs from one IP; the default 120 requests/minute would throttle the suite
            API_RATE_LIMIT: '100000',
            // Signed-in features are tested with stubbed API responses, but AUTH_SECRET makes sign-in available
            AUTH_SECRET: 'e2e-test-secret-at-least-32-characters-long'
        }
    }
});
