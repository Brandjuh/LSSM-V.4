window.lssmv4.$store.dispatch('settings/register', {
    moduleId: MODULE_ID,
    settings: {
        clickableLinks: {
            type: 'toggle',
            default: true,
        },
    },
});

const getSetting = settingId => {
    return window.lssmv4.$store.dispatch('settings/getSetting', {
        moduleId: MODULE_ID,
        settingId,
    });
};

getSetting('clickableLinks').then(setting => {
    if (!setting) return;

    const urlRegex = window.lssmv4.urlRegex();

    const clickableLinks = node =>
        window.lssmv4
            .getTextNodes(node, n => n.textContent.match(urlRegex))
            .forEach(n => {
                const links = n.textContent.match(urlRegex);
                const texts = n.textContent.split(urlRegex);
                texts.forEach(text => {
                    if (text)
                        n.parentNode.insertBefore(
                            document.createTextNode(text),
                            n
                        );
                    const link = links.shift();
                    if (!link) return;
                    const linkNode = document.createElement('a');
                    linkNode.href = link.toString();
                    linkNode.setAttribute('target', '_blank');
                    linkNode.textContent = link.toString();
                    n.parentNode.insertBefore(linkNode, n);
                });
                n.parentNode.removeChild(n);
            });

    clickableLinks(document);

    window.lssmv4.$store.dispatch('premodifyParams', {
        event: 'allianceChat',
        callback(e) {
            const links = e.message.match(urlRegex) || [];
            const texts = e.message.split(urlRegex);
            e.message = '';
            texts.forEach(text => {
                if (text) e.message += text;
                const link = links.shift();
                if (link)
                    e.message += `<a href="${link}" target="_blank">${link}</a>`;
            });
        },
    });
});