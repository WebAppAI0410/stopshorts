# StopShorts - パーソナライズ設計 & 行動変容戦略

## 1. パーソナライズ戦略概要

### 1.1 パーソナライズの3層構造

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: 動的最適化（AI/ML）                                │
│  - 使用パターン学習                                          │
│  - 文言効果測定                                              │
│  - 介入タイミング最適化                                      │
│  └──────────────────────────────────────────────────────────│
│  Layer 2: コンテキスト適応                                   │
│  - 時間帯別                                                  │
│  - 曜日別                                                    │
│  - ストリーク状況別                                          │
│  └──────────────────────────────────────────────────────────│
│  Layer 1: 静的属性（オンボーディング時）                     │
│  - 目的（Purpose）                                           │
│  - 実装意図（Implementation Intent）                         │
│  - 遮断時間設定                                              │
└─────────────────────────────────────────────────────────────┘
        ↓ MVP         ↓ v1.0           ↓ v2.0+
```

---

## 2. Layer 1: オンボーディングパーソナライズ

### 2.1 目的（Purpose）別プロファイル

#### 2.1.1 睡眠改善プロファイル

| 設定項目 | デフォルト値 | 理由 |
|---------|------------|------|
| 重点時間帯 | 22:00-翌7:00 | 睡眠前が最も効果的な介入タイミング |
| 遮断時間 | 3分（夜間）/ 5分（日中） | 夜は短い方が効果的 |
| 文言トーン | 穏やか、睡眠の質に言及 | 興奮を避ける |

**Shield文言バリエーション**:
```
基本: 「質の良い睡眠は、明日の自分への投資です」
深夜: 「今寝れば、明日6時間の集中力を手に入れられます」
連続視聴時: 「ブルーライトが睡眠ホルモンを抑制しています」
```

#### 2.1.2 学習・勉強プロファイル

| 設定項目 | デフォルト値 | 理由 |
|---------|------------|------|
| 重点時間帯 | 9:00-22:00 | 学習時間帯をカバー |
| 遮断時間 | 5分 | 集中力の切り替えを考慮 |
| 文言トーン | 励まし、目標達成に言及 | モチベーション維持 |

**Shield文言バリエーション**:
```
基本: 「今の5分が、将来の可能性を広げます」
試験期間: 「この時間を勉強に使えば、目標に1歩近づきます」
午後: 「脳の集中力は、ここから取り戻せます」
```

#### 2.1.3 仕事効率プロファイル

| 設定項目 | デフォルト値 | 理由 |
|---------|------------|------|
| 重点時間帯 | 9:00-18:00 | 勤務時間帯 |
| 遮断時間 | 5分 | 小休憩との区別 |
| 文言トーン | プロフェッショナル、生産性に言及 | ビジネスマインド |

**Shield文言バリエーション**:
```
基本: 「集中を取り戻して、成果を出しましょう」
午前: 「午前中の集中力は、午後の2倍の価値があります」
会議前: 「次のタスクに備えて、頭をクリアにしましょう」
```

#### 2.1.4 創作・趣味プロファイル

| 設定項目 | デフォルト値 | 理由 |
|---------|------------|------|
| 重点時間帯 | 終日 | 創作意欲は予測不可能 |
| 遮断時間 | 5分 | インスピレーション維持 |
| 文言トーン | 創造性、アウトプットに言及 | クリエイティブ志向 |

**Shield文言バリエーション**:
```
基本: 「消費より創造。あなたの才能を世界に」
夜: 「インプットは十分。アウトプットの時間です」
連続視聴時: 「他人のコンテンツを見ても、あなたの作品は生まれません」
```

#### 2.1.5 メンタルヘルスプロファイル

| 設定項目 | デフォルト値 | 理由 |
|---------|------------|------|
| 重点時間帯 | 終日 | 精神状態は常に重要 |
| 遮断時間 | 3分 | 早めの介入が有効 |
| 文言トーン | 優しい、自己肯定に言及 | 自己批判を避ける |

**Shield文言バリエーション**:
```
基本: 「比較をやめて、自分のペースを大切に」
朝: 「今日も自分らしく過ごせる日です」
夜: 「今日も頑張りました。ゆっくり休みましょう」
```

### 2.2 目的別オンボーディング分岐

```
[Purpose Selection]
       │
       ├── 睡眠改善 ──→ [追加質問: 普段の就寝時間は？]
       │                      │
       │                      └─→ 夜間強化モード提案
       │
       ├── 学習・勉強 ──→ [追加質問: 今の目標は？]
       │                       │
       │                       └─→ 試験/資格/自己学習
       │
       ├── 仕事効率 ──→ [追加質問: 勤務形態は？]
       │                     │
       │                     └─→ オフィス/リモート/フレックス
       │
       ├── 創作・趣味 ──→ [追加質問: 何を作っていますか？]
       │                       │
       │                       └─→ 文言カスタマイズ
       │
       └── メンタルヘルス ──→ [追加質問: 特に気になる時間帯は？]
                                   │
                                   └─→ 重点介入時間設定
