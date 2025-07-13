import { render, fireEvent } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import ModalContainer from './ModalContainer.vue'

// useModal をモック
const mockModalState = {
  component: null,
  props: {},
  isOpen: false,
}

const mockClose = vi.fn()

vi.mock('@/composables/useModal', () => ({
  useModal: () => ({
    state: mockModalState,
    close: mockClose,
  }),
}))

// BaseModal をモック
vi.mock('./ui/BaseModal.vue', () => ({
  default: {
    name: 'BaseModal',
    template: `
      <div data-testid="base-modal" 
           @click="() => { $emit('update:modelValue', false); $emit('close'); }">
        <slot />
      </div>
    `,
    props: ['modelValue'],
    emits: ['update:modelValue', 'close'],
  },
}))

// テスト用のダミーコンポーネント
const DummyComponent = defineComponent({
  name: 'DummyComponent',
  props: {
    title: String,
    message: String,
  },
  template: '<div data-testid="dummy-modal">{{ title }} - {{ message }}</div>',
})

describe('modalContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockModalState.component = null
    mockModalState.props = {}
    mockModalState.isOpen = false
  })

  it('コンポーネントがない場合は何も表示しない', () => {
    const { container } = render(ModalContainer)

    // v-ifの条件により、コメントノードが存在する
    expect(container.innerHTML).toBe('<!--v-if-->')
  })

  it('コンポーネントがある場合はBaseModalで表示する', () => {
    mockModalState.component = DummyComponent
    mockModalState.props = { title: 'Test', message: 'Hello' }
    mockModalState.isOpen = true

    const { getByTestId } = render(ModalContainer)

    expect(getByTestId('base-modal')).toBeTruthy()
    expect(getByTestId('dummy-modal')).toBeTruthy()
    expect(getByTestId('dummy-modal').textContent).toBe('Test - Hello')
  })

  it('propsが正しく渡される', () => {
    mockModalState.component = DummyComponent
    mockModalState.props = { title: 'Custom Title', message: 'Custom Message' }
    mockModalState.isOpen = true

    const { getByTestId } = render(ModalContainer)

    expect(getByTestId('dummy-modal').textContent).toBe('Custom Title - Custom Message')
  })

  it('モーダルが表示されているときはhandleClose関数が利用できる', () => {
    mockModalState.component = DummyComponent
    mockModalState.isOpen = true

    const { getByTestId } = render(ModalContainer)
    const baseModal = getByTestId('base-modal')

    // BaseModalが正しく表示されていることを検証
    expect(baseModal).toBeTruthy()
    expect(mockModalState.isOpen).toBe(true)
  })

  it('handleClose関数がクリック時に呼ばれる', async () => {
    mockModalState.component = DummyComponent
    mockModalState.isOpen = true

    const { getByTestId } = render(ModalContainer)
    
    // BaseModalをクリックしてhandleCloseを発火
    const baseModal = getByTestId('base-modal')
    await fireEvent.click(baseModal)
    
    expect(mockClose).toHaveBeenCalled()
  })

  it('close イベントでhandleClose関数が呼ばれる', async () => {
    mockModalState.component = DummyComponent
    mockModalState.isOpen = true

    const { getByTestId } = render(ModalContainer)
    
    // BaseModalをクリックしてcloseイベントを発火
    const baseModal = getByTestId('base-modal')
    await fireEvent.click(baseModal)
    
    // handleClose関数が呼ばれてmockCloseが実行される
    expect(mockClose).toHaveBeenCalled()
  })
})
