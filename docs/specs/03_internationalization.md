# StopShorts - 多言語対応（i18n）設計

## 1. 多言語対応戦略

### 1.1 フェーズ計画

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: MVP（日本語のみ）                                  │
├─────────────────────────────────────────────────────────────┤
│  - コア機能の完成に集中                                      │
│  - 日本市場でのPMF（Product-Market Fit）検証                 │
│  - フィードバック収集・改善                                   │
│  - i18n設計は最初から組み込み（将来対応を容易に）             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: v1.0（日本語 + 英語）                              │
├─────────────────────────────────────────────────────────────┤
│  - 英語対応（グローバル展開の第一歩）                         │
│  - App Store説明文の英語化                                   │
│  - Shield文言の英語版作成                                    │
│  - 英語圏でのマーケティング開始                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: v2.0+（多言語展開）                                │
├─────────────────────────────────────────────────────────────┤
│  - 中国語（簡体字/繁体字）                                   │
│  - 韓国語                                                   │
│  - スペイン語                                                │
│  - その他（需要に応じて）                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 対応言語の優先順位

| 優先度 | 言語 | 対応時期 | 理由 |
|:------:|------|---------|------|
| 1 | 日本語 | MVP | 初期市場、開発者の母語 |
| 2 | 英語 | v1.0 | グローバル標準、市場規模 |
| 3 | 中国語（簡体字） | v2.0 | 市場規模、ショート動画文化 |
| 4 | 韓国語 | v2.0 | 市場規模、文化的親和性 |
| 5 | スペイン語 | v2.0+ | グローバル話者数 |

---

## 2. 技術実装

### 2.1 使用ライブラリ

```json
// package.json
{
  "dependencies": {
    "expo-localization": "^15.0.0",
    "i18n-js": "^4.3.0"
  }
}
```

| ライブラリ | 用途 |
|-----------|------|
| `expo-localization` | 端末のロケール取得、日時フォーマット |
| `i18n-js` | 翻訳文字列の管理、補間 |

### 2.2 ディレクトリ構造

```
lib/
└── i18n/
    ├── index.ts           # i18n初期化・設定
    ├── locales/
    │   ├── ja.json        # 日本語
    │   ├── en.json        # 英語
    │   └── ...
    └── types.ts           # 型定義
```

### 2.3 実装コード

```typescript
// lib/i18n/index.ts
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import ja from './locales/ja.json';
import en from './locales/en.json';

const i18n = new I18n({
  ja,
  en,
});

// 端末の言語設定を使用（サポート外の場合は日本語）
i18n.locale = Localization.locale.split('-')[0];
i18n.defaultLocale = 'ja';
i18n.enableFallback = true;

export default i18n;

// 使用例
// i18n.t('shield.title')
// i18n.t('shield.message', { minutes: 5 })
```

### 2.4 翻訳ファイル構造

```json
// lib/i18n/locales/ja.json
{
  "app": {
    "name": "StopShorts"
  },
  "onboarding": {
    "welcome": {
      "title": "5分で止める、人生を取り戻す",
      "subtitle": "\"気づいたら1時間\"を終わりにする",
      "cta": "始める"
    },
    "purpose": {
      "title": "なぜショート動画をやめたいですか？",
      "subtitle": "あなたに合った体験をカスタマイズします",
      "options": {
        "sleep": "睡眠の質を改善したい",
        "study": "勉強・学習に集中したい",
        "work": "仕事の生産性を上げたい",
        "creative": "創作・趣味の時間を増やす",
        "mental": "メンタルヘルスを守りたい",
        "other": "その他"
      }
    },
    "sleep_profile": {
      "title": "あなたの生活リズムを教えてください",
      "bedtime_label": "普段の就寝時間",
      "waketime_label": "普段の起床時間",
      "hint": "就寝前の時間帯は特に注意深くサポートします"
    }
  },
  "shield": {
    "title": "{{minutes}}分が経過しました",
    "close_button": "閉じる",
    "continue_button": "あと{{minutes}}分だけ",
    "messages": {
      "sleep": {
        "default": "質の良い睡眠は、明日の自分への投資です",
        "pre_bedtime": "就寝まであと{{hours}}時間。良質な睡眠のために、そろそろ画面から離れましょう。",
        "past_bedtime": "就寝時間を過ぎています。ブルーライトは睡眠ホルモンを30%抑制します。",
        "late_night": "深夜の視聴は睡眠負債を増やします。明日のパフォーマンスに影響します。"
      },
      "study": {
        "default": "今の5分が、将来の可能性を広げます"
      },
      "work": {
        "default": "集中を取り戻して、成果を出しましょう"
      }
    },
    "implementation_intent": "あなたの約束: {{action}}"
  },
  "home": {
    "greeting": "おかえりなさい、{{name}}さん",
    "status": {
      "protected": "保護中",
      "paused": "一時停止中",
      "error": "設定が必要"
    },
    "today": {
      "interventions": "今日の介入",
      "time_saved": "取り戻した時間",
      "times": "{{count}}回",
      "minutes": "{{count}}分"
    },
    "streak": "{{count}}日連続達成中！"
  },
  "statistics": {
    "title": "統計",
    "tabs": {
      "today": "今日",
      "week": "週間",
      "month": "月間"
    },
    "time_saved": "取り戻した時間",
    "interventions": "介入回数",
    "success_rate": "成功率"
  },
  "settings": {
    "title": "設定",
    "sections": {
      "shield": "遮断設定",
      "message": "メッセージ",
      "account": "アカウント",
      "other": "その他"
    }
  },
  "subscription": {
    "trial_ended": "1日間の体験が終了しました",
    "your_results": "あなたの成果",
    "interventions": "{{count}}回の介入",
    "time_saved": "{{minutes}}分を取り戻した",
    "success_rate": "成功率 {{rate}}%",
    "plans": {
      "challenge30": {
        "name": "30日チャレンジ",
        "description": "まずは30日から始める"
      },
      "master90": {
        "name": "90日マスター",
        "description": "90日で習慣を完全に変える",
        "recommended": "おすすめ"
      },
      "yearly": {
        "name": "年間プラン",
        "description": "最もお得なプラン"
      }
    },
    "free_option": "機能制限版で続ける",
    "free_limitation": "（1日1回の遮断のみ、パーソナライズなし）"
  },
  "common": {
    "next": "次へ",
    "back": "戻る",
    "done": "完了",
    "cancel": "キャンセル",
    "save": "保存",
    "per_day": "1日約{{price}}円"
  }
}
```

