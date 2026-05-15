# 基本設計書 — ローグライクダンジョンゲーム

## 1. システム構成

```
┌─────────────────────────────────────────────┐
│                 index.html                   │
│  ┌───────────────────────────────────────┐  │
│  │          main.ts (エントリポイント)    │  │
│  │  Game インスタンス生成 → 初期化 →     │  │
│  │  ループ開始                            │  │
│  └────────────┬──────────────────────────┘  │
│               │                              │
│  ┌────────────▼──────────────────────────┐  │
│  │            Game.ts                     │  │
│  │  全状態を保持、Scene の管理・切り替え │  │
│  │  StateMachine, PlayerState を内包     │  │
│  └────────────┬──────────────────────────┘  │
│               │                              │
│  ┌────────────┼──────────┬───────────────┐  │
│  │            │          │               │  │
│  ▼            ▼          ▼               ▼  │
 │ Scene(6)    System(5)   data/     types/    │
 │ 画面表示・   ゲーム      データ     型定義    │
 │ ユーザー    ロジック    定義                │
 │ 操作受付                                    │
└─────────────────────────────────────────────┘
```

## 2. 画面遷移図（状態遷移図）

```plantuml
@startuml
[*] --> Home : 起動

Home --> Dungeon : ダンジョンへ行く
Home --> Shop : ショップへ行く

Shop --> Home : 地上に戻る

Dungeon --> Battle : モンスター遭遇
Dungeon --> Dungeon : 次の階層へ移動
Dungeon --> Home : 脱出（アイテム・金消失）

Battle --> Dungeon : 勝利
Battle --> Dungeon : 逃走成功
Battle --> LevelUp : レベルアップ発生
Battle --> Result : 敗北（力尽き）

LevelUp --> Dungeon : 前回ダンジョンから
LevelUp --> Home : 前回ホームから

Dungeon --> Result : 10階層クリア
Dungeon --> Home : 帰還ポータル使用

Result --> Home : タイトルに戻る

state Home {
  [*] --> HomeMain
  HomeMain : [休息] / [ショップ] / [ダンジョン]
}

state Dungeon {
  [*] --> Exploring
  Exploring : [探索する] / ランダムイベント
  Exploring --> FoundStairs : 階段発見
  FoundStairs : [探索する] / [次の階層へ]
}

state Battle {
  [*] --> BattleTurn
  BattleTurn : [攻撃] / [アイテム] / [逃走]
}
@enduml
```

## 3. クラス構成図

```plantuml
@startuml
package "core" {
  class Game {
    - stateMachine: StateMachine
    - player: PlayerState
    - eventBus: EventBus
    + start()
    + getCurrentScene(): Scene
  }

  class StateMachine {
    - currentState: SceneType
    - states: Map<SceneType, Scene>
    + transition(to: SceneType): void
    + update(): void
  }

  class EventBus {
    - listeners: Map<string, Function[]>
    + on(event: string, fn: Function): void
    + emit(event: string, data?: any): void
    + off(event: string, fn: Function): void
  }
}

package "scenes" {
  interface Scene {
    + enter(context: GameContext): void
    + render(container: HTMLElement): void
    + exit(): void
  }

  class HomeScene {
    - onRest(): void
    - onGoShop(): void
    - onGoDungeon(): void
    - onShowLevelUp(): void
    - onNewGame(): void
  }

  class ShopScene {
    - items: ShopItem[]
    - onBuy(itemId: string): void
    - onBack(): void
  }

  class DungeonScene {
    - floorNumber: number
    - foundStairs: boolean
    - onExplore(): void
    - onNextFloor(): void
    - onUsePortal(): void
    - onEscape(): void
  }

  class BattleScene {
    - monster: Monster
    - logs: string[]
    - showingItemSelect: boolean
    - onAttack(): void
    - onUseItemById(itemId: string): void
    - onFlee(): void
  }

  class LevelUpScene {
    - renderStatRow(stat): void
  }

  class ResultScene {
    - isClear: boolean
    - onBackToHome(): void
  }

  Scene <|.. HomeScene
  Scene <|.. ShopScene
  Scene <|.. DungeonScene
  Scene <|.. BattleScene
  Scene <|.. LevelUpScene
  Scene <|.. ResultScene
}

package "systems" {
  class PlayerSystem {
    + heal(amount: number): void
    + takeDamage(amount: number): boolean
    + addGold(amount: number): void
    + spendGold(amount: number): boolean
    + addItem(item: Item): void
    + removeItem(itemId: string): void
    + equip(item: Equippable): void
    + loseItemsOnDeath(): void
  }

  class DungeonSystem {
    + explore(floor: number): ExplorationResult
    + generateMonster(floor: number): Monster
    + rollStairs(): boolean
    + isPortalFloor(floor: number): boolean
  }

  class BattleSystem {
    + executeAttack(attacker: Actor, defender: Actor): AttackResult
    + tryFlee(): boolean
    + checkDeath(actor: Actor): boolean
  }

  class ShopSystem {
    + getAvailableItems(): ShopItem[]
    + buyItem(itemId: string, player: PlayerState): boolean
  }

  class SaveSystem {
    + save(data: SaveData): void
    + load(): SaveData | null
    + clear(): void
  }
}

package "data" {
  class ItemData {
    + id: string
    + name: string
    + type: ItemType
    + price: number
    + effect: ItemEffect
    + description: string
  }

  class MonsterData {
    + id: string
    + name: string
    + hp: number
    + attack: number
    + defense: number
    + gold: number
    + minFloor: number
    + maxFloor: number
  }

  class ShopData {
    + itemId: string
    + stock: number
    + price: number
  }
}

Game *--> StateMachine
Game *--> "1" PlayerState
Game *--> EventBus

StateMachine *--> "6" Scene

DungeonScene ..> DungeonSystem
BattleScene ..> BattleSystem
ShopScene ..> ShopSystem
HomeScene ..> PlayerSystem
Game ..> SaveSystem

PlayerSystem --> ItemData
DungeonSystem --> MonsterData
ShopSystem --> ShopData

@enduml
```