```

---

## 3. Layer 2: コンテキスト適応

### 3.1 時間帯別メッセージマトリックス

| 時間帯 | 心理状態 | アプローチ | 文言例 |
|--------|---------|-----------|--------|
| 早朝（5-7時） | 眠気、習慣形成前 | 1日の可能性を提示 | 「朝の時間は3倍の価値があります」 |
| 朝（7-9時） | 準備、活動開始 | 今日の目標にフォーカス | 「今日達成したいことは何ですか？」 |
| 午前（9-12時） | 集中力高い | 生産性の損失を示す | 「今が最も集中できる時間帯です」 |
| 昼（12-14時） | 休憩、リラックス | 代替活動を提案 | 「昼食後は散歩がおすすめです」 |
| 午後（14-17時） | 集中力低下傾向 | 小さな成功を促す | 「あと少しで今日のタスク完了」 |
| 夕方（17-19時） | 疲労、開放感 | 夜の過ごし方を示す | 「残りの時間を有意義に使いましょう」 |
| 夜（19-22時） | リラックス、自由時間 | 睡眠への導入 | 「明日のために、そろそろ休みましょう」 |
| 深夜（22-5時） | 眠気、判断力低下 | 強い警告 | 「睡眠不足は明日のパフォーマンスを30%下げます」 |

### 3.2 曜日別調整

| 曜日 | 特性 | 調整 |
|------|-----|------|
| 月曜 | 週の開始、モチベーション高め | 週目標の提示 |
| 火-木 | ルーティン | 標準設定 |
| 金曜 | 疲労蓄積、週末への期待 | 達成感を演出 |
| 土曜 | 自由時間、誘惑が増える | 時間の使い方を意識させる |
| 日曜 | リラックス、翌週への準備 | 新週への意気込み |

### 3.3 ストリーク状況別

| ストリーク | 心理状態 | メッセージ戦略 |
|-----------|---------|---------------|
| 0日（初日/リセット後） | 新鮮、または落胆 | 「今日から新しいスタート」 |
| 1-2日 | 習慣形成初期 | 「良い調子です。続けましょう」 |
| 3-6日 | 習慣の芽生え | 「もうすぐ1週間達成！」 |
| 7日 | マイルストーン | 🎉「1週間達成！習慣になり始めています」 |
| 8-13日 | 安定期 | 「新しい習慣が定着してきました」 |
| 14日 | 2週間マイルストーン | 「2週間！脳の報酬系が変化しています」 |
| 21日+ | 習慣確立期 | 「あなたはもう変わっています」 |
| 30日 | 1ヶ月マイルストーン | 🏆「1ヶ月達成！」+達成レポート |

### 3.4 連続失敗時の対応

```
失敗パターン検出:
- 同日に3回以上「あと5分」を選択
- ストリークが3日連続でリセット
- 1週間以上アプリを開いていない

