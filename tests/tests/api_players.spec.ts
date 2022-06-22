import { expect, test, chromium } from '@playwright/test';
import { login } from './utils/roles';
import {getCoWebsiteIframe} from "./utils/iframe";
import {assertLogMessage} from "./utils/log";

test.describe('API WA.players', () => {
  test('enter leave events are received', async ({ page }) => {
    await page.goto(
      'http://play.workadventure.localhost/_/global/maps.workadventure.localhost/tests/RemotePlayers/remote_players.json'
    );
    await login(page, 'Alice');

    const browser = await chromium.launch();
    const page2 = await browser.newPage();

    await page2.goto(
      'http://play.workadventure.localhost/_/global/maps.workadventure.localhost/tests/RemotePlayers/remote_players.json'
    );

    await login(page2, 'Bob');

    const events = getCoWebsiteIframe(page).locator('#events');
    await expect(events).toContainText('New user: Bob');

    await getCoWebsiteIframe(page).locator('#listCurrentPlayers').click();
    const list = getCoWebsiteIframe(page).locator('#list');
    await expect(list).toContainText('Bob');

    await getCoWebsiteIframe(page2).locator('#listCurrentPlayers').click();
    const list2 = getCoWebsiteIframe(page2).locator('#list');
    await expect(list2).toContainText('Alice');

    await page2.close();

    await expect(events).toContainText('User left: Bob');
    await getCoWebsiteIframe(page).locator('#listCurrentPlayers').click();
    await expect(list).not.toContainText('Bob');
  });

  test('exception if we forget to call WA.players.enableTracking', async ({ page }) => {
    await page.goto(
        'http://play.workadventure.localhost/_/global/maps.workadventure.localhost/tests/RemotePlayers/remote_players_no_init.json'
    );
    await login(page);

    await expect(getCoWebsiteIframe(page).locator('#onPlayerEntersException')).toHaveText('Yes');
    await expect(getCoWebsiteIframe(page).locator('#onPlayerLeavesException')).toHaveText('Yes');
  });
});
