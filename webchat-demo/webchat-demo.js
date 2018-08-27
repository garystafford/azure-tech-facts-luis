// author: Anthony Cu
// modified: Gary Stafford
// original code source: https://ansthonychu.ca/post/microsoft-bot-framework-web-embed-collapsible-window/

'use strict';

(function () {
    const div = document.createElement("div");
    document.getElementsByTagName('body')[0].appendChild(div);
    div.outerHTML = "<div id='botDiv' style='height: 38px; position: fixed; right: 0; bottom: 0; z-index: 1000; background-color: #fff'><div id='botTitleBar' style='height: 38px; width: 400px; position:fixed; cursor: pointer;'></div><iframe width='400px' height='500px' src='https://webchat.botframework.com/embed/azure-tech-facts-bot?s=auDJU3FoVPg.cwA.3b8.bbQMXKyU8KWVeTV3w7HM04P88T0zJ_nifWEJ5NSBBa0'></iframe></div>";

    document.querySelector('body').addEventListener('click', function (e) {
        e.target.matches = e.target.matches || e.target.msMatchesSelector;
        if (e.target.matches('#botTitleBar')) {
            const botDiv = document.querySelector('#botDiv');
            botDiv.style.height = botDiv.style.height === '500px' ? '38px' : '500px';
        }
    });
}());
