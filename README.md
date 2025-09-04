# No Enter Send（Chrome/Edge拡張, Manifest V3）

## 概要

**Enter キーでの送信を完全に無効化し、Shift+Enter は改行、送信は必ず Ctrl+Enter または送信ボタンのみ** に統一する拡張機能です。IMEのON/OFFに関わらず誤送信を防ぎます。対象サイトは popup から自由に追加・削除できます。

---

## 必要な理由

- 英語入力中に **Enter を変換確定のつもりで押して誤送信** することを防ぐ
- 誤送信をゼロにして、**送信は矢印アイコンなどのボタン or Ctrl+Enter のみ** に統一
- SlackやChatGPTのように「Enter送信＋Shift+Enter改行」なUIでも、**Enter送信を禁止**して誤操作を減らす

---

## 特長

- **Enter 単体 = 改行化（送信無効）**
- **Shift+Enter = 改行**
- **Ctrl+Enter = 送信**（送信ボタンをクリック合成）
- **IME対応**：変換中 (`isComposing`) のEnter確定はブロックしない
- **対象サイトを popup から自由に管理可能**：有効化リストに追加・削除できる

---

## ディレクトリ構成

```
no-enter-send/
├─ manifest.json
├─ src/
│   ├─ content.js
│   └─ util.js
├─ popup/
│   ├─ popup.html
│   └─ popup.js
├─ icons/
│   ├─ icon16.png
│   ├─ icon32.png
│   ├─ icon48.png
│   └─ icon128.png
└─ README.md
```

---

## manifest.json（例）

```json
{
  "manifest_version": 3,
  "name": "No Enter Send",
  "version": "1.3.1",
  "description": "Enter単体の送信を無効化し、Shift+Enterは改行。対象サイトはpopup管理。Ctrl+Enterで送信。",
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": ["storage", "activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/util.js", "src/content.js"],
      "run_at": "document_start"
    }
  ]
}
```

---

## content.js（動作概要）

- すべてのサイトに注入される
- 起動時に storage から「有効サイト一覧」を取得
- 現在の `location.hostname` がリストに含まれていなければ何もしない
- 含まれていれば Enter の送信を完全にブロック
  - **Enter 単体 → 改行に置き換え**
  - **Shift+Enter → 改行許可**
  - **Ctrl+Enter → 送信ボタンをクリック合成**
  - **IME中 (isComposing=true) → 確定のみ許可**

---

## popup（機能）

- 「このサイトで有効にする」チェックボックス
  - ON → 有効サイトリストに追加
  - OFF → リストから削除
- 「現在有効なサイト一覧」を表示
  - 一覧ごとに削除ボタン付き

---

## インストール（ローカル開発）

### Chrome / Edge 共通

1. `chrome://extensions/` または `edge://extensions/` を開く
2. 右上で **デベロッパーモード** を ON
3. **「パッケージ化されていない拡張機能を読み込む」** → このプロジェクトフォルダを選択
4. 対象サイトを追加してリロードして動作確認

---

## Git/GitHub 管理

- 通常のリポジトリとして管理可能
- `.gitignore` で特別な除外は不要（ビルド生成物なし）
- バージョン管理は `manifest.json` の `version` を更新

---

## 既知の注意点

- サイトのDOMが頻繁に変わっても、**documentレベルのkeydown捕捉**なので基本的に動作は維持
- 送信ボタンの構造が特殊な場合、ボタンクリックが見つからず **Ctrl+Enter で改行になる** ケースあり
- 1行入力欄（例: 検索ボックス）は改行できないため、Enterは送信を防ぐだけ

---

## 今後の拡張候補

- **送信ボタンセレクタのカスタム設定**（必要な場合に追加）
- **Firefox対応**：Manifest V3互換で移植可能

---

## よくある質問（FAQ）

**Q. Edge/Chrome拡張として特別な管理は必要？**  
A. いいえ。ローカル読み込みの範囲なら通常のGit運用で問題ありません。ストア公開時のみパッケージ化と審査が必要です。

**Q. ChatGPT以外のサイトにも効かせたい**  
A. popupで有効化してください。リストに追加すれば即反映されます。

**Q. 一時的に Enter を許可したい**  
A. popupでチェックを外すか、拡張をOFFにしてください。

---

## ライセンス

- お好みで選択可能。MIT License などを推奨。
