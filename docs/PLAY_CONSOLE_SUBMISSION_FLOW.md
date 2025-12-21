# Google Play 提出フロー（最新確認版）

最終確認日: 2025-12-20  
対象: StopShorts Android版（Expo + EAS）

このフローは **Play Console公式ヘルプ**に基づき、Claude Code がそのまま読み取ってチェックに使える形式で整理しています。

---

## 0. 事前条件（必須）

- **ターゲットAPI**  
  - 2025-08-31 以降、新規アプリ/更新は **Android 15 (API 35)** が必須  
  - 既存アプリは **API 34 以上**でないと新規ユーザーに表示されない  
  - 必要なら **2025-11-01 までの延長申請**が可能

- **Play App Signing**  
  - 初回リリース時に App Signing を構成

- **アプリはAAB（Android App Bundle）提出が前提**

---

## 1. Play Console でアプリ作成

1) Play Console → **Create app**  
2) デフォルト言語/アプリ名  
3) アプリ or ゲーム / 無料 or 有料  
4) 連絡用メール  
5) 宣言（Developer Program Policies / US export laws）  
6) Play App Signing 規約へ同意  
7) Create app

---

## 2. App content（審査用申告）

App content は **審査の前提**。未完だと審査へ進めない。

**必須項目（代表）**
- **Privacy Policy**（アプリ内＋Play Console）  
  - 公開URL・非ジオブロック・編集不可・明確な「Privacy Policy」表記  
  - 取得/利用/共有/保持/削除方針を明記
- **Data safety**（全アプリ必須）  
  - 収集/共有データの申告（SDK含む）  
  - 収集しない場合も「収集しない」申告が必要
- **Ads** の有無  
  - SDKや自社広告を含めて申告
- **App access**  
  - ログイン必須なら審査用アカウント/手順を提示
- **Target audience & content**  
  - 年齢層の申告（子ども含む場合は追加要件）
- **Permissions declaration**  
  - 高リスク/機微権限を使う場合は追加フォーム対応
- **Content ratings**  
  - 未設定だと “Unrated” で公開停止される可能性あり

**StopShorts向け注意**
- 使用状況/他アプリ情報は **個人・機微データに該当**  
  - **Prominent Disclosure + Consent** をアプリ内で必須化  
  - Data safety / Privacy Policy と整合が必要

---

## 3. ストアリスティング

**Main store listing** に以下を入力:
- アプリ名 / short & full description  
- スクリーンショット・動画  
- カテゴリ / タグ  
- 連絡先（メール必須）

---

## 4. テスト要件（個人アカウントの新規開発者のみ）

**個人アカウント（2023-11-13 以降作成）**は、  
**本番申請前に Closed Test を 12名 / 14日連続で実施**が必須。

条件:
- Closed Test に **12名以上が14日連続で opt-in**
- その後、Play Console の **Apply for production** で申請  
  - テスト内容 / フィードバック / 本番準備状況を回答

レビュー目安:
- 申請後の審査は **通常 7日以内**（長期化の可能性あり）

---

## 5. リリース作成（テスト or 本番）

1) Play Console → 対象トラックへ移動  
   - Internal / Closed / Open / Production  
2) リリース作成  
3) AAB をアップロード  
4) リリースノートを記入  
5) 送信

注意:
- **未完了のリリースがあると新しいリリースは作成できない**

---

## 6. 本番公開（Production）

前提:
1) App content 完了  
2) Store listing 完了  
3) Data safety 完了  
4) Closed Test 条件（個人アカウントの場合）

公開まで:
1) Production トラックでリリース作成  
2) 審査へ送信  
3) 審査完了後に公開

---

## 7. StopShorts 用チェックリスト（短縮版）

- [ ] targetSdk = 35（API 35）  
- [ ] Data safety 完了  
- [ ] Privacy Policy（Play Console + アプリ内リンク）  
- [ ] App access（ログイン必要なら審査用アカウント）  
- [ ] Ads の有無申告  
- [ ] Permissions 宣言（Usage Stats / Overlay 等が該当）  
- [ ] Content ratings 完了  
- [ ] Closed Test 12人/14日（個人アカウントのみ）  
- [ ] AAB 提出  