## 4. ディレクトリ構成

```
/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   └── detailed-design.md
├── src/
│   ├── main.ts
│   ├── style.css
│   ├── types/
│   │   └── index.ts
│   ├── core/
│   │   ├── Game.ts
│   │   ├── StateMachine.ts
│   │   └── EventBus.ts
│   ├── data/
│   │   ├── items.ts
│   │   ├── monsters.ts
│   │   └── shop.ts
│   ├── systems/
│   │   ├── BattleSystem.ts
│   │   ├── DungeonSystem.ts
│   │   ├── ShopSystem.ts
│   │   ├── PlayerSystem.ts
│   │   └── SaveSystem.ts
│   └── scenes/
│       ├── HomeScene.ts
│       ├── ShopScene.ts
│       ├── DungeonScene.ts
│       ├── BattleScene.ts
│       ├── LevelUpScene.ts
│       └── ResultScene.ts
```

## 5. 画面レイアウト構造

全シーン共通で以下の2領域に分割する:

```
┌──────────────────────┐
│  .content-area       │ ← flex: 1, overflow-y: auto (スクロール可能)
│  ステータス           │
│  メッセージログ       │
│  情報表示             │
│  ...                  │
├──────────────────────┤
│  .action-area         │ ← flex-shrink: 0 (下部固定)
│  [操作ボタン]         │
│  [操作ボタン]         │
└──────────────────────┘
```

- `#app` は `overflow: hidden` + `flex-direction: column`
- `content-area` がスクロールでボタンは常に画面下部に固定表示
- バトル中のアイテム選択画面も同様の構造とする

## 6. 画面レイアウト（ワイヤーフレーム）

### 地上（ホーム）
```
┌──────────────────┐
│  Lv.1 HP:20/20   │← ステータスバー
│  300G            │
│ ████████░░ EXP   │← EXPバー
│  5/20            │
│                  │
│  ◎ ダンジョン    │
│  ◎ ショップ      │
│  ◎ 休息する      │
│  ◎ ステータス    │← 未割り振りPがある場合のみ
│  [ニューゲーム]  │← 赤色
│                  │
│  武器: 木の剣    │
│  アイテム: 2個   │
└──────────────────┘
```

### ショップ
```
┌──────────────────┐
│  ショップ        │
│  所持金: 100G    │
│                  │
│  薬草    50G [買]│
│  木の剣  100G[買]│
│  皮の盾  80G [買]│
│                  │
│  [地上に戻る]    │
└──────────────────┘
```

### ダンジョン探索
```
┌──────────────────────┐
│  .content-area       │
│ ┌──────────────────┐ │
│ │ 3階層  HP:15/20  │ │← ステータスバー
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ [次の階層へ]      │ │← 階段発見時のみ上部に表示
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 階段を発見した！  │ │← メッセージ
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 攻撃:5 防御:2    │ │← 情報
│ └──────────────────┘ │
├──────────────────────┤
│  .action-area        │← 下部固定、常に3ボタン横並び
│ [探索する][ｱｲﾃﾑ][脱出]│
└──────────────────────┘
```

- **action-area**: 常に `[探索する] [アイテム] [脱出する]` の3ボタン横並び（10F時も変わらない）
- **content-area上部**: 階段発見時は「次の階層へ」、10F到達時は「帰還ポータルを使う」ボタンを表示

### バトル
```
┌──────────────────────┐
│  .content-area       │
│ ┌──────────────────┐ │
│ │ スライム  HP:5/5 │ │← モンスターバー(赤枠)
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ HP: 15/30        │ │← プレイヤーHP
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ あなたの攻撃!    │ │← ログ
│ │ 5のダメージ!     │ │
│ └──────────────────┘ │
├──────────────────────┤
│  .action-area        │← 下部固定、常に3ボタン横並び
│ [攻撃] [ｱｲﾃﾑ] [逃走] │
└──────────────────────┘
```

### アイテム選択（ダンジョン/バトル内）
```
┌──────────────────────┐
│  .content-area       │
│ ┌──────────────────┐ │
│ │ アイテム選択     │ │
│ │ 小回復薬   [使う]│ │
│ │ 全回復薬   [使う]│ │
│ │ 忘却の薬   [使う]│ │
│ └──────────────────┘ │
├──────────────────────┤
│  .action-area        │
│      [戻る]          │
└──────────────────────┘
```

### レベルアップ画面
```
┌──────────────────┐
│  レベルアップ!   │
│  Lv.1   残りP: 3 │
│                  │
│  体力     [＋]   │
│  攻撃力   [＋]   │
│  素早さ   [＋]   │
│  魔力     [＋]   │
│                  │
│    [決定]        │
└──────────────────┘
```

### リザルト
```
┌──────────────────┐
│                  │
│   ゲームクリア!  │
│   or             │
│   力尽きました   │
│                  │
│  獲得Gold: 200   │
│  到達階層: 10F   │
│                  │
│  [タイトルに戻る]│
│                  │
└──────────────────┘
```
