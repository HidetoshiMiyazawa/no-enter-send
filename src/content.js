// content.js（日本語コメント）
// 役割：
// - サイトが有効なら、プレーンEnter送信を無効化（改行化）
// - Ctrl+Enter で送信（ボタンクリックを合成）
// - popup からの NES_GET_HOST に応答

(() => {
  const { loadSettings } = window.NES_UTIL;

  let composing = false;   // IME変換中
  let cachedSettings = null;
  const currentHost = location.hostname;

  // popup → hostname 問い合わせ
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === 'NES_GET_HOST') {
      sendResponse({ host: currentHost });
      return true;
    }
  });

  function siteEnabled() {
    if (!cachedSettings) return false;
    if (!cachedSettings.enabled) return false;
    const site = cachedSettings.siteOverrides?.[currentHost];
    return !!(site && site.enabled);
  }

  function isTextLike(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'textarea') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function insertLineBreak(target) {
    const tag = target.tagName?.toLowerCase();
    if (tag === 'textarea') {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const v = target.value ?? '';
      target.value = v.slice(0, start) + "\n" + v.slice(end);
      const pos = start + 1;
      target.selectionStart = target.selectionEnd = pos;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    if (target.isContentEditable) {
      document.execCommand('insertLineBreak');
      return true;
    }
    return false;
  }

  // 送信ボタン探索（軽量プリセット）
  function findSendButton() {
    const candidates = [
      'button[data-testid="send-button"]',      // ChatGPT
      'button[aria-label*="Send" i]',
      'button[title*="Send" i]',
      'button[type="submit"]',
      '[data-testid="send"]',
      '[role="button"][aria-label*="Send" i]'
    ];
    for (const sel of candidates) {
      try {
        const el = document.querySelector(sel);
        if (el && el.offsetParent !== null) return el; // 表示されているもの
      } catch {}
    }
    // ゆるいフォールバック
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    return buttons.reverse().find(el => el.offsetParent !== null) || null;
  }

  function clickSendButton() {
    const btn = findSendButton();
    if (btn) { btn.click(); return true; }
    return false;
  }

  function onKeyDown(e) {
    if (!siteEnabled()) return;

    const t = e.target;
    if (!isTextLike(t)) return;

    // IME確定は通す（ただし送信系のハンドラは止めたいので伝搬は止める）
    if (e.isComposing || composing) { e.stopPropagation(); return; }

    // Ctrl+Enter → 送信（固定仕様）
    if (e.key === 'Enter' && e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!clickSendButton()) insertLineBreak(t); // ボタン見つからなければ改行
      return;
    }

    // プレーンEnter → 送信禁止（改行化）
    if (e.key === 'Enter' && !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
      e.preventDefault();
      e.stopPropagation();
      insertLineBreak(t);
      return;
    }

    // その他の修飾付き Enter（Alt/Meta）は送信させない
    if (e.key === 'Enter' && (e.altKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }

  function onKeyPress(e) {
    if (!siteEnabled()) return;
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (!isTextLike(t)) return;

    if (!(e.isComposing || composing) && !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function onCompositionStart() { composing = true; }
  function onCompositionEnd()   { composing = false; }

  function attach() {
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keypress', onKeyPress, true);
    document.addEventListener('compositionstart', onCompositionStart, true);
    document.addEventListener('compositionend', onCompositionEnd, true);
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.settings) {
      cachedSettings = { ...cachedSettings, ...changes.settings.newValue };
    }
  });

  loadSettings().then(s => { cachedSettings = s; attach(); });
})();
