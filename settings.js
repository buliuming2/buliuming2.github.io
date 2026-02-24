// settings.js - 使用预加载暴露的 API，不再 require

const form = document.getElementById('settings-form');
const homepageInput = document.getElementById('homepage');
const searchEngineSelect = document.getElementById('searchEngine');

// 加载当前设置
async function loadSettings() {
  // 通过 window.electronAPI 调用主进程方法
  const settings = await window.electronAPI.getSettings();
  homepageInput.value = settings.homepage || 'https://www.google.com';
  searchEngineSelect.value = settings.searchEngine || 'https://www.google.com/search?q=';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const newSettings = {
    homepage: homepageInput.value.trim(),
    searchEngine: searchEngineSelect.value
  };
  // 通过 window.electronAPI 发送保存事件
  window.electronAPI.saveSettings(newSettings);
  alert('设置已保存');
  window.close(); // 关闭设置窗口
});

loadSettings();