```json
// lib/i18n/locales/en.json
{
  "app": {
    "name": "StopShorts"
  },
  "onboarding": {
    "welcome": {
      "title": "Stop in 5 minutes, reclaim your life",
      "subtitle": "End the \"I lost an hour\" moments",
      "cta": "Get Started"
    },
    "purpose": {
      "title": "Why do you want to quit short videos?",
      "subtitle": "We'll customize your experience",
      "options": {
        "sleep": "Improve my sleep quality",
        "study": "Focus on studying",
        "work": "Boost work productivity",
        "creative": "More time for hobbies",
        "mental": "Protect my mental health",
        "other": "Other"
      }
    },
    "sleep_profile": {
      "title": "Tell us about your daily routine",
      "bedtime_label": "Usual bedtime",
      "waketime_label": "Usual wake time",
      "hint": "We'll provide extra support before your bedtime"
    }
  },
  "shield": {
    "title": "{{minutes}} minutes have passed",
    "close_button": "Close",
    "continue_button": "Just {{minutes}} more minutes",
    "messages": {
      "sleep": {
        "default": "Quality sleep is an investment in tomorrow's you",
        "pre_bedtime": "{{hours}} hour(s) until bedtime. Time to disconnect for better sleep.",
        "past_bedtime": "It's past your bedtime. Blue light suppresses sleep hormones by 30%.",
        "late_night": "Late night browsing creates sleep debt. It affects tomorrow's performance."
      },
      "study": {
        "default": "These 5 minutes now expand your future possibilities"
      },
      "work": {
        "default": "Regain your focus and achieve results"
      }
    },
    "implementation_intent": "Your commitment: {{action}}"
  },
  "home": {
    "greeting": "Welcome back, {{name}}",
    "status": {
      "protected": "Protected",
      "paused": "Paused",
      "error": "Setup required"
    },
    "today": {
      "interventions": "Today's interventions",
      "time_saved": "Time reclaimed",
      "times": "{{count}} times",
      "minutes": "{{count}} min"
    },
    "streak": "{{count}} day streak!"
  },
  "statistics": {
    "title": "Statistics",
    "tabs": {
      "today": "Today",
      "week": "Week",
      "month": "Month"
    },
    "time_saved": "Time Reclaimed",
    "interventions": "Interventions",
    "success_rate": "Success Rate"
  },
  "settings": {
    "title": "Settings",
    "sections": {
      "shield": "Shield Settings",
      "message": "Messages",
      "account": "Account",
      "other": "Other"
    }
  },
  "subscription": {
    "trial_ended": "Your 1-day trial has ended",
    "your_results": "Your results",
    "interventions": "{{count}} interventions",
    "time_saved": "{{minutes}} minutes reclaimed",
    "success_rate": "{{rate}}% success rate",
    "plans": {
      "challenge30": {
        "name": "30-Day Challenge",
        "description": "Start with 30 days"
      },
      "master90": {
        "name": "90-Day Master",
        "description": "Transform your habits in 90 days",
        "recommended": "Recommended"
      },
      "yearly": {
        "name": "Annual Plan",
        "description": "Best value"
      }
    },
    "free_option": "Continue with limited features",
    "free_limitation": "(1 intervention per day, no personalization)"
  },
  "common": {
    "next": "Next",
    "back": "Back",
    "done": "Done",
    "cancel": "Cancel",
    "save": "Save",
    "per_day": "About ${{price}}/day"
  }
}
```

### 2.5 コンポーネントでの使用