対応メッセージ:
「大丈夫、習慣は一度で身につくものではありません。
 多くの人が何度もつまずきながら、最終的に成功しています。
 小さく始めましょう。今日は3分だけ試してみませんか？」

提案:
- 遮断時間を短くする（5分→3分）
- 対象アプリを減らす
- 時間帯を限定する
```

---

## 4. 行動変容メカニズム詳細

### 4.1 習慣ループの分断

#### 4.1.1 ショート動画視聴の習慣ループ

```
┌─────────────┐
│   キュー    │ → 退屈、ストレス、通知、空き時間
└─────────────┘
       │
       ▼
┌─────────────┐
│ ルーティン  │ → アプリを開く → スワイプ → 視聴継続
└─────────────┘
       │
       ▼
┌─────────────┐
│   報酬      │ → ドーパミン放出（変動報酬）
└─────────────┘
       │
       └────────────────→ ループ強化
```

#### 4.1.2 StopShortsによる介入

```
┌─────────────┐
│   キュー    │ → 退屈、ストレス、通知
└─────────────┘
       │
       ▼
┌─────────────┐
│ ルーティン  │ → アプリを開く → 5分視聴
└─────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│            🛡️ Shield（介入）             │
│                                         │
│  - 習慣ループの物理的分断                │
│  - パーソナライズメッセージ              │
│  - 代替行動の想起（Implementation Intent）│
└─────────────────────────────────────────┘
       │
       ├─── 閉じる（成功）──→ 新しい行動へ
       │                          │
       │                    ┌─────────────┐
       │                    │  新しい報酬  │
       │                    │ (自己効力感) │
       │                    └─────────────┘
       │
       └─── 継続（失敗）──→ 5分後に再介入
```

### 4.2 変動報酬の代替

ショート動画の依存性は「変動報酬」によるもの。StopShortsでは以下で代替する：

| ショート動画の報酬 | StopShortsの代替報酬 |
|-------------------|---------------------|
| 次の動画への期待（ドーパミン） | ストリーク継続の達成感 |
| 「いいね」「コメント」の社会的承認 | 「○時間節約」の自己承認 |
| 無限スクロールの没入感 | 目標達成へのプログレス感 |

### 4.3 Implementation Intentions（実装意図）

#### 4.3.1 心理学的背景

Gollwitzer (1999) の研究により、「いつ・どこで・何をするか」を事前に決めておくと、目標達成率が2-3倍になることが示されている。

#### 4.3.2 本アプリでの実装

**設定フロー**:
```
質問: 「Shieldが現れたとき、何をしますか？」

選択肢:
- 🧘 深呼吸して閉じる
- 🚶 立ち上がって伸びをする
- 💧 水を飲む
- 📝 やるべきことを確認する
- ✏️ 自分で決める（自由入力）

保存されるデータ:
{
  "implementation_intent": {
    "trigger": "shield_displayed",
    "action": "deep_breath_close",
    "display_text": "深呼吸して閉じる"
  }
}
```

**Shield画面での表示**:
```
┌─────────────────────────────────────┐
│                                     │
│    あなたの約束:                     │
│    「深呼吸して閉じる」              │
│                                     │
└─────────────────────────────────────┘
```

### 4.4 損失回避の活用

#### 4.4.1 前払いによるコミットメント

```
心理メカニズム:
「すでに払ったお金を無駄にしたくない」
→ アプリを使い続ける動機

設計:
- 30日: ¥980（1日33円）
- 90日: ¥1,980（1日22円、67% OFF）
- 年間: ¥3,980（1日11円、85% OFF）

コミュニケーション:
「あなたはすでに¥980をより良い生活に投資しました。
 この投資を最大限活用しましょう。」
```

#### 4.4.2 サンクコストの正の活用

```
表示例（30日プラン15日目）:
「あなたはすでに:
 - 15日間継続
 - 7.5時間を取り戻し
 - ¥490分の価値を享受

 残り15日で、さらに7.5時間取り戻せます。」
