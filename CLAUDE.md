# Covey Todo - プロジェクト概要とガイド

## プロジェクト概要

このプロジェクトは、Stephen R. Coveyの「7つの習慣」で紹介された重要度・緊急度マトリックスをベースにした、時間管理アプリケーションです。

## 技術スタック

- **フロントエンド**: Vue 3 + TypeScript
- **CSS**: Tailwind CSS v4
- **状態管理**: Pinia + Pinia Colada
- **ビルドツール**: Vite
- **テスト**: Vitest + @testing-library/vue
- **リント**: ESLint (@antfu/eslint-config)
- **データ保存**: LocalStorage (VueUseのuseLocalStorage使用)
- **ユーティリティ**: VueUse

## アプリケーション構造

### 📁 ファイル構成
```
covey_todo/
├── frontend/                    # Vue.js アプリケーション
│   ├── src/
│   │   ├── App.vue             # ルートコンポーネント
│   │   ├── main.ts            # エントリーポイント
│   │   ├── components/
│   │   │   └── ui/            # UIコンポーネント
│   │   │       ├── BaseModal.vue
│   │   │       └── TaskCard.vue
│   │   ├── pages/
│   │   │   └── Home.vue       # メインページ
│   │   ├── stores/            # Piniaストア
│   │   │   ├── useTodoStore.ts
│   │   │   ├── useBigRocksStore.ts
│   │   │   └── useUIStore.ts
│   │   ├── composables/       # コンポーザブル関数
│   │   │   ├── useKeyboardShortcuts.ts
│   │   │   ├── useTaskFilters.ts
│   │   │   └── useTaskStats.ts
│   │   ├── types/
│   │   │   └── index.ts       # 型定義
│   │   └── test/
│   │       └── setup.ts       # テストセットアップ
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── CLAUDE.md              # フロントエンド専用ガイド
├── docs/
│   └── require.md             # 要件定義書
└── CLAUDE.md                  # このファイル
```

### 🎨 カラーパレット（Retro Girl）
- **Tomato**: #F86247 - 緊急・重要タスク
- **Bisque**: #FFE7C6 - 背景色
- **Caramel**: #F6D19A - 緊急のみタスク
- **Iceberg**: #74B8CE - 重要のみタスク


---

このアプリケーションは、日本のビジネスパーソンが効率的にタスクを管理し、重要な事項に集中できるよう設計された、実用的で使いやすいプロダクティビティツールです。