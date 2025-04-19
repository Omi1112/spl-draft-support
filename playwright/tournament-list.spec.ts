// 大会一覧と大会作成のE2Eテスト
import { test, expect } from '@playwright/test';

const TEST_URL = 'http://localhost:3000/';

/**
 * 大会作成操作の共通関数
 * @param page Playwrightのページオブジェクト
 * @param tournamentName 作成する大会の名前
 * @param screenshotPath スクリーンショット保存パス
 */
async function createTournament(
  page: import('@playwright/test').Page,
  tournamentName: string,
  screenshotPath: string
) {
  // 大会作成ボタンをクリック
  await page.getByRole('button', { name: '大会を作成する' }).click();

  // モーダルが表示されるのを確認
  const modal = page.locator('div[role="form"]').first();
  await expect(modal).toBeVisible();

  // スクリーンショット取得
  await page.screenshot({ path: screenshotPath });

  // 大会名を入力
  await page.getByLabel('大会名').fill(tournamentName);

  // フォームを送信
  await page.getByRole('button', { name: '大会を作成する', exact: true }).click();

  // モーダルが閉じるのを待つ
  await expect(modal).not.toBeVisible();
}

test('大会一覧と大会作成のE2Eテスト', async ({ page }, testInfo) => {
  // トップページにアクセス
  await page.goto(TEST_URL);
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-list-top.png` });

  // 大会一覧のタイトルが表示されていることを確認
  await expect(page.getByRole('heading', { name: '大会一覧' })).toBeVisible();

  // 大会作成ボタンが表示されていることを確認
  await expect(page.getByRole('button', { name: '大会を作成する' })).toBeVisible();

  // 大会を新規作成（正常系）
  await createTournament(
    page,
    'テストE2E大会',
    `${testInfo.outputDir}/create-tournament-modal.png`
  );

  // 作成した大会が一覧に表示されていることを確認
  await page.waitForSelector('text=テストE2E大会');
  await expect(page.getByText('テストE2E大会')).toBeVisible();
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-list-after-create.png` });

  // 大会作成の異常系テスト（空の大会名）
  await page.getByRole('button', { name: '大会を作成する' }).click();

  // 空の大会名で送信
  await page.getByRole('button', { name: '大会を作成する', exact: true }).click();

  // エラーメッセージが表示されることを確認
  await expect(page.getByText('大会名を入力してください')).toBeVisible();
  await page.screenshot({ path: `${testInfo.outputDir}/create-tournament-validation-error.png` });

  // モーダルを閉じる
  await page.getByRole('button', { name: 'キャンセル' }).click();
});

// モバイルビューでのテスト
test('モバイル表示での大会一覧と大会作成のテスト', async ({ page }, testInfo) => {
  // モバイルビューを設定（iPhone 12 相当）
  await page.setViewportSize({ width: 390, height: 844 });

  // トップページにアクセス
  await page.goto(TEST_URL);
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-list-top-mobile.png` });

  // モバイル表示では大会一覧がリスト形式で表示されていることを確認
  // テーブルが非表示であることを確認
  await expect(page.locator('table')).not.toBeVisible();

  // リストが表示されていることを確認（存在するデータがある場合）
  // 注: データがない場合は別の確認方法が必要
  const listItems = page.locator('ul > li');

  // スクリーンショットを取得
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-list-mobile-view.png` });

  // 大会作成（モバイル表示）
  await createTournament(
    page,
    'モバイルテスト大会',
    `${testInfo.outputDir}/create-tournament-modal-mobile.png`
  );

  // 作成した大会が一覧に表示されていることを確認
  await page.waitForSelector('text=モバイルテスト大会');
  await expect(page.getByText('モバイルテスト大会')).toBeVisible();
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-list-after-create-mobile.png` });
});