```

### 4.5 自己効力感の醸成

#### 4.5.1 小さな成功体験の積み重ね

| マイルストーン | 表示 | 心理効果 |
|--------------|------|---------|
| 初回Shield閉じる | 「最初の一歩！」 | 成功体験の開始 |
| 1日達成 | 「1日達成」 | 具体的な進捗 |
| 3日連続 | 「3日連続！」 | パターンの認識 |
| 7日連続 | 「1週間達成！🎉」 | 自己イメージの変化 |

#### 4.5.2 進捗の可視化

```
[今日の記録]
━━━━━━━━━━━━━━━━━━━━━━
介入: 3回
閉じた: 3回 (100%)
取り戻した時間: 45分

[今週の推移]
月 火 水 木 金 土 日
✓  ✓  ✓  ✓  ○  ○  ○
4日連続達成中！
```

---

## 5. A/Bテスト計画

### 5.1 初期テスト項目

| テスト | バリアントA | バリアントB | 測定指標 |
|--------|-----------|-----------|---------|
| Shield文言 | 標準文言 | パーソナライズ文言 | 閉じる率 |
| 遮断時間 | 5分固定 | 3分スタート | D7継続率 |
| 価格表示 | 月額表示 | 日割り表示 | CVR |
| オンボーディング長さ | 6ステップ | 4ステップ | 完了率 |

### 5.2 Shield文言の効果測定

```
測定する指標:
1. 閉じる率（Shield表示後に「閉じる」を選択した割合）
2. 継続時間（「あと5分」選択後、再度Shield表示までの時間）
3. 日次継続率（翌日もアプリを使用した割合）

データ収集（ローカル保存、匿名化）:
{
  "shield_events": [
    {
      "timestamp": "2024-12-19T22:30:00Z",
      "message_variant": "sleep_quality_v1",
      "action": "close",
      "time_since_app_open": 300
    }
  ]
}
```

---

## 6. パーソナライズエンジン仕様（MVP）

### 6.1 アーキテクチャ

```
┌────────────────────────────────────────────┐
│            PersonalizationEngine           │
├────────────────────────────────────────────┤
│                                            │
│  Input:                                    │
│  - UserProfile (purpose, intent)           │
│  - Context (time, day, streak)             │
│  - History (recent_actions)                │
│                                            │
│  Processing:                               │
│  1. Purpose-based message selection        │
│  2. Time-based adjustment                  │
│  3. Streak-based modifier                  │
│  4. Failure recovery check                 │
│                                            │
│  Output:                                   │
│  - ShieldMessage                           │
│  - ActionRecommendation                    │
│                                            │
└────────────────────────────────────────────┘
```

### 6.2 メッセージ選択ロジック（MVP）

```typescript
// 疑似コード
function selectShieldMessage(
  profile: UserProfile,
  context: Context,
  history: History
): ShieldMessage {

  // 1. 目的別ベースメッセージ取得
  const baseMessages = getMessagesByPurpose(profile.purpose);

  // 2. 時間帯フィルタ
  const timeFiltered = filterByTimeOfDay(baseMessages, context.hour);

  // 3. ストリーク別調整
  let message = selectByStreak(timeFiltered, history.currentStreak);

  // 4. 連続失敗時の特別対応
  if (history.recentFailures >= 3) {
    message = getRecoveryMessage(profile.purpose);
  }

  // 5. Implementation Intentの追加
  message.implementationIntent = profile.intent;

  return message;
}
```

### 6.3 データモデル

```typescript
interface UserProfile {
  purpose: 'sleep' | 'study' | 'work' | 'creative' | 'mental';
  purposeDetail?: string;  // 追加質問の回答
  implementationIntent: {
    trigger: 'shield_displayed';
    action: string;
    displayText: string;
  };
  createdAt: Date;
}

interface ShieldSettings {
  targetApps: AppToken[];  // Family Controls tokens
  thresholdMinutes: number;
  activeTimeRanges: TimeRange[];
}

