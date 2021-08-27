let menuIframeApi = undefined;

WA.ui.registerMenuCommand('TO WA', () => {
    WA.nav.openTab("https://workadventu.re/");
})

WA.ui.registerMenuCommand('TO WA BY IFRAME', {iframe: 'customIframeMenu.html'});

WA.room.onEnterZone('iframeMenu', () => {
    menuIframeApi = WA.ui.registerMenuCommand('IFRAME USE API', {iframe: 'customIframeMenuApi.html', allowApi: true});
})

WA.room.onLeaveZone('iframeMenu', () => {
    menuIframeApi.remove();
})