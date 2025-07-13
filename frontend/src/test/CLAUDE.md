# setup.ts の使い方ガイド

## 概要

`src/test/setup.ts` は、Vitestでのテスト実行時に必要なモック機能を提供するヘルパーファイルです。

## setupComponentMocks関数の使い方

### 基本的な使用方法

```typescript
import { setupComponentMocks } from '@/test/setup'

describe('コンポーネントテスト', () => {
  beforeEach(() => {
    setupComponentMocks()
  })

  // テストケース...
})
```

### setupComponentMocks が含む機能

この関数は以下のモック機能をすべて設定します：

1. **Composablesのモック** (`mockComposables()`)
   - `useKeyboardShortcuts`
   - `useTaskFilters`
   - `useTaskStats`

2. **Storesのモック** (`mockStores()`)
   - `useTodoStore`
   - `useBigRocksStore`
   - `useUIStore`

3. **Componentsのモック** (`mockComponents()`)
   - `BaseModal.vue`
   - `TaskCard.vue`

4. **Vue APIのモック** (`mockVue()`)
   - `toRef`
   - `onMounted`

5. **Typesのモック** (`mockTypes()`)
   - `QuadrantType`

6. **DOM APIsのモック** (`mockDOMAPIs()`)
   - `HTMLDialogElement` のメソッド
   - `document.activeElement`

### 個別のモック機能を使用する場合

```typescript
import { mockComponents, mockStores } from '@/test/setup'

describe('ストアのみテスト', () => {
  beforeEach(() => {
    mockStores()
  })

  // テストケース...
})
```

### DOM APIのモック値を取得する場合

```typescript
import { setupComponentMocks } from '@/test/setup'

describe('DOMイベントテスト', () => {
  let domMocks: ReturnType<typeof setupComponentMocks>

  beforeEach(() => {
    domMocks = setupComponentMocks()
  })

  it('フォーカスが正しく動作する', () => {
    // domMocks.mockFocus が使用可能
    expect(domMocks.mockFocus).toHaveBeenCalled()
  })
})
```

## 各モック機能の詳細

### useTodoStore のモック内容

- `tasks: []` - 空のタスク配列
- `addTask: vi.fn()` - タスク追加のモック関数
- `toggleCompleted: vi.fn()` - 完了状態切り替えのモック関数
- `deleteTask: vi.fn()` - タスク削除のモック関数
- `toggleImportant: vi.fn()` - 重要度切り替えのモック関数
- `toggleUrgent: vi.fn()` - 緊急度切り替えのモック関数

### useUIStore のモック内容

- 各種状態プロパティ（`currentView`, `showQuickCapture` など）
- 各種アクション関数（`switchToTodayView`, `toggleQuickCapture` など）

### BaseModal コンポーネントのモック

- シンプルな `<div><slot /></div>` テンプレート
- `modelValue`, `title`, `maxWidth` プロパティを受け取る

## 使用例

### @testing-library/vue を使用した場合

```typescript
import { render, screen } from '@testing-library/vue'
import MyComponent from '@/components/MyComponent.vue'
import { setupComponentMocks } from '@/test/setup'

describe('MyComponent', () => {
  beforeEach(() => {
    setupComponentMocks()
  })

  it('正しくレンダリングされる', () => {
    const { container } = render(MyComponent)
    expect(container.firstChild).toBeTruthy()
  })

  it('特定のテキストが表示される', () => {
    render(MyComponent)
    expect(screen.getByText('期待するテキスト')).toBeInTheDocument()
  })
})
```

### @vue/test-utils を使用した場合（従来）

```typescript
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'
import { setupComponentMocks } from '@/test/setup'

describe('MyComponent', () => {
  beforeEach(() => {
    setupComponentMocks()
  })

  it('正しくレンダリングされる', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.exists()).toBe(true)
  })
})
```

## 注意事項

- `setupComponentMocks()` は各テストケースの `beforeEach` で呼び出すことを推奨
- モック関数の呼び出し回数や引数をテストする際は、`vi.fn()` のメソッドを使用
- 実際のコンポーネントやストアの動作をテストしたい場合は、個別にモックを無効化する必要がある
- `@testing-library/vue` を使用する場合は、`@testing-library/jest-dom` が自動でインポートされる
- モックコンポーネントには `data-testid` が追加され、`screen.getByTestId()` でアクセス可能

## @testing-library/vue の特徴

- ユーザーの操作に近いテストが可能
- `screen.getByText()`, `screen.getByRole()` などのセマンティックなクエリを使用
- `toBeInTheDocument()` などの直感的なアサーションを提供
- アクセシビリティを考慮したテストの作成を促進