interface UserHistory {
  currentStreak: number;
  longestStreak: number;
  totalInterventions: number;
  totalClosed: number;
  recentActions: ShieldAction[];  // 直近10件
}

interface ShieldAction {
  timestamp: Date;
  action: 'close' | 'continue';
  messageId: string;
}
```

---

## 7. 将来拡張（Layer 3: AI/ML）

### 7.1 使用パターン学習

```
収集データ（ローカル、匿名化）:
- 時間帯別の「閉じる」率
- 曜日別の介入回数
- 連続視聴が起きやすいコンテキスト

学習モデル:
- ユーザー個別の「危険な時間帯」予測
- 最も効果的なメッセージの特定
- 最適な遮断タイミングの推定
```

### 7.2 介入最適化

```
目標:
「最小の介入回数で最大の行動変容を達成する」

アプローチ:
- 事前警告（5分前に通知）の効果測定
- 時間帯別遮断時間の動的調整
- ユーザー状態推定に基づく文言選択
```

---

## 付録: メッセージライブラリ（MVP版）

### A. 睡眠改善

```
sleep_standard_01: "質の良い睡眠は、明日の自分への投資です"
sleep_standard_02: "今寝れば、明日6時間の集中力を手に入れられます"
sleep_night_01: "ブルーライトが睡眠ホルモンを抑制しています"
sleep_night_02: "睡眠不足は明日のパフォーマンスを30%下げます"
sleep_recovery_01: "大丈夫、明日からまた始めましょう"
```

### B. 学習・勉強

```
study_standard_01: "今の5分が、将来の可能性を広げます"
study_standard_02: "この時間を勉強に使えば、目標に1歩近づきます"
study_morning_01: "脳が最も活性化している時間です"
study_afternoon_01: "休憩は大切。でも、動画は休憩になりません"
study_recovery_01: "小さな一歩から。3分だけ本を開いてみませんか？"
```

### C. 仕事効率

```
work_standard_01: "集中を取り戻して、成果を出しましょう"
work_standard_02: "この5分が、今日の評価を変えるかもしれません"
work_morning_01: "午前中の集中力は、午後の2倍の価値があります"
work_afternoon_01: "あと少しで今日のタスクが完了します"
work_recovery_01: "完璧を求めず、まず1つのタスクに集中しましょう"
```

### D. 創作・趣味

```
creative_standard_01: "消費より創造。あなたの才能を世界に"
creative_standard_02: "インプットは十分。アウトプットの時間です"
creative_evening_01: "他人のコンテンツを見ても、あなたの作品は生まれません"
creative_recovery_01: "創作意欲は、まず手を動かすことから生まれます"
```

### E. メンタルヘルス

```
mental_standard_01: "比較をやめて、自分のペースを大切に"
mental_standard_02: "SNSの世界は、現実の一部でしかありません"
mental_morning_01: "今日も自分らしく過ごせる日です"
mental_night_01: "今日も頑張りました。ゆっくり休みましょう"
mental_recovery_01: "自分を責めないで。少しずつでいいんです"
```

---

## 8. 睡眠プロファイルに基づく時間関連コーチング

### 8.1 概要

ユーザーの睡眠パターン（就寝時間・起床時間）を把握し、特に睡眠前の時間帯では強化されたコーチングを提供する。

```
┌─────────────────────────────────────────────────────────────┐
│                 睡眠プロファイル連携                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  入力データ:                                                 │
│  ├── ユーザー設定の就寝時間（例: 23:00）                      │
│  ├── ユーザー設定の起床時間（例: 07:00）                      │
│  └── 現在時刻                                                │
│                                                             │
│  出力:                                                       │
│  ├── 警告レベル（low / medium / high / critical）            │
│  ├── パーソナライズ文言                                      │
│  ├── 推奨遮断時間（通常より短縮等）                           │
│  └── UI調整（色、トーン）                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 データ取得アプローチ

#### 8.2.1 MVP: ユーザー入力ベース（推奨）

オンボーディングで直接聞く方式。追加の権限が不要。

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    あなたの生活リズムを教えてください                        │
│                                                             │
│    より効果的なコーチングのために使わせていただきます        │
│                                                             │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│                                                             │
│    普段の就寝時間:                                           │
│    ┌─────────────┐                                          │
│    │   23:00   ▼ │                                          │
│    └─────────────┘                                          │
│                                                             │
│    普段の起床時間:                                           │
│    ┌─────────────┐                                          │
│    │   07:00   ▼ │                                          │
│    └─────────────┘                                          │
│                                                             │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│                                                             │
│    💡 就寝前の時間帯は特に注意深くサポートします              │
│                                                             │
│    [次へ]                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**メリット**:
- 追加の権限不要
- 実装がシンプル
- 審査リスクなし

**デメリット**:
- ユーザーの自己申告に依存
- 実際の睡眠パターンと乖離する可能性

#### 8.2.2 将来（v2.0+）: HealthKit連携

```typescript
// HealthKitから取得可能なデータ
interface HealthKitSleepData {
  // 睡眠分析データ
  sleepAnalysis: {
    startTime: Date;    // 就寝時刻
    endTime: Date;      // 起床時刻
    quality: 'inBed' | 'asleep' | 'awake' | 'deep' | 'rem';
  }[];

  // 過去7日間の平均
  averageBedtime: string;     // "23:15"
  averageWakeTime: string;    // "07:30"
  averageDuration: number;    // 分
}
```

**メリット**:
- 実際のデータに基づく精度の高いコーチング
- Apple Watchユーザーには特に有効

**デメリット**:
- HealthKit権限が必要（審査での説明必要）
- Apple Watchがないと精度が落ちる
- 実装が複雑

### 8.3 時間帯別警告レベル

```
         就寝2時間前    就寝1時間前    就寝時間      深夜2時
              │              │           │           │
              ▼              ▼           ▼           ▼
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │  通常    │  注意    │  警告    │ 最高警告 │ 最高警告 │
  │  (low)   │ (medium) │  (high)  │(critical)│(critical)│
  └──────────┴──────────┴──────────┴──────────┴──────────┘
      ↓          ↓          ↓          ↓          ↓
  標準文言   睡眠準備    睡眠促進    強い警告    健康警告
             の示唆     メッセージ
```

### 8.4 警告レベル別の設定

| 警告レベル | 時間帯（就寝23:00の場合） | 遮断時間 | 文言トーン | UI |
|-----------|-------------------------|---------|-----------|-----|
| **low** | 〜21:00 | 5分（通常） | 標準 | 通常 |
| **medium** | 21:00-22:00 | 5分 | 睡眠準備を示唆 | 通常 |
| **high** | 22:00-23:00 | 3分（短縮） | 睡眠促進 | 暖色系 |
| **critical** | 23:00〜 | 3分（短縮） | 強い警告 | 暖色系 + 警告 |

### 8.5 時間帯別Shield文言

#### 就寝2時間前（medium）
```
「就寝まであと2時間。良質な睡眠の準備を始めましょう」
「夜の時間を大切に。明日の自分のために」
```

#### 就寝1時間前（high）
```
「就寝まであと1時間。画面から離れる準備をしましょう」
「ブルーライトは睡眠ホルモンの分泌を妨げます」
「良質な睡眠のために、そろそろ画面から離れましょう」
```

#### 就寝時間以降（critical）
```
「就寝時間を過ぎています。今すぐ休みましょう」
「睡眠不足は明日のパフォーマンスを30%下げます」
「ブルーライトが睡眠ホルモンを抑制しています」
```

#### 深夜（critical）
```
「深夜の視聴は睡眠負債を増やします」
「この時間の視聴は、明日1日に影響します」
「今すぐ端末を置いて、休みましょう」
```

### 8.6 実装詳細

#### 8.6.1 データモデル

```typescript
interface SleepProfile {
  bedtime: string;      // "23:00"
  wakeTime: string;     // "07:00"
  source: 'user_input' | 'healthkit';
  lastUpdated: Date;
}

interface TimeBasedContext {
  currentTime: Date;
  sleepProfile: SleepProfile;
  minutesUntilBedtime: number;    // 負の場合は就寝時間過ぎ
  isInSleepWindow: boolean;       // 就寝〜起床の間
}

interface CoachingContext {
  warningLevel: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestedThresholdMinutes: number;
  uiHints: {
    useWarmColors: boolean;
    showWarningIcon: boolean;
    emphasizeSleep: boolean;
  };
}
```

#### 8.6.2 コーチングロジック

```typescript
function getTimeBasedCoaching(
  currentTime: Date,
  sleepProfile: SleepProfile,
  purpose: Purpose
): CoachingContext {

  const bedtimeMinutes = parseTimeToMinutes(sleepProfile.bedtime);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const minutesUntilBedtime = bedtimeMinutes - currentMinutes;

  // 深夜（就寝時間から4時間以上経過、かつ起床前）
  if (minutesUntilBedtime < -240 && currentMinutes < parseTimeToMinutes(sleepProfile.wakeTime)) {
    return {
      warningLevel: 'critical',
      message: getRandomMessage(MESSAGES.sleep.late_night),
      suggestedThresholdMinutes: 3,
      uiHints: {
        useWarmColors: true,
        showWarningIcon: true,
        emphasizeSleep: true,
      },
    };
  }

  // 就寝時間以降（〜4時間）
  if (minutesUntilBedtime < 0) {
    return {
      warningLevel: 'critical',
      message: getRandomMessage(MESSAGES.sleep.past_bedtime),
      suggestedThresholdMinutes: 3,
      uiHints: {
        useWarmColors: true,
        showWarningIcon: true,
        emphasizeSleep: true,
      },
    };
  }

  // 就寝1時間前
  if (minutesUntilBedtime <= 60) {
    return {
      warningLevel: 'high',
      message: getRandomMessage(MESSAGES.sleep.pre_bedtime_1h),
      suggestedThresholdMinutes: 3,
      uiHints: {
        useWarmColors: true,
        showWarningIcon: false,
        emphasizeSleep: true,
      },
    };
  }

  // 就寝2時間前
  if (minutesUntilBedtime <= 120) {
    return {
      warningLevel: 'medium',
      message: getRandomMessage(MESSAGES.sleep.pre_bedtime_2h),
      suggestedThresholdMinutes: 5,
      uiHints: {
        useWarmColors: false,
        showWarningIcon: false,
        emphasizeSleep: true,
      },
    };
  }

  // 通常時間帯
  return getDefaultCoaching(purpose);
}
```

#### 8.6.3 目的との組み合わせ

睡眠プロファイルは、ユーザーの目的（Purpose）と組み合わせて使用：

```typescript
function selectShieldMessage(
  profile: UserProfile,
  sleepProfile: SleepProfile,
  context: Context
): ShieldMessage {

  // 1. 時間帯ベースのコーチングを取得
  const timeCoaching = getTimeBasedCoaching(
    context.currentTime,
    sleepProfile,
    profile.purpose
  );

  // 2. 目的が「睡眠改善」の場合は、時間関連を優先
  if (profile.purpose === 'sleep') {
    return {
      ...timeCoaching,
      implementationIntent: profile.implementationIntent,
    };
  }

  // 3. 他の目的でも、critical時は睡眠を優先
  if (timeCoaching.warningLevel === 'critical') {
    return {
      ...timeCoaching,
      // 目的に関わらず睡眠メッセージを表示
      message: `${timeCoaching.message}\n（${getPurposeReminder(profile.purpose)}）`,
      implementationIntent: profile.implementationIntent,
    };
  }

  // 4. 通常は目的ベースのメッセージ
  return getPurposeBasedMessage(profile, context);
}
```

