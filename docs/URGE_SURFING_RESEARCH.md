# Urge Surfing（衝動サーフィング）調査ドキュメント

## 概要

Urge Surfing（衝動サーフィング）は、1980年代にワシントン大学の依存症専門家 **Dr. Alan Marlatt** によって開発されたマインドフルネスベースのテクニックです。

元々は依存症からの回復を支援するために開発されましたが、現在では以下の分野でも活用されています：
- 摂食障害
- 気分障害
- 強迫的行動
- SNS/スマートフォン依存
- OCD（強迫性障害）

Dr. Marsha Linehan（DBT創設者）も弁証法的行動療法（DBT）にこのテクニックを導入しています。

---

## 波のメタファー（核心概念）

### 衝動は波のように振る舞う

```
衝動の強さ
    ^
    |        *** ピーク（20-30分で到達）
    |      **   **
    |    **       **
    |  **           **
    | *               **
    |*                  ***_____ 消失
    +-------------------------> 時間
    0     10    20    30分
```

**重要な洞察**：
- 衝動は海の波のように、徐々に強まり、ピークに達し、そして消えていく
- 研究によると、衝動は**20〜30分以内**にピークを迎え、その後消失する
- 衝動と戦ったり、抑え込もうとすると、むしろ強くなる
- 「波に乗る」ように観察することで、自然に収まる

### なぜ「サーフィン」なのか？

Dr. Marlattがサーファーの喫煙者にこのテクニックを説明した際、波のメタファーを使用したことに由来します。サーファーが波に乗るように、衝動の波に「乗る」ことで、溺れることなくやり過ごすことができます。

---

## 科学的根拠

### 研究結果

1. **喫煙者の研究（Dr. Marlatt）**
   - Urge Surfingを実践したグループは、意志力のみに頼ったグループの**2倍の減煙**に成功

2. **神経可塑性**
   - 繰り返しの実践により、衝動のピークが低くなり、より早く収まるようになる
   - 脳の「トリガー→行動→報酬」の回路を再構成する

3. **マインドフルネスの効果**
   - 衝動を客観的に観察することで、衝動に対する支配力が弱まる
   - 衝動と行動の間に「間」を作ることで、より熟慮された選択が可能に

---

## 実践ステップ（5ステップ）

### Step 1: 認識（Recognition）
衝動が生じていることに気づく。身体の信号（心拍数の上昇、落ち着かなさ）を認識する。

### Step 2: 受容と観察（Acceptance & Observation）
衝動を判断せずに受け入れる。「これは一時的な感覚だ」と認識する。

### Step 3: 呼吸をサーフボードとして使う（Breath as Surfboard）
深呼吸を「サーフボード」に見立て、波（衝動）の上に乗る。呼吸が安定の力となる。

### Step 4: 波が過ぎるのを待つ（Letting the Wave Pass）
衝動は必ずピークを迎え、その後消えていくことを信じて待つ。

### Step 5: 繰り返し（Repeat）
必要に応じて繰り返す。練習するほど、衝動に対する耐性が高まる。

---

## アプリでのビジュアル化の考察

### 現在のアプローチの問題点

1. **波のアニメーション + サーファー絵文字**
   - サーファーが波に「乗っている」動きを再現しようとしたが、ユーザーの意図と異なる
   - 瞑想している人は「じっとしている」べき
   - 絵文字は汎用的でオリジナリティに欠ける

2. **視覚的な不一致**
   - 🏄絵文字には青い波が含まれ、アプリのテーマカラー（テラコッタ）と競合

### 推奨アプローチ

#### オプション A: 呼吸ガイドのみ（現在の実装）
- BreathingGuideコンポーネントの同心円アニメーション
- シンプルで、瞑想的な雰囲気
- 呼吸に集中させる

#### オプション B: 波の可視化（静的または緩やかなアニメーション）
- 背景に穏やかな波のグラフィック（激しく動かない）
- ユーザーは波の「上」にいるのではなく、波を「観察」している

#### オプション C: 衝動の強度グラフ
- 時間経過とともに衝動が上がり下がることを可視化
- 「20-30分で収まる」という科学的根拠を視覚的に表現
- 現在の進捗を波形グラフで表示

#### オプション D: 呼吸 + 瞑想する人のシルエット（静止）
- 中央に静止した瞑想ポーズのシルエット
- 周囲で呼吸の同心円が拡大縮小
- シルエットは動かず、呼吸のみがアニメーション

### デザイン原則

1. **静けさを優先**: 激しいアニメーションは逆効果
2. **呼吸への集中**: 視覚的要素は呼吸ガイドを補助するべき
3. **時間の可視化**: 「あと何分で波が過ぎる」を示すと効果的
4. **科学的根拠の活用**: 20-30分で衝動が収まることを伝える

---

## 推奨される実装改善

### 短期的改善
1. 現在のBreathingGuideをそのまま使用（シンプルで効果的）
2. 「衝動は20-30分で収まります」というメッセージを追加
3. 残り時間/進捗インジケーターを明確に表示

### 中期的改善
1. 衝動の強度を記録するグラフ機能
2. 過去のセッションとの比較表示
3. 衝動が収まった回数のトラッキング

### 長期的検討
1. オーディオガイド付きの瞑想
2. カスタマイズ可能なセッション時間（30秒/1分/5分/10分）
3. 「衝動のパターン分析」機能

---

## 参考文献

- [Urge Surfing: How Riding the Wave Breaks Bad Habits - Positive Psychology](https://positivepsychology.com/urge-surfing/)
- [Urge Surfing: Distress Tolerance Skill - Therapist Aid](https://www.therapistaid.com/therapy-worksheet/urge-surfing-handout)
- [Riding the Wave: Using Mindfulness to Help Cope with Urges - Portland Psychotherapy](https://portlandpsychotherapy.com/2011/11/riding-wave-using-mindfulness-help-cope-urges/)
- [Urge Surfing - Dartmouth-Hitchcock](https://www.dartmouth-hitchcock.org/sites/default/files/2021-03/urge-surfing.pdf)
- [Urge Surfing: A 5-Step Mindfulness Tool - Mindful Institute](https://www.mindfulinstitute.org/blog/urge-surfing-5-step-cravings-tool)
- [Urge Surfing: What It Is, Benefits, & How to Practice - Choosing Therapy](https://www.choosingtherapy.com/urge-surfing/)
- [Urge Surfing Audio-Visual Guided Meditation - Reflective App](https://www.reflectiveapp.com/library-worksheets/urge-surfing-guided-meditation/)
- [UCI Susan Samueli Integrative Health Institute - Urge Surfing](https://ssihi.uci.edu/news-and-media/blog/urge-surfing-in-the-new-year-resolving-to-ride-the-waves-of-change/)

---

## 結論

Urge Surfingの本質は：
1. 衝動は波のように一時的であることを理解する
2. 戦わずに観察する
3. 呼吸をアンカーとして使う
4. 20-30分待てば自然に収まる

アプリのビジュアル化では、**派手なアニメーションよりも、静けさと呼吸への集中を促すデザイン**が適切です。
