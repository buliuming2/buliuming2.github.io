// renderer.js - 完全移除 require，使用预加载暴露的 API

let tabs = [];
let activeTabId = null;
let settings = { homepage: 'https://www.google.com', searchEngine: 'https://www.google.com/search?q=' };
let bookmarks = [
  { title: 'Google', url: 'https://www.google.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'YouTube', url: 'https://youtube.com' },
  { title: 'Reddit', url: 'https://reddit.com' }
];

const tabsContainer = document.getElementById('tabs-container');
const webviewContainer = document.getElementById('webview-container');
const urlInput = document.getElementById('url-input');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');
const homeBtn = document.getElementById('home-btn');
const newTabBtn = document.getElementById('new-tab-btn');
const bookmarksBar = document.getElementById('bookmarks-bar');

async function init() {
  settings = await window.electronAPI.getSettings();

  window.electronAPI.onSettingsUpdated((newSettings) => {
    settings = newSettings;
  });

  createTab(settings.homepage);
  renderBookmarks();
  setupEventListeners();

  window.electronAPI.onNewTab((url) => {
    createTab(url || settings.homepage);
  });

  window.electronAPI.onCloseTab(() => {
    if (activeTabId) closeTab(activeTabId);
  });

  window.electronAPI.onGoBack(() => {
    const webview = getActiveWebview();
    if (webview && webview.canGoBack()) webview.goBack();
  });

  window.electronAPI.onGoForward(() => {
    const webview = getActiveWebview();
    if (webview && webview.canGoForward()) webview.goForward();
  });
}

function setupEventListeners() {
  newTabBtn.addEventListener('click', () => createTab(settings.homepage));

  backBtn.addEventListener('click', () => {
    const webview = getActiveWebview();
    if (webview && webview.canGoBack()) webview.goBack();
  });

  forwardBtn.addEventListener('click', () => {
    const webview = getActiveWebview();
    if (webview && webview.canGoForward()) webview.goForward();
  });

  reloadBtn.addEventListener('click', () => {
    const webview = getActiveWebview();
    if (webview) webview.reload();
  });

  homeBtn.addEventListener('click', () => {
    navigateTo(settings.homepage);
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      let input = urlInput.value.trim();
      if (input === '') return;

      if (input.includes('.') && !input.includes(' ')) {
        if (!input.startsWith('http://') && !input.startsWith('https://')) {
          input = 'https://' + input;
        }
        navigateTo(input);
      } else {
        const searchUrl = settings.searchEngine + encodeURIComponent(input);
        navigateTo(searchUrl);
      }
    }
  });
}

function createTab(url) {
  const tabId = 'tab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.dataset.tabId = tabId;
  tabEl.innerHTML = `
    <span class="tab-title">新标签页</span>
    <button class="close-tab">✕</button>
  `;

  const webview = document.createElement('webview');
  webview.setAttribute('src', url);
  webview.setAttribute('id', `webview-${tabId}`);
  webview.style.display = 'none';

  webview.addEventListener('did-start-loading', () => {
    if (tabId === activeTabId) {
      urlInput.value = webview.getURL();
    }
  });

  webview.addEventListener('did-stop-loading', () => {
    if (tabId === activeTabId) {
      urlInput.value = webview.getURL();
      const title = webview.getTitle() || '新标签页';
      const tabSpan = tabEl.querySelector('.tab-title');
      if (tabSpan) tabSpan.textContent = title;
    }
  });

  webview.addEventListener('page-title-updated', (e) => {
    if (tabId === activeTabId) {
      const tabSpan = tabEl.querySelector('.tab-title');
      if (tabSpan) tabSpan.textContent = e.title;
    }
  });

  webview.addEventListener('new-window', (e) => {
    e.preventDefault();
    window.electronAPI.sendNewTab(e.url);
  });

  webview.addEventListener('will-navigate', (e) => {
    if (tabId === activeTabId) {
      urlInput.value = e.url;
    }
  });

  webview.addEventListener('did-navigate', (e) => {
    if (tabId === activeTabId) {
      urlInput.value = e.url;
    }
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    if (tabId === activeTabId) {
      urlInput.value = e.url;
    }
  });

  tabEl.querySelector('.close-tab').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });

  tabEl.addEventListener('click', () => {
    activateTab(tabId);
  });

  tabs.push({ id: tabId, element: tabEl, webview: webview, url: url });

  tabsContainer.appendChild(tabEl);
  webviewContainer.appendChild(webview);

  if (!activeTabId) {
    activateTab(tabId);
  }
}

function activateTab(tabId) {
  if (activeTabId === tabId) return;

  tabs.forEach(tab => {
    if (tab.webview) tab.webview.style.display = 'none';
    if (tab.element) tab.element.classList.remove('active');
  });

  const activeTab = tabs.find(t => t.id === tabId);
  if (activeTab) {
    activeTab.webview.style.display = 'flex';
    activeTab.element.classList.add('active');
    activeTabId = tabId;

    urlInput.value = activeTab.webview.getURL() || activeTab.url;

    const title = activeTab.webview.getTitle();
    if (title) {
      const tabSpan = activeTab.element.querySelector('.tab-title');
      if (tabSpan) tabSpan.textContent = title;
    }
  }
}

function closeTab(tabId) {
  const index = tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;

  const tab = tabs[index];

  if (tab.element && tab.element.parentNode) tab.element.parentNode.removeChild(tab.element);
  if (tab.webview && tab.webview.parentNode) tab.webview.parentNode.removeChild(tab.webview);

  tabs.splice(index, 1);

  if (activeTabId === tabId) {
    if (tabs.length > 0) {
      const newIndex = index > 0 ? index - 1 : 0;
      activateTab(tabs[newIndex].id);
    } else {
      createTab(settings.homepage);
    }
  }
}

function getActiveWebview() {
  if (!activeTabId) return null;
  const activeTab = tabs.find(t => t.id === activeTabId);
  return activeTab ? activeTab.webview : null;
}

function navigateTo(url) {
  const webview = getActiveWebview();
  if (webview) {
    webview.loadURL(url);
  } else {
    createTab(url);
  }
}

function renderBookmarks() {
  bookmarksBar.innerHTML = '';
  bookmarks.forEach(bookmark => {
    const item = document.createElement('span');
    item.className = 'bookmark-item';
    item.textContent = bookmark.title;
    item.addEventListener('click', () => navigateTo(bookmark.url));
    bookmarksBar.appendChild(item);
  });
}

init();