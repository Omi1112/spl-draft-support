// 大会一覧と大会作成のE2Eテスト
import { test, expect } from '@playwright/test';

const TEST_URL = 'http://localhost:3000/';

test('大会一覧と大会作成のE2Eテスト', async ({ page }, testInfo) => {
  await page.goto(TEST_URL);
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-list-top.png` });

  // 大会作成ボタンをクリック (data-testid を使用)
  await page.getByTestId('create-tournament-button').click();
  await expect(page.getByTestId('create-tournament-modal')).toBeVisible();
  await page.screenshot({ path: `${testInfo.outputDir}/create-tournament-modal.png` });

  // 大会名を入力 (data-testid を使用)
  await page.getByTestId('tournament-name-input').fill('新しいテスト大会');
  // 作成ボタンをクリック (data-testid を使用)
  await page.getByTestId('submit-create-tournament-button').click();

  // モーダルが閉じるのを待つ
  await expect(page.getByTestId('create-tournament-modal')).not.toBeVisible();

  // 新しい大会がリストに表示されるのを待つ (data-testid を使用)
  await expect(
    page.getByTestId(/tournament-row-.*/).filter({ hasText: '新しいテスト大会' })
  ).toBeVisible();
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-created.png`, fullPage: true });

  // 既存の大会へのリンクをクリック (data-testid を使用)
  // 最初の大会のリンクをクリックする例
  const firstTournamentLink = page.locator('[data-testid^="tournament-link-"]').first();
  await firstTournamentLink.click();

  // 大会詳細ページに遷移したことを確認（例：特定のテキストが表示されるか）
  await expect(page.getByText('参加者を追加')).toBeVisible(); // 詳細ページの要素を確認
  await page.screenshot({
    path: `${testInfo.outputDir}/tournament-detail-page.png`,
    fullPage: true,
  });
});

test('モバイル表示での大会一覧と大会作成のテスト', async ({ page }, testInfo) => {
  // モバイルビューを設定（iPhone SE サイズ）
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(TEST_URL);
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-list-top-mobile.png` });

  // 大会作成ボタンをクリック (data-testid を使用)
  await page.getByTestId('create-tournament-button').click();
  await expect(page.getByTestId('create-tournament-modal')).toBeVisible();
  await page.screenshot({ path: `${testInfo.outputDir}/create-tournament-modal-mobile.png` });

  // 大会名を入力 (data-testid を使用)
  await page.getByTestId('tournament-name-input').fill('モバイルテスト大会');
  // 作成ボタンをクリック (data-testid を使用)
  await page.getByTestId('submit-create-tournament-button').click();

  // モーダルが閉じるのを待つ
  await expect(page.getByTestId('create-tournament-modal')).not.toBeVisible();

  // 新しい大会がリストに表示されるのを待つ (data-testid を使用)
  await expect(
    page.getByTestId(/tournament-row-.*/).filter({ hasText: 'モバイルテスト大会' })
  ).toBeVisible();
  await page.screenshot({
    path: `${testInfo.outputDir}/tournament-created-mobile.png`,
    fullPage: true,
  });
});
