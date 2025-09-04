(() => {
  // ▼ 既定設定（サイト別 ON/OFF のみ）
  const DEFAULTS = {
    enabled: true,        // 全体ON/OFF（今は常にtrue想定でもOK）
    siteOverrides: {}     // { host: { enabled: true } }
  };

  function getHost(href) {
    try { return new URL(href).hostname; } catch { return location.hostname; }
  }

  function loadSettings() {
    return new Promise(resolve => {
      chrome.storage.sync.get({ settings: DEFAULTS }, items => {
        const s = items.settings || DEFAULTS;
        resolve({
          ...DEFAULTS,
          ...s,
          siteOverrides: { ...(s.siteOverrides || {}) }
        });
      });
    });
  }

  function saveSettings(settings) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ settings }, resolve);
    });
  }

  window.NES_UTIL = { DEFAULTS, getHost, loadSettings, saveSettings };
})();
