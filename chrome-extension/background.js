chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: '0',
        title: 'Shorten Link and Copy',
        type: 'normal',
        contexts: ['all']
    })
    chrome.contextMenus.onClicked.addListener((onClickData) => {
        fetch()
    })
})