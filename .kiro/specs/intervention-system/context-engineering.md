# AIチャットボット コンテキストエンジニアリング設計

作成日: 2026-01-01

## 参考資料

- [Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- [Manus: Context Engineering for AI Agents](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)

---

## 1. 設計原則

### 1.1 Manusからの教訓（ローカルLLM向けに適用）

| 原則 | クラウドAPI | ローカルLLM (Gemma 3n) | StopShortsでの適用 |
|------|-------------|----------------------|-------------------|
| KVキャッシュ最適化 | 10倍のコスト差 | 推論速度に直結 | 安定したプレフィックス構造を維持 |
| Append-Only | キャッシュ無効化防止 | 同様に重要 | 履歴は追加のみ、削除・編集しない |
| ツール定義の固定 | キャッシュ一貫性 | N/A（ツールなし） | システムプロンプトを固定 |
| ファイルシステム活用 | 無限コンテキスト | ストレージ活用 | 長期記憶はAsyncStorageに保存 |

### 1.2 3層メモリアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Context Window (~4K tokens)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ System Prompt (固定)                     ~500 tokens │    │
│  │ ├─ ペルソナ定義                                      │    │
│  │ ├─ 行動ガイドライン                                  │    │
│  │ └─ 応答フォーマット                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ User Context (セッション開始時に構築)    ~300 tokens │    │
│  │ ├─ 統計サマリー（今日/週間）                         │    │
│  │ ├─ 目標・動機                                        │    │
│  │ └─ トレーニング進捗                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Long-term Memory Summary (圧縮済み)      ~200 tokens │    │
│  │ └─ 過去の重要な洞察・決定事項                        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Conversation History (直近)             ~2500 tokens │    │
│  │ ├─ Message 1 (AI)                                    │    │
│  │ ├─ Message 2 (User)                                  │    │
│  │ ├─ ...                                               │    │
│  │ └─ Message N (直近)                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Current User Input                       ~100 tokens │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. メモリシステム設計

### 2.1 短期メモリ（Working Memory）

**保存場所**: React State (useAIStore)
**寿命**: セッション中のみ
**用途**: 現在の会話ターン

```typescript
interface WorkingMemory {
  currentSessionId: string;
  messages: Message[];
  tokenCount: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokenEstimate: number;
}
```

### 2.2 中期メモリ（Session Memory）

**保存場所**: AsyncStorage
**寿命**: セッション終了後も保持、N件まで
**用途**: 過去セッションの要約

```typescript
interface SessionSummary {
  sessionId: string;
  date: string;
  // 会話の要約（AIが生成）
  summary: string;
  // 重要な洞察
  insights: string[];
  // 作成されたIf-Thenプラン
  createdPlans?: IfThenPlan[];
  // セッション統計
  messageCount: number;
  durationMinutes: number;
}

// 最大10セッション保持、古いものから削除
const MAX_SESSION_SUMMARIES = 10;
```

### 2.3 長期メモリ（Persistent Memory）

**保存場所**: AsyncStorage
**寿命**: 永続（アプリ削除まで）
**用途**: ユーザープロファイル、重要な決定事項

```typescript
interface LongTermMemory {
  // バージョン（マイグレーション用）
  version: number;

  // ユーザーの洞察（AIが発見・ユーザーが確認）
  confirmedInsights: Insight[];

  // 作成したプラン履歴
  plans: IfThenPlan[];

  // トリガーパターン（何が開きたくさせるか）
  identifiedTriggers: Trigger[];

  // 効果的だった対処法
  effectiveStrategies: Strategy[];
}

interface Insight {
  id: string;
  content: string;        // 「退屈な時に開きやすい」
  confidence: number;     // 0-1
  confirmedByUser: boolean;
  createdAt: string;
  lastReferencedAt: string;
}

interface Trigger {
  id: string;
  trigger: string;        // 「電車での移動中」
  frequency: number;      // 発生頻度
  discoveredAt: string;
}

// 長期メモリの上限設定
const LONG_TERM_LIMITS = {
  maxInsights: 50,      // 古いものは confidence で削除
  maxPlans: 30,         // 完了/無効なものは削除
  maxTriggers: 20,      // 頻度の低いものをマージ
  maxStrategies: 20,    // 効果の低いものを削除
};

// 上限超過時のプルーニング関数
async function pruneLongTermMemory(memory: LongTermMemory): Promise<LongTermMemory> {
  return {
    version: memory.version,
    confirmedInsights: memory.confirmedInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, LONG_TERM_LIMITS.maxInsights),
    plans: memory.plans
      .filter(p => p.status === 'active')
      .slice(0, LONG_TERM_LIMITS.maxPlans),
    identifiedTriggers: memory.identifiedTriggers
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, LONG_TERM_LIMITS.maxTriggers),
    effectiveStrategies: memory.effectiveStrategies
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, LONG_TERM_LIMITS.maxStrategies),
  };
}
```

---

## 3. コンテキスト構築

### 3.1 システムプロンプト（固定）

**重要**: KVキャッシュ効率のため、動的要素を含めない

```typescript
// 固定部分（キャッシュされる）
const SYSTEM_PROMPT_BASE = `あなたはStopShortsアプリのAIアシスタントです。

## 役割
ユーザーがショート動画（TikTok, YouTube Shorts, Instagram Reels）の
使用を減らす手助けをします。

## ガイドライン
- 共感的に傾聴する
- 責めない、批判しない
- 小さな進歩も認める
- 具体的な行動を提案する
- 統計データを参照して励ます

## 応答スタイル
- 短く、会話的に（1-3文）
- 絵文字は控えめに
- 質問で深掘りする

## 境界
- 医療アドバイスはしない
- 危機的状況では専門家を勧める
`;

// ペルソナ部分（選択に応じて切り替え）
const PERSONAS = {
  supportive: `
## あなたのトーン: 励まし型
- 温かく、サポーティブ
- 小さな成功も大きく称える
- 「すごいね！」「頑張ってるね！」を使う
`,
  direct: `
## あなたのトーン: ストレート型
- 率直に、正直に
- 事実をそのまま伝える
- 甘やかさないが、攻撃的にもならない
`,
};
```

### 3.2 ユーザーコンテキスト（セッション開始時に構築）

```typescript
function buildUserContext(
  stats: UserStats,
  goals: UserGoals,
  training: TrainingProgress,
  longTermMemory: LongTermMemory
): string {
  // 統計は相対的な表現で（キャッシュ効率のため具体的数値は最後に）
  return `
## ユーザー情報
- 目標: ${goals.primary}（${goals.purpose}）
- 今日の状況: ${describeToday(stats)}
- 週間トレンド: ${stats.weeklyTrend}

## 学習済み
${training.completedTopics.map(t => `- ${t}`).join('\n')}

## 過去の洞察
${longTermMemory.confirmedInsights.slice(-3).map(i => `- ${i.content}`).join('\n')}

## 今日の統計
開こうとした回数: ${stats.todayOpens}
ブロック成功: ${stats.todayBlocked}
成功率: ${Math.round(stats.todayBlocked / stats.todayOpens * 100)}%
`;
}
```

### 3.3 会話履歴の管理

**Append-Only原則**: 一度追加したメッセージは編集・削除しない

```typescript
class ConversationManager {
  private messages: Message[] = [];
  private readonly MAX_TOKENS = 2500;

  addMessage(message: Message): void {
    // Append-Only: 常に末尾に追加
    this.messages.push(message);

    // トークン上限を超えた場合、古いものから圧縮
    if (this.getTotalTokens() > this.MAX_TOKENS) {
      this.compressOldMessages();
    }
  }

  private compressOldMessages(): void {
    // 最初の5メッセージを要約に置き換え
    const toCompress = this.messages.slice(0, 5);
    const summary = this.summarizeMessages(toCompress);

    // 要約を1つのシステムメッセージとして挿入
    const summaryMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: `[以前の会話の要約: ${summary}]`,
      timestamp: Date.now(),
      tokenEstimate: estimateTokens(summary),
    };

    // 圧縮後の配列を構築（古いものを要約で置換）
    this.messages = [summaryMessage, ...this.messages.slice(5)];
  }
}
```

---

## 4. セッション管理

### 4.1 セッションライフサイクル

```
[セッション開始]
       │
       ▼
┌─────────────────────────────────────────┐
│ 1. コンテキスト初期化                    │
│    ├─ システムプロンプト（キャッシュ済み）│
│    ├─ ユーザーコンテキスト構築            │
│    ├─ 長期記憶サマリー読み込み            │
│    └─ 前回セッション要約（あれば）        │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 2. 会話ループ                            │
│    ├─ ユーザー入力を追加                  │
│    ├─ LLM推論                            │
│    ├─ 応答を追加                          │
│    └─ トークン上限チェック → 必要なら圧縮 │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 3. セッション終了                         │
│    ├─ 会話を要約（LLMに依頼）             │
│    ├─ 洞察を抽出                          │
│    ├─ SessionSummaryを保存               │
│    └─ 長期記憶を更新（確認済み洞察）      │
└─────────────────────────────────────────┘
```

### 4.2 セッション終了検知

```typescript
// セッション終了を検知するトリガー
enum SessionEndTrigger {
  USER_EXPLICIT = 'user_explicit',      // ユーザーが明示的に終了
  APP_BACKGROUND = 'app_background',    // アプリがバックグラウンドへ
  INACTIVITY_TIMEOUT = 'inactivity',    // 5分間操作なし
  NAVIGATION_AWAY = 'navigation_away',  // 別タブへ移動
}

interface SessionEndHandler {
  trigger: SessionEndTrigger;
  handler: () => Promise<void>;
}

// AppStateリスナーでバックグラウンド検知
import { AppState, AppStateStatus } from 'react-native';

function setupSessionEndDetection(onSessionEnd: () => Promise<void>): () => void {
  let inactivityTimer: NodeJS.Timeout | null = null;

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      // バックグラウンドに移行 → セッション終了処理
      onSessionEnd();
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      onSessionEnd();
    }, 5 * 60 * 1000); // 5分
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove();
    if (inactivityTimer) clearTimeout(inactivityTimer);
  };
}
```

### 4.3 自動保存メカニズム（中断対応）

```typescript
// 中断に備えた自動保存
const AUTO_SAVE_INTERVAL = 30 * 1000; // 30秒ごと

interface AutoSaveState {
  sessionId: string;
  messages: Message[];
  lastSavedAt: number;
  isDirty: boolean;
}

class AutoSaveManager {
  private state: AutoSaveState;
  private intervalId: NodeJS.Timeout | null = null;

  start(sessionId: string): void {
    this.state = {
      sessionId,
      messages: [],
      lastSavedAt: Date.now(),
      isDirty: false,
    };

    // 定期保存
    this.intervalId = setInterval(() => {
      if (this.state.isDirty) {
        this.saveToStorage();
      }
    }, AUTO_SAVE_INTERVAL);
  }

  addMessage(message: Message): void {
    this.state.messages.push(message);
    this.state.isDirty = true;
  }

  private async saveToStorage(): Promise<void> {
    await AsyncStorage.setItem(
      `session_autosave_${this.state.sessionId}`,
      JSON.stringify({
        messages: this.state.messages,
        savedAt: Date.now(),
      })
    );
    this.state.isDirty = false;
    this.state.lastSavedAt = Date.now();
  }

  // アプリ起動時に未完了セッションを復元
  static async recoverSession(): Promise<AutoSaveState | null> {
    const keys = await AsyncStorage.getAllKeys();
    const autoSaveKey = keys.find(k => k.startsWith('session_autosave_'));

    if (!autoSaveKey) return null;

    const saved = await AsyncStorage.getItem(autoSaveKey);
    if (!saved) return null;

    const data = JSON.parse(saved);

    // 復元後、自動保存データを削除
    await AsyncStorage.removeItem(autoSaveKey);

    return data;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

### 4.4 セッション終了時の要約生成

```typescript
async function summarizeSession(messages: Message[]): Promise<SessionSummary> {
  const prompt = `
以下の会話を要約してください。

## 出力形式
{
  "summary": "1-2文での要約",
  "insights": ["発見した洞察1", "洞察2"],
  "actionItems": ["ユーザーが決めたこと1", "決めたこと2"]
}

## 会話
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
`;

  const response = await llm.generate(prompt);
  return JSON.parse(response);
}
```

---

## 5. アプリアップデート互換性

### 5.1 スキーマバージョニング

```typescript
// 現在のスキーマバージョン
const CURRENT_SCHEMA_VERSION = 1;

interface StoredData {
  schemaVersion: number;
  longTermMemory: LongTermMemory;
  sessionSummaries: SessionSummary[];
}

// アプリ起動時にマイグレーション実行
async function migrateIfNeeded(): Promise<void> {
  const stored = await AsyncStorage.getItem('ai_memory');
  if (!stored) return;

  const data: StoredData = JSON.parse(stored);

  if (data.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migrated = runMigrations(data, data.schemaVersion, CURRENT_SCHEMA_VERSION);
    await AsyncStorage.setItem('ai_memory', JSON.stringify(migrated));
  }
}

// マイグレーション関数のレジストリ
const migrations: Record<number, (data: any) => any> = {
  // v1 → v2: 例
  1: (data) => ({
    ...data,
    schemaVersion: 2,
    longTermMemory: {
      ...data.longTermMemory,
      // 新しいフィールドを追加
      effectiveStrategies: [],
    },
  }),
};
```

### 5.2 後方互換性ガイドライン

| 変更タイプ | 対応方法 |
|-----------|---------|
| フィールド追加 | デフォルト値でマイグレーション |
| フィールド削除 | 古いデータを無視（削除しない） |
| フィールド型変更 | 変換関数でマイグレーション |
| システムプロンプト変更 | バージョン番号で分岐 |

### 5.3 システムプロンプトのバージョン管理

```typescript
// プロンプトバージョン（セマンティックバージョニング）
const PROMPT_VERSION = '1.0.0';

// 古いプロンプトとの互換性（必要な場合）
const PROMPT_VERSIONS = {
  '1.0.0': SYSTEM_PROMPT_BASE,
  // 将来のバージョン
  // '1.1.0': SYSTEM_PROMPT_V1_1,
};

// 保存された会話を再開する際、同じプロンプトバージョンを使用
function getSystemPrompt(version: string): string {
  return PROMPT_VERSIONS[version] || PROMPT_VERSIONS[PROMPT_VERSION];
}
```

---

## 6. ローカルLLM固有の考慮事項

### 6.0 Gemma 3n E2B モデル仕様（実装前確認事項）

> **注意**: 以下の項目は実装前に正式な仕様を確認する必要があります。

| 確認項目 | 確認ポイント | 備考 |
|---------|-------------|------|
| コンテキストウィンドウサイズ | 4K? 8K? | 本ドキュメントは4Kを想定 |
| JSON出力能力 | 構造化出力のサポート有無 | セッション要約で必要 |
| 日本語対応状況 | トークナイザーの日本語対応度 | トークン効率に影響 |
| ExecuTorch形式 | 変換済みモデルの入手方法 | Core MLとの互換性確認 |
| メモリフットプリント | 推論時の必要メモリ量 | デバイス対応範囲に影響 |

**確認リソース**:
- Google AI公式ドキュメント
- HuggingFace モデルカード
- ExecuTorch変換ガイド

### 6.1 トークン予算管理

```typescript
// Gemma 3n E2B のコンテキストウィンドウ
const MAX_CONTEXT_TOKENS = 4096;

// 予算配分
const TOKEN_BUDGET = {
  systemPrompt: 500,     // 固定
  userContext: 300,      // セッション開始時
  longTermSummary: 200,  // 圧縮済み
  conversationHistory: 2500,  // 動的
  currentInput: 100,     // ユーザー入力
  responseBuffer: 400,   // 応答用余白
};

// 合計: ~4000 tokens（少し余裕を持たせる）

// 日本語トークン考慮事項:
// - 日本語は英語と比較して約1.5倍のトークンを消費
// - 予算計算時には安全係数（1.5〜2.0）を適用することを推奨
// - 実際のトークン数は tokenizer で計測し、必要に応じて調整
const JAPANESE_TOKEN_SAFETY_FACTOR = 1.5;
```

### 6.2 推論最適化

```typescript
interface GenerationConfig {
  // 応答の最大長
  maxNewTokens: 256;

  // 温度（会話的なので少し高め）
  temperature: 0.7;

  // Top-p サンプリング
  topP: 0.9;

  // 繰り返しペナルティ
  repetitionPenalty: 1.1;
}
```

### 6.3 オフライン対応

```typescript
// オフラインでも動作する（ローカルLLMの利点）
// ただし、以下は確認が必要：
// - モデルがダウンロード済みか
// - 十分なメモリがあるか

async function checkAIAvailability(): Promise<{
  available: boolean;
  reason?: string;
}> {
  const modelReady = await isModelDownloaded();
  if (!modelReady) {
    return { available: false, reason: 'model_not_downloaded' };
  }

  const memoryOk = await checkAvailableMemory();
  if (!memoryOk) {
    return { available: false, reason: 'insufficient_memory' };
  }

  return { available: true };
}
```

---

## 7. データ構造サマリー

### 7.1 useAIStore (Zustand)

```typescript
interface AIStore {
  // モデル状態
  modelStatus: 'not_downloaded' | 'downloading' | 'ready' | 'error';
  downloadProgress: number;

  // 現在のセッション
  currentSession: {
    id: string;
    messages: Message[];
    startedAt: number;
  } | null;

  // 設定
  personaId: 'supportive' | 'direct';

  // アクション
  startSession: () => void;
  endSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setPersona: (id: string) => void;
}
```

### 7.2 AsyncStorage キー構造

```typescript
// キー命名規則
const STORAGE_KEYS = {
  // AIメモリ（メイン）
  AI_MEMORY: 'stopshorts_ai_memory',

  // セッション履歴
  SESSION_SUMMARIES: 'stopshorts_ai_sessions',

  // モデル状態
  MODEL_STATUS: 'stopshorts_ai_model_status',

  // 設定
  AI_SETTINGS: 'stopshorts_ai_settings',
};
```

---

## 8. 実装優先順位

### Phase 1: 基本機能
- [ ] Message型とConversationManager
- [ ] システムプロンプト（固定）
- [ ] ユーザーコンテキスト構築
- [ ] 基本的な会話ループ

### Phase 2: メモリ管理
- [ ] 会話履歴の圧縮
- [ ] セッション要約生成
- [ ] SessionSummaryの保存

### Phase 3: 長期記憶
- [ ] LongTermMemory構造
- [ ] 洞察の抽出・保存
- [ ] トリガーパターンの学習

### Phase 4: 互換性
- [ ] スキーママイグレーション
- [ ] プロンプトバージョニング
- [ ] データ復旧機能

### Phase 5: セキュリティ・堅牢性
- [ ] データ暗号化実装
- [ ] バックアップ除外設定
- [ ] エッジケース処理
- [ ] GDPR対応（データエクスポート/削除）

---

## 9. プライバシー・セキュリティ考慮事項

### 9.1 データ暗号化

AsyncStorageは平文保存のため、機密データには追加の保護が必要です。

```typescript
// オプション1: expo-secure-store を使用（推奨）
import * as SecureStore from 'expo-secure-store';

async function saveSecureData(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function getSecureData(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

// オプション2: AsyncStorage + AES暗号化
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'device-unique-key'; // デバイス固有キーを使用

function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

function decrypt(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

**機密データの分類**:
| データ種類 | 暗号化要否 | 保存先 |
|-----------|----------|--------|
| ユーザー洞察（個人的な内容） | 必須 | SecureStore |
| セッション要約 | 必須 | SecureStore |
| 統計データ（数値のみ） | 任意 | AsyncStorage |
| 設定（ペルソナ選択等） | 不要 | AsyncStorage |

### 9.2 バックアップ除外

ユーザーの個人的なデータがiCloud/Google Driveにバックアップされないよう設定します。

```typescript
// iOS: NSURLIsExcludedFromBackupKey
import * as FileSystem from 'expo-file-system';

async function excludeFromBackup(filePath: string): Promise<void> {
  if (Platform.OS === 'ios') {
    // iOS固有の除外設定
    await FileSystem.setAttributes(filePath, {
      NSURLIsExcludedFromBackupKey: true,
    });
  }
}

// Android: 特定ディレクトリの除外
// android/app/src/main/res/xml/backup_rules.xml で設定
```

**backup_rules.xml 例**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <exclude domain="sharedpref" path="ai_memory.xml"/>
    <exclude domain="database" path="ai_sessions.db"/>
</full-backup-content>
```

### 9.3 データ管理（GDPR対応）

```typescript
// ユーザーデータエクスポート
async function exportUserData(): Promise<string> {
  const allKeys = await AsyncStorage.getAllKeys();
  const aiKeys = allKeys.filter(k => k.startsWith('stopshorts_ai_'));

  const exportData: Record<string, any> = {};
  for (const key of aiKeys) {
    const value = await AsyncStorage.getItem(key);
    exportData[key] = value ? JSON.parse(value) : null;
  }

  return JSON.stringify(exportData, null, 2);
}

// ユーザーデータ完全削除
async function deleteAllUserData(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const aiKeys = allKeys.filter(k => k.startsWith('stopshorts_ai_'));

  // SecureStoreからも削除
  await SecureStore.deleteItemAsync('ai_insights');
  await SecureStore.deleteItemAsync('ai_sessions');

  // AsyncStorageから削除
  await AsyncStorage.multiRemove(aiKeys);

  // 確認ログ
  console.log(`Deleted ${aiKeys.length} AI-related keys`);
}
```

---

## 10. エッジケース処理

### 10.1 ストレージ不足

```typescript
async function checkStorageBeforeWrite(dataSize: number): Promise<boolean> {
  try {
    // 概算でストレージ使用量をチェック
    const allKeys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of allKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) totalSize += value.length;
    }

    // 6MB制限（iOS）に対して80%を警告閾値とする
    const STORAGE_LIMIT = 6 * 1024 * 1024;
    const WARNING_THRESHOLD = 0.8;

    if ((totalSize + dataSize) / STORAGE_LIMIT > WARNING_THRESHOLD) {
      // 古いセッションサマリーを削除
      await pruneOldSessionSummaries();
      return true;
    }

    return true;
  } catch (error) {
    console.error('Storage check failed:', error);
    return false;
  }
}

async function pruneOldSessionSummaries(): Promise<void> {
  const summaries = await getSessionSummaries();
  if (summaries.length > 5) {
    // 古いものを削除
    const toKeep = summaries.slice(-5);
    await saveSessionSummaries(toKeep);
  }
}
```

### 10.2 AsyncStorageクォータ超過

```typescript
async function safeAsyncStorageWrite(
  key: string,
  value: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await AsyncStorage.setItem(key, value);
    return { success: true };
  } catch (error) {
    if (error.message?.includes('quota') ||
        error.message?.includes('QUOTA_EXCEEDED')) {
      // クォータ超過時のフォールバック
      await pruneOldSessionSummaries();
      await pruneLongTermMemory(await getLongTermMemory());

      // 再試行
      try {
        await AsyncStorage.setItem(key, value);
        return { success: true };
      } catch (retryError) {
        return {
          success: false,
          error: 'ストレージ容量が不足しています。古いデータを削除してください。',
        };
      }
    }

    return { success: false, error: error.message };
  }
}
```

### 10.3 LLM推論タイムアウト

```typescript
const LLM_TIMEOUT_MS = 30000; // 30秒

async function generateWithTimeout(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const response = await llm.generate(prompt, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      // タイムアウト時のデフォルト応答
      return getDefaultResponse();
    }

    throw error;
  }
}

