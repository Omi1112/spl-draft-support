// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * PlaywrightのMCPテスト用設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリと出力ディレクトリ
  testDir: './playwright',
  outputDir: './playwright/test-results',

  // タイムアウト設定
  timeout: 60000, // 60秒

  // 並列実行設定
  fullyParallel: true,

  // 再試行設定
  retries: process.env.CI ? 2 : 0,

  // レポーター設定
  reporter: [['html', { outputFolder: './test-results/html-report' }], ['list']],

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
    timeout: 120000, // 2分
  },
});
