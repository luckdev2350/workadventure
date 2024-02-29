import {expect, Page} from "@playwright/test";
import {expectInViewport} from "./viewport";

class Menu {
    async openChat(page: Page) {
        await page.click('button.chat-btn');
        await expectInViewport('#chatWindow', page);
        await expect(page.locator('button.chat-btn')).toHaveClass(/border-top-light/);
        await expect(page.locator('#chatWindow')).toHaveClass(/show/);
    }

    async openMapEditor(page: Page) {
        await page.getByRole('button', {name: 'toggle-map-editor'}).click();
        await expect(await page.getByRole('button', {name: 'toggle-map-editor'}).first()).toHaveClass(/border-top-light/);
    }

    async openMenu(page: Page) {
        await page.click('#menuIcon img:first-child');
        await expect(await page.locator('#menuIcon')).toHaveClass(/border-top-light/);
    }

    async closeMenu(page: Page) {
        await page.locator('.menu-container').getByRole('button', { name: '×' }).click();
        await expect(await page.locator('#menuIcon')).not.toHaveClass(/border-top-light/);
    }

    async closeMapEditor(page: Page) {
        await page.getByRole('button', {name: 'toggle-map-editor'}).click();
        await expect(await page.getByRole('button', {name: 'toggle-map-editor'}).first()).not.toHaveClass(/border-top-light/);
    }

    async toggleMegaphoneButton(page: Page) {
        await page.locator('.bottom-action-bar .bottom-action-button #megaphone').click({timeout: 5_000});
    }

    async isThereMegaphoneButton(page: Page) {
        await expect(await page.locator('.bottom-action-bar .bottom-action-button #megaphone')).toBeVisible({timeout: 30_000});
    }

    async isNotThereMegaphoneButton(page: Page) {
        await expect(await page.locator('.bottom-action-bar .bottom-action-button #megaphone')).toBeHidden({timeout: 30_000});
    }

    async openStatusList(page : Page){
        await page.click('#AvailabilityStatus');
    }

    async clickOnStatus(page:Page,status: string){
        await this.openStatusList(page);
        await expect(page.getByText(status)).toBeVisible();
        await page.getByText(status).click(); 
    }

    async turnOnCamera(page:Page){
        if(await page.getByAltText('Turn off webcam').isVisible()) return;
        await page.getByAltText('Turn on webcam').click();
        await expect(page.getByAltText('Turn off webcam')).toBeVisible();
    }
    async turnOffCamera(page:Page){
        if(await page.getByAltText('Turn on webcam').isVisible()) return;
        await page.getByAltText('Turn off webcam').click();
        await expect(page.getByAltText('Turn on webcam')).toBeVisible();
    }
    async turnOnMicrophone(page:Page){
        if(await page.getByAltText('Turn off microphone').isVisible()) return;
        await page.getByAltText('Turn on microphone').click();
        await expect(page.getByAltText('Turn off microphone')).toBeVisible();
    }
    async turnOffMicrophone(page:Page){
        if(await page.getByAltText('Turn on microphone').isVisible()) return;
        await page.getByAltText('Turn off microphone').click();
        await expect(page.getByAltText('Turn on microphone')).toBeVisible();
    }

    async closeNotificationPopUp(page:Page){
        if(await page.getByText('Continue without notification').isHidden())return;
        await page.getByText('Continue without notification').click();
        await expect(page.getByText('Continue without notification')).toBeVisible();

    }
}

export default new Menu();