function getDefaultResponse(): string {
  const defaults = [
    'すみません、少し考えが詰まってしまいました。もう一度お話しいただけますか？',
    '申し訳ありません、うまく処理できませんでした。別の言い方で教えていただけますか？',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}
```

### 10.4 会話が長すぎる場合

```typescript
const MAX_COMPRESSED_TOKENS = 3000;

async function handleConversationOverflow(
  messages: Message[]
): Promise<{ continue: boolean; messages: Message[] }> {
  const compressed = await compressConversation(messages);
  const tokenCount = estimateTokens(compressed);

  if (tokenCount > MAX_COMPRESSED_TOKENS) {
    // 圧縮後もオーバー → セッション強制終了
    await endSession({
      reason: 'token_overflow',
      summary: await generateEmergencySummary(messages),
    });

    return {
      continue: false,
      messages: [],
    };
  }

  return {
    continue: true,
    messages: compressed,
  };
}

async function generateEmergencySummary(messages: Message[]): Promise<string> {
  // 最後の5メッセージだけで要約を生成
  const recentMessages = messages.slice(-5);
  return `[会話が長くなったため自動終了] 最後の話題: ${recentMessages[0]?.content.slice(0, 100)}...`;
}
```

### 10.5 JSON出力失敗（小型LLMの不安定性対応）

```typescript
interface ParseResult<T> {
  success: boolean;
  data?: T;
  fallback?: T;
  error?: string;
}

async function parseJsonResponse<T>(
  response: string,
  fallbackGenerator: () => T
): Promise<ParseResult<T>> {
  // 方法1: 直接パース
  try {
    const data = JSON.parse(response);
    return { success: true, data };
  } catch (e) {
    // 方法2: JSON部分を抽出して再試行
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        return { success: true, data };
      } catch (e2) {
        // 方法3: フォールバック
        return {
          success: false,
          fallback: fallbackGenerator(),
          error: 'JSONパースに失敗しました',
        };
      }
    }

    return {
      success: false,
      fallback: fallbackGenerator(),
      error: 'レスポンスにJSONが含まれていません',
    };
  }
}