```typescript
// components/ui/Text.tsx
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import i18n from '@/lib/i18n';

interface LocalizedTextProps extends TextProps {
  i18nKey: string;
  values?: Record<string, string | number>;
}

export function LocalizedText({ i18nKey, values, ...props }: LocalizedTextProps) {
  return <RNText {...props}>{i18n.t(i18nKey, values)}</RNText>;
}

// 使用例
<LocalizedText
  i18nKey="shield.title"
  values={{ minutes: 5 }}
/>
// → "5分が経過しました" (ja) / "5 minutes have passed" (en)
```

---

## 3. 対応が必要な要素

### 3.1 アプリ内要素

| 要素 | 対応方法 | 備考 |
|------|---------|------|
| UI文言 | i18n-js | 翻訳ファイルで管理 |
| Shield文言 | i18n-js | 目的別・時間帯別に多数必要 |
| エラーメッセージ | i18n-js | |
| 日付・時刻表示 | expo-localization | 自動フォーマット |
| 数値フォーマット | expo-localization | 千単位区切りなど |

### 3.2 App Store要素

| 要素 | 対応方法 | 備考 |
|------|---------|------|
| アプリ名 | App Store Connect | 言語別に設定 |
| サブタイトル | App Store Connect | |
| 説明文 | App Store Connect | |
| キーワード | App Store Connect | |
| スクリーンショット | 言語別に作成 | 文字入りの場合 |
| プレビュー動画 | 言語別に作成 | 任意 |

### 3.3 Shield文言の多言語対応

Shield文言は行動変容の核心なので、単純翻訳ではなく文化的な調整も必要：

```
日本語: 「質の良い睡眠は、明日の自分への投資です」
         → 控えめ、間接的な表現

英語:    "Quality sleep is an investment in tomorrow's you"
         → 直接的、行動を促す表現

中国語:  "优质睡眠是对明天自己的投资"
         → 投資というビジネス的な表現が響く市場
```

---

## 4. MVP時点での対応

### 4.1 i18n設計だけ先に入れる

MVP は日本語のみだが、将来の多言語対応を容易にするため、i18n構造は最初から導入：

```typescript
// MVP時点でも i18n.t() を使用
// ハードコードしない

// NG（将来の対応が困難）
<Text>5分が経過しました</Text>

// OK（将来の対応が容易）
<Text>{i18n.t('shield.title', { minutes: 5 })}</Text>
```

### 4.2 翻訳ファイルの準備

MVP時点では `ja.json` のみ作成し、`en.json` は v1.0 で追加：

```
lib/i18n/locales/
├── ja.json    # MVP で作成
└── en.json    # v1.0 で追加（構造は ja.json と同一）
```

---

## 5. 翻訳ワークフロー

### 5.1 翻訳管理

| フェーズ | 方法 |
|---------|------|
| MVP-v1.0 | 手動翻訳（開発者 + ネイティブチェック） |
| v2.0+ | 翻訳管理サービス（Crowdin, Lokalise等）の導入検討 |

### 5.2 翻訳品質管理

1. **ネイティブチェック**: 各言語のネイティブスピーカーによるレビュー
2. **コンテキスト共有**: 翻訳者に画面コンテキストを共有
3. **一貫性確認**: 用語集（Glossary）の作成・管理

### 5.3 Shield文言の特別対応

Shield文言は行動変容の核心なので、特別な品質管理が必要：

```
1. 心理学的効果を維持する翻訳
   - 単純な直訳ではなく、意図を伝える
   - 文化的なニュアンスの調整

2. A/Bテストによる効果検証
   - 言語別に効果的な文言を特定
   - データに基づく改善

3. 専門家レビュー
   - 行動科学の知見を持つ翻訳者の起用
   - 必要に応じて文化適応
```

---

## 6. 地域別考慮事項

### 6.1 日本

- デフォルト言語
- 控えめで間接的な表現を好む傾向
- 「〜しませんか？」という提案形式

### 6.2 英語圏（米国/英国/豪州）

- 直接的で行動を促す表現
- "You" を多用した二人称表現
- 米国英語をベースに、必要に応じてローカライズ

### 6.3 中国語圏

- 簡体字（中国本土）と繁体字（台湾/香港）の両対応が必要
- ビジネス的な価値訴求が響く傾向
- SNS文化が強いため、共感ベースのメッセージも有効

### 6.4 韓国

- 敬語レベルの適切な選択（해요体 vs 합니다体）
- K-POPファンなどショート動画文化が強い

---

## 付録: 多言語対応チェックリスト

### A. MVP リリース前

- [ ] i18n-js, expo-localization の導入
- [ ] 翻訳ファイル構造の設計
- [ ] ja.json の作成（全文言）
- [ ] 全コンポーネントで i18n.t() 使用確認
- [ ] 日付・時刻フォーマットの確認

### B. v1.0（英語対応）リリース前

- [ ] en.json の作成
- [ ] ネイティブチェック完了
- [ ] App Store Connect の英語設定
- [ ] 英語スクリーンショット作成
- [ ] 英語説明文・キーワード設定

### C. v2.0+（追加言語）リリース前

- [ ] 対象言語の翻訳ファイル作成
- [ ] 翻訳管理サービスの導入検討
- [ ] 各言語のネイティブチェック
- [ ] App Store Connect の各言語設定
- [ ] 言語別スクリーンショット作成
