import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  webServer: process.env.CI
    ? [
        {
          command: 'npm run server',
          cwd: backendRoot,
          url: 'http://127.0.0.1:5000/api/health/ready',
          timeout: 120000,
          reuseExistingServer: false,
          env: {
            NODE_ENV: 'development',
            MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onix-ci-test',
            JWT_SECRET: process.env.JWT_SECRET || 'ci-test-jwt-secret-minimum-32-chars-long',
          },
        },
        {
          command: 'npm run dev -- --host 127.0.0.1 --port 5173',
          url: 'http://127.0.0.1:5173',
          timeout: 120000,
          reuseExistingServer: false,
        },
      ]
    : {
        command: 'npm run dev -- --host 127.0.0.1 --port 5173',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: true,
        timeout: 120000,
      },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
