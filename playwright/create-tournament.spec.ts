// playwrightによる大会作成・参加者追加E2Eサンプル
// 日本語コメント付き
import { test, expect } from '@playwright/test';

const TEST_URL = 'http://localhost:3000/';
const SCREENSHOT_DIR = 'playwright/test-results/screenshots';

/**
 * 参加者を追加する共通処理
 * @param page PlaywrightのPageオブジェクト
 * @param name 参加者名
 * @param weapon 使用武器
 * @param xp XP値
 * @param screenshotPath スクリーンショット保存パス
 */
async function addParticipant(
  page: import('@playwright/test').Page,
  name: string,
  weapon: string,
  xp: string,
  screenshotPath: string
) {
  await page.getByText('参加者を追加').click();
  await page.getByLabel('名前').fill(name);
  await page.getByLabel('使用武器').fill(weapon);
  await page.getByLabel('XP').fill(xp);
  await page.screenshot({ path: screenshotPath });
  await page.getByText('追加する').click();
  // モーダルが閉じるのを待つ
  await expect(page.getByLabel('名前')).not.toBeVisible();
  // 追加した参加者がリストに表示されるのを待つ
  await expect(page.getByText(name)).toBeVisible();
}

test('大会作成と参加者追加のE2Eテスト', async ({ page }) => {
  await page.goto(TEST_URL);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/top.png` });
  await page.getByText('大会を作成する').click();
  await page.screenshot({ path: `${SCREENSHOT_DIR}/create-tournament.png` });
  await page.getByLabel('大会名').fill('テスト大会');
  await page.getByText('大会を作成する').click();
  await page.screenshot({ path: `${SCREENSHOT_DIR}/tournament-detail.png` });

  // 1人目
  await addParticipant(
    page,
    'テスト参加者1',
    'シューター',
    '2000',
    `${SCREENSHOT_DIR}/add-participant1.png`
  );
  // 2人目
  await addParticipant(
    page,
    'テスト参加者2',
    'チャージャー',
    '1800',
    `${SCREENSHOT_DIR}/add-participant2.png`
  );
  // 3人目
  await addParticipant(
    page,
    'テスト参加者3',
    'ローラー',
    '1500',
    `${SCREENSHOT_DIR}/add-participant3.png`
  );

  // 参加者一覧に3名が表示されていることを確認
  await expect(page.getByText('テスト参加者1')).toBeVisible();
  await expect(page.getByText('テスト参加者2')).toBeVisible();
  await expect(page.getByText('テスト参加者3')).toBeVisible();
  await page.screenshot({ path: `${SCREENSHOT_DIR}/participant-list.png`, fullPage: true });
});