### 8.7 UI調整

#### 8.7.1 警告レベル別の色

```typescript
const WARNING_COLORS = {
  low: {
    background: '#FFFFFF',      // 白
    accent: '#4F46E5',          // Indigo（通常）
    text: '#111827',            // 黒
  },
  medium: {
    background: '#FFFBEB',      // Amber-50
    accent: '#F59E0B',          // Amber-500
    text: '#111827',
  },
  high: {
    background: '#FEF3C7',      // Amber-100
    accent: '#D97706',          // Amber-600
    text: '#111827',
  },
  critical: {
    background: '#FEE2E2',      // Red-100
    accent: '#DC2626',          // Red-600
    text: '#111827',
  },
};
```

#### 8.7.2 Shield画面の調整（就寝時間帯）

```
┌─────────────────────────────────────────┐
│          背景: 暖色系グラデーション       │
│                                         │
│              🌙                          │
│                                         │
│    就寝時間を過ぎています                │
│                                         │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                         │
│    睡眠不足は明日のパフォーマンスを      │
│    30%下げます                          │
│                                         │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                         │
│    あなたの約束:                         │
│    「深呼吸して閉じる」                  │
│                                         │
│    ┌─────────────────────────────┐      │
│    │      今すぐ休む              │      │
│    └─────────────────────────────┘      │
│                                         │
│    あと5分だけ（おすすめしません）        │
│                                         │
└─────────────────────────────────────────┘
```

### 8.8 設定画面

```
┌─────────────────────────────────────────┐
│  ←  睡眠プロファイル                     │
│                                         │
│    ━━ 生活リズム ━━━━━━━━━━━━━━━━━━━    │
│                                         │
│    普段の就寝時間                        │
│    [23:00]                          >   │
│                                         │
│    普段の起床時間                        │
│    [07:00]                          >   │
│                                         │
│    ━━ 就寝前の設定 ━━━━━━━━━━━━━━━━━    │
│                                         │
│    就寝前の強化モード                    │
│    [オン]                           >   │
│                                         │
│    強化開始時間                          │
│    就寝 [2] 時間前から               >   │
│                                         │
│    就寝前の遮断時間                      │
│    [3分]（通常より短縮）             >   │
│                                         │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                         │
│    💡 就寝前の時間帯は、より頻繁に       │
│       介入して睡眠の質を守ります         │
│                                         │
└─────────────────────────────────────────┘
```

### 8.9 将来拡張: HealthKit連携

v2.0以降で、ユーザーが許可した場合にHealthKitと連携：

```typescript
// HealthKit連携の設計
import * as HealthKit from 'expo-health';

async function syncSleepProfile(): Promise<SleepProfile | null> {
  // 1. 権限チェック
  const permissions = await HealthKit.requestPermissionsAsync([
    HealthKit.HKCategoryTypeIdentifier.sleepAnalysis,
  ]);

  if (!permissions.granted) {
    return null;  // ユーザー入力にフォールバック
  }

  // 2. 過去7日間の睡眠データ取得
  const sleepData = await HealthKit.getSleepAnalysisAsync({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });

  // 3. 平均就寝・起床時間を計算
  const averageBedtime = calculateAverageBedtime(sleepData);
  const averageWakeTime = calculateAverageWakeTime(sleepData);

  return {
    bedtime: averageBedtime,
    wakeTime: averageWakeTime,
    source: 'healthkit',
    lastUpdated: new Date(),
  };
}
```

**審査対応**:
```
HealthKit権限の使用理由:

StopShortsはHealthKitの睡眠分析データを使用して、
ユーザーの実際の睡眠パターンに基づいた
パーソナライズされたコーチングを提供します。

このデータは:
- ユーザーの端末内でのみ処理されます
- 外部サーバーには送信されません
- より効果的な就寝前のサポートに使用されます

ユーザーは設定からいつでもこの機能を無効にできます。
```
