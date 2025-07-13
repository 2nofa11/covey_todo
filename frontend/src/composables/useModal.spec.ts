import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { useModal } from './useModal'

// テスト用のダミーコンポーネント
const DummyComponent = defineComponent({
  name: 'DummyComponent',
  template: '<div>Dummy Modal Content</div>',
})

describe('useModal', () => {
  let modal: ReturnType<typeof useModal>

  beforeEach(() => {
    modal = useModal()
    // 各テスト前に状態をリセット
    modal.close()
    vi.clearAllTimers()
    vi.useFakeTimers()
    // タイマーを進めて状態をクリア
    vi.advanceTimersByTime(250)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初期状態では非表示である', () => {
    expect(modal.state.value.isOpen).toBe(false)
    expect(modal.state.value.component).toBe(null)
  })

  it('モーダルを開くことができる', () => {
    const props = { title: 'Test Modal' }

    modal.open(DummyComponent, props)

    expect(modal.state.value.isOpen).toBe(true)
    expect(modal.state.value.component).toStrictEqual(DummyComponent)
    expect(modal.state.value.props).toEqual(props)
  })

  it('propsなしでモーダルを開くことができる', () => {
    modal.open(DummyComponent)

    expect(modal.state.value.isOpen).toBe(true)
    expect(modal.state.value.component).toStrictEqual(DummyComponent)
    expect(modal.state.value.props).toEqual({})
  })

  it('モーダルを閉じることができる', () => {
    modal.open(DummyComponent, { title: 'Test' })

    modal.close()

    expect(modal.state.value.isOpen).toBe(false)

    // タイマーを進める
    vi.advanceTimersByTime(200)

    expect(modal.state.value.component).toBe(null)
    expect(modal.state.value.props).toEqual({})
  })

  it('複数回開いても最後のコンポーネントが表示される', () => {
    const AnotherComponent = defineComponent({
      name: 'AnotherComponent',
      template: '<div>Another Modal</div>',
    })

    modal.open(DummyComponent, { title: 'First' })
    modal.open(AnotherComponent, { title: 'Second' })

    expect(modal.state.value.component).toStrictEqual(AnotherComponent)
    expect(modal.state.value.props).toEqual({ title: 'Second' })
  })

  it('タイマー完了前に再度開いた場合、コンポーネントがクリアされない', () => {
    modal.open(DummyComponent, { title: 'First' })
    modal.close()

    // タイマーが完了する前に再度開く
    vi.advanceTimersByTime(100)
    modal.open(DummyComponent, { title: 'Second' })

    // 元のタイマーが完了
    vi.advanceTimersByTime(100)

    // 新しく開いたモーダルは影響を受けない
    expect(modal.state.value.isOpen).toBe(true)
    expect(modal.state.value.component).toStrictEqual(DummyComponent)
  })

  it('状態管理が正しく動作する', () => {
    // リセット後の状態を確認
    expect(modal.state.value.isOpen).toBe(false)

    modal.open(DummyComponent)
    expect(modal.state.value.isOpen).toBe(true)
    expect(modal.state.value.component).toStrictEqual(DummyComponent)
  })
})
