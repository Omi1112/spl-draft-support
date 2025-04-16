// playwrightによる大会作成・参加者追加E2Eサンプル
// 日本語コメント付き
import { test, expect } from '@playwright/test';

const TEST_URL = 'http://localhost:3000/';

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

test('大会作成と参加者追加のE2Eテスト', async ({ page }, testInfo) => {
  // スクリーンショット保存先は testInfo.outputDir を直接利用
  await page.goto(TEST_URL);
  await page.screenshot({ path: `${testInfo.outputDir}/top.png` });
  await page.getByText('大会を作成する').click();
  await page.screenshot({ path: `${testInfo.outputDir}/create-tournament.png` });
  await page.getByLabel('大会名').fill('テスト大会');
  await page.getByText('大会を作成する').click();
  await page.screenshot({ path: `${testInfo.outputDir}/tournament-detail.png` });

  // 10人分の参加者データを配列で定義
  const participants = [
    { name: 'テスト参加者1', weapon: 'シューター', xp: '2000' },
    { name: 'テスト参加者2', weapon: 'チャージャー', xp: '1800' },
    { name: 'テスト参加者3', weapon: 'ローラー', xp: '1500' },
    { name: 'テスト参加者4', weapon: 'スピナー', xp: '1700' },
    { name: 'テスト参加者5', weapon: 'ブラスター', xp: '1600' },
    { name: 'テスト参加者6', weapon: 'マニューバー', xp: '1550' },
    { name: 'テスト参加者7', weapon: 'スロッシャー', xp: '1400' },
    { name: 'テスト参加者8', weapon: 'シェルター', xp: '1300' },
    { name: 'テスト参加者9', weapon: 'フデ', xp: '1200' },
    { name: 'テスト参加者10', weapon: 'ワイパー', xp: '1100' },
  ];

  // ループで10人分の参加者を追加
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    await addParticipant(
      page,
      p.name,
      p.weapon,
      p.xp,
      `${testInfo.outputDir}/add-participant${i + 1}.png`
    );
  }
  await page.screenshot({
    path: `${testInfo.outputDir}/participant-list.png`,
    fullPage: true,
  });

  // --- キャプテン2名選択・キャプテンページ遷移E2Eテスト追加 ---
  // // 参加者リストのロード完了を明示的に待つ
  // await expect(page.getByRole('row', { name: /テスト参加者1/ })).toBeVisible();
  // await expect(page.getByRole('row', { name: /テスト参加者2/ })).toBeVisible();

  // 1. 1人目の参加者をキャプテンに設定
  const row1 = await page.getByText('テスト参加者1').locator('..'); // 親td
  const tr1 = await row1.locator('..'); // 親tr
  await tr1.locator('button').first().click();
  await page.screenshot({ path: `${testInfo.outputDir}/captain1-selected.png`, fullPage: true });

  // 2. 2人目の参加者をキャプテンに設定
  const row2 = await page.getByText('テスト参加者2').locator('..');
  const tr2 = await row2.locator('..');
  await tr2.locator('button').first().click();
  await page.screenshot({ path: `${testInfo.outputDir}/captain2-selected.png`, fullPage: true });

  // // 3. キャプテン一覧ページへ遷移
  // await page.getByText('キャプテン一覧').click();
  // await page.screenshot({ path: `${testInfo.outputDir}/captain-list.png`, fullPage: true });
  // // 2名のキャプテンが表示されていることを検証
  // await expect(page.getByText('テスト参加者1')).toBeVisible();
  // await expect(page.getByText('テスト参加者2')).toBeVisible();

  // 4. 1人目のキャプテンページへ遷移
  await page.getByRole('link', { name: /テスト参加者1のキャプテンページ/ }).click();
  await page.screenshot({ path: `${testInfo.outputDir}/captain1-page.png`, fullPage: true });
  await expect(page.getByText('キャプテン情報')).toBeVisible();
  await expect(page.getByText('テスト参加者1')).toBeVisible();

  // 5. 戻って2人目のキャプテンページへ遷移
  await page.goBack();
  await page.getByRole('link', { name: /テスト参加者2のキャプテンページ/ }).click();
  await page.screenshot({ path: `${testInfo.outputDir}/captain2-page.png`, fullPage: true });
  await expect(page.getByText('キャプテン情報')).toBeVisible();
  await expect(page.getByText('テスト参加者2')).toBeVisible();
});
