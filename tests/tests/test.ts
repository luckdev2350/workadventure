const fs = require('fs')

fixture `Variables`
    .page `http://play.workadventure.localhost/_/global/maps.workadventure.localhost/tests/Variables/Cache/variables_tmp.json`;

test("Test that variables cache in the back don't prevent setting a variable in case the map changes", async t => {
    // Let's start by visiting a map that DOES not have the variable.
    fs.copyFileSync('../maps/tests/Variables/Cache/variables_cache_1.json', '../maps/tests/Variables/Cache/variables_tmp.json');

    await t
        .typeText('input[name="loginSceneName"]', 'foo')
        .click('button.loginSceneFormSubmit')
        .click('button.selectCharacterButtonRight')
        .click('button.selectCharacterButtonRight')
        .click('button.selectCharacterSceneFormSubmit')
        .click('button.letsgo');
        //.takeScreenshot('before_switch.png');

    // Let's REPLACE the map by a map that has a new variable
    // At this point, the back server contains a cache of the old map (with no variables)
    fs.copyFileSync('../maps/tests/Variables/Cache/variables_cache_2.json', '../maps/tests/Variables/Cache/variables_tmp.json');
    await t.openWindow('http://play.workadventure.localhost/_/global/maps.workadventure.localhost/tests/Variables/Cache/variables_tmp.json');

    await t.resizeWindow(960, 800);

    await t
        .typeText('input[name="loginSceneName"]', 'foo')
        .click('button.loginSceneFormSubmit')
        .click('button.selectCharacterButtonRight')
        .click('button.selectCharacterButtonRight')
        .click('button.selectCharacterSceneFormSubmit')
        .click('button.letsgo')
        .wait(1000);
        //.takeScreenshot('after_switch.png');

    const messages = await t.getBrowserConsoleMessages();

    const logs = messages['log'];

    // Let's check we successfully manage to save the variable value.
    await t.expect(logs).contains('SUCCESS!');

    t.ctx.passed = true;
}).after(async t => {
    if (!t.ctx.passed) {
        console.log("Test failed. Browser logs:")
        console.log(await t.getBrowserConsoleMessages());
    }
});
