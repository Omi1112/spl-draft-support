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

/**
 * 指定した参加者名のキャプテン設定ボタンをクリックする
 * @param page PlaywrightのPageオブジェクト
 * @param participantName 参加者名
 */
async function setCaptain(page: import('@playwright/test').Page, participantName: string) {
  const allTrs = await page.locator('table tbody tr').all();
  for (const tr of allTrs) {
    const tds = await tr.locator('td').all();
    if (tds.length > 0) {
      const name = await tds[0].innerText();
      if (name.trim() === participantName) {
        await tds[3].locator('button').first().click();
        break;
      }
    }
  }
}

/**
 * 指定した参加者名の指名ボタンをクリックし、モーダルで指名を確定する
 * @param page PlaywrightのPageオブジェクト
 * @param participantName 参加者名
 */
async function nominateParticipant(page: import('@playwright/test').Page, participantName: string) {
  const draftTableTrs = await page.locator('table tbody tr').all();
  for (const tr of draftTableTrs) {
    const tds = await tr.locator('td').all();
    if (tds.length > 0) {
      const name = await tds[0].innerText();
      if (name.trim() === participantName) {
        await tds[3].locator('button', { hasText: '指名する' }).click();
        break;
      }
    }
  }
  // モーダル内の「指名する」ボタンを押す
  const modal = page.locator('div[role="dialog"], .fixed, .z-50');
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: '指名する' }).click();
}

/**
 * 指定したキャプテン名のキャプテンページへ遷移する
 * @param page PlaywrightのPageオブジェクト
 * @param captainName キャプテン名
 */
async function goToCaptainPage(page: import('@playwright/test').Page, captainName: string) {
  const linkSpan = await page.getByText(`${captainName}のキャプテンページを表示`);
  const link = await linkSpan.locator('..');
  await link.click();
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

  // 1. 1人目の参加者をキャプテンに設定
  await setCaptain(page, 'テスト参加者1');
  await page.screenshot({ path: `${testInfo.outputDir}/captain1-selected.png`, fullPage: true });

  // 2. 2人目の参加者をキャプテンに設定
  await setCaptain(page, 'テスト参加者2');
  await page.screenshot({ path: `${testInfo.outputDir}/captain2-selected.png`, fullPage: true });

  // 4. 1人目のキャプテンページへ遷移
  await goToCaptainPage(page, 'テスト参加者1');
  await expect(page.getByText('キャプテン情報')).toBeVisible();
  await page.screenshot({ path: `${testInfo.outputDir}/captain1-page.png`, fullPage: true });

  // 4.1 ドラフト開始ボタンを押す
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'ドラフト開始' }).click();
  await page.screenshot({ path: `${testInfo.outputDir}/draft-started.png`, fullPage: true });

  await expect(page.getByRole('button', { name: 'ドラフトをリセット' })).toBeVisible();

  // テスト参加者3の指名
  await nominateParticipant(page, 'テスト参加者3');
  await page.screenshot({
    path: `${testInfo.outputDir}/nominated-participant3.png`,
    fullPage: true,
  });

  // 「← 大会ページへ戻る」リンクをクリック
  await page.getByRole('link', { name: /大会ページへ戻る/ }).click();
  await page.screenshot({ path: `${testInfo.outputDir}/back-to-tournament.png`, fullPage: true });

  // 2人目のキャプテンページへ遷移
  await goToCaptainPage(page, 'テスト参加者2');
  await page.screenshot({ path: `${testInfo.outputDir}/captain2-page.png`, fullPage: true });
  await expect(page.getByText('キャプテン情報')).toBeVisible();

  // テスト参加者4の指名
  await nominateParticipant(page, 'テスト参加者4');
  await page.screenshot({
    path: `${testInfo.outputDir}/nominated-participant4.png`,
    fullPage: true,
  });
});
