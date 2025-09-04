# Edge Extension 開発ガイドブック（入門編）

## はじめに

Microsoft Edge の拡張機能は **Chromium ベース**なので、基本的に Chrome 拡張と同じ仕組みです。
開発環境はシンプルで、**フォルダにファイルを置いて Edge で読み込むだけ**で動作確認できます。

このガイドは「初めて拡張機能を作る人」が全体像を理解するためのガイドブックです。
JavaScript の基礎知識や DOM 操作の詳細は扱いません。

---

## 1. 拡張機能の構成要素

拡張機能は **最低限 `manifest.json`** があれば成立します。
機能に応じて以下の要素が追加されます。

- **manifest.json**
  拡張の設定ファイル（必須）

  * バージョン（`manifest_version: 3`）
  * 拡張の名前、説明、権限、どのページにスクリプトを注入するか など

- **content scripts（例：content.js）**
  指定したWebページに挿入されるJavaScript。
  ページ内のDOMを監視・操作できる。

- **background service worker**
  常駐的に動き、イベントを処理する。通知や長期的な処理に利用。

- **options page / popup page**

  * `options.html`: 設定画面を提供
  * `popup.html`: 拡張アイコンをクリックしたときの小画面

- **icons**
  ブラウザのツールバーや拡張管理画面に表示されるアイコン。

---

## 2. 開発の基本フロー

1. **フォルダを作成**
   プロジェクト用フォルダを用意し、その中に `manifest.json` を作成。

2. **manifest.json を記述**
   例：

   ```json
   {
     "manifest_version": 3,
     "name": "Sample Extension",
     "version": "1.0.0",
     "description": "最小の拡張機能サンプル",
     "content_scripts": [
       {
         "matches": ["https://example.com/*"],
         "js": ["content.js"]
       }
     ]
   }
   ```

3. **スクリプトやリソースを追加**

   * `content.js` を作成し、対象ページに動作を仕込む。
   * 必要に応じて `icons/` フォルダや `popup.html` を追加。

4. **Edgeに読み込む**

   * `edge://extensions/` を開く
   * 「デベロッパーモード」を ON
   * 「展開して読み込み」からフォルダを選択

5. **テストと修正**

   * 対象サイトを開いて動作を確認
   * コンソール（F12 → Console）でエラー確認

---

## 3. 権限とセキュリティ

拡張機能には **権限 (permissions)** を宣言するルールがあります。
これがあると Edge がユーザーに「この拡張は何をできるのか」を明示します。

よく使う権限：

- `"tabs"`: タブ操作
- `"storage"`: 設定データを保存
- `"scripting"`: 動的にスクリプトを注入

⚠️ **最小限の権限** で済ませることが大原則です。

---

## 4. デバッグと更新

- **デバッグ**

  * ページに挿入された `content.js` は、開発者ツールで直接確認可能。
  * Background service worker は「拡張機能の詳細」→「サービスワーカーを調査」で確認。

- **更新**

  * `manifest.json` の `"version"` を上げる。
  * Edgeの拡張管理画面で「更新」ボタンを押す。

---

## 5. 配布方法

- **ローカル利用**

  * 自分用や社内用なら「展開して読み込み」でOK。

- **Edgeアドオンストア公開**

  * zip化してアップロード → 審査
  * アイコン・説明文・スクリーンショットが必須

---

## 6. よくある落とし穴

- `manifest.json` は **UTF-8（BOMなし）** で保存すること
- `matches` は必ず `https://*/*` のようにフルパターンを書くこと
- Content script から直接ブラウザAPIは呼べない（必要なら background 経由）
- ページのロード前に仕込みたい場合は `"run_at": "document_start"` を指定

---

## 7. 学び方のおすすめ

- まずは **最小のサンプル**（content scriptだけ）を動かしてみる
- その後に

  * popupでUIを作る
  * storage APIでデータ保存
  * backgroundで通知
    …と一つずつ足していく

---

## まとめ

- Edge拡張は「manifest.json + JSファイル」で作れる
- 開発はローカルで簡単に始められる
- 権限とセキュリティを意識することが大切
- 大きな流れを掴んだら、サンプルコードを読みながら試すのが一番早い

