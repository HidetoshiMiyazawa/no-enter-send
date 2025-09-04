(async () => {
  const { loadSettings, saveSettings } = window.NES_UTIL;

  const siteToggle = document.getElementById('siteToggle');
  const siteListEl = document.getElementById('siteList');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 1st: activeTab で tab.url から hostname 取得
  function hostFromTabUrl(t) {
    try {
      const u = new URL(t?.url || '');
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.hostname : null;
    } catch { return null; }
  }

  // 2nd: 取れない場合は content script に問い合わせ
  async function hostFromContentScript(t) {
    try {
      const res = await chrome.tabs.sendMessage(t.id, { type: 'NES_GET_HOST' });
      return res?.host || null;
    } catch { return null; }
  }

  let host = hostFromTabUrl(tab) || await hostFromContentScript(tab);
  let settings = await loadSettings();

  function renderList() {
    siteListEl.innerHTML = '';
    const hosts = Object.keys(settings.siteOverrides || {}).sort();
    for (const h of hosts) {
      if (!settings.siteOverrides[h].enabled) continue;
      const li = document.createElement('li');
      li.textContent = h;
      const delBtn = document.createElement('button');
      delBtn.textContent = '削除';
      delBtn.addEventListener('click', async () => {
        delete settings.siteOverrides[h];
        await saveSettings(settings);
        renderList();
      });
      li.appendChild(delBtn);
      siteListEl.appendChild(li);
    }
  }

  function ensureSiteEntry() {
    settings.siteOverrides = settings.siteOverrides || {};
    if (!settings.siteOverrides[host]) {
      settings.siteOverrides[host] = { enabled: false };
    }
    return settings.siteOverrides[host];
  }

  // 初期UI
  siteToggle.disabled = !host; // ホスト不明なら操作不可
  if (host) ensureSiteEntry();
  siteToggle.checked = !!(host && settings.siteOverrides[host]?.enabled);
  renderList();

  // 切替：このサイトで有効
  siteToggle.addEventListener('change', async () => {
    if (!host) return;
    const entry = ensureSiteEntry();
    entry.enabled = siteToggle.checked;
    await saveSettings(settings);
    renderList();
  });
})();