// 使用例
const result = await parseJsonResponse<SessionSummary>(
  llmResponse,
  () => ({
    sessionId: currentSessionId,
    date: new Date().toISOString(),
    summary: '要約の生成に失敗しました',
    insights: [],
    messageCount: messages.length,
    durationMinutes: 0,
  })
);

if (!result.success) {
  console.warn('JSON parse failed, using fallback:', result.error);
}

const summary = result.data || result.fallback;
```

### 10.6 モデルダウンロード中断

```typescript
interface DownloadState {
  modelId: string;
  totalBytes: number;
  downloadedBytes: number;
  lastResumePoint: number;
  checksum: string;
}

async function resumableModelDownload(modelId: string): Promise<void> {
  // 中断状態を確認
  const savedState = await AsyncStorage.getItem(`model_download_${modelId}`);

  if (savedState) {
    const state: DownloadState = JSON.parse(savedState);

    // 既存のダウンロードを再開
    await downloadWithResume(state);
  } else {
    // 新規ダウンロード開始
    await startFreshDownload(modelId);
  }
}
```

---

## 参考リンク

- [Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- [Manus: Context Engineering for AI Agents](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- [ZenML: Manus Context Engineering Strategies](https://www.zenml.io/llmops-database/context-engineering-strategies-for-production-ai-agents)
