// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * PlaywrightのMCPテスト用設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリと出力ディレクトリ
  testDir: './playwright',

  // タイムアウト設定
  timeout: 10000, // 10秒

  // 並列実行設定
  fullyParallel: true,

  // 再試行設定
  retries: process.env.CI ? 2 : 0,

  // レポーター設定
  reporter: [
    ['html', { host: '0.0.0.0', port: '9323', outputFolder: './test-results/html-report' }],
    ['list'],
  ],

  // ブラウザごとのプロジェクト設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ウェブサーバー設定
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 600000, // 10分
  },

  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* 動画を撮る */
    video: 'on',
  },
});
