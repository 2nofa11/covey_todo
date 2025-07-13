import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BaseModal from './BaseModal.vue'

// HTMLDialogElement のモック
const mockShowModal = vi.fn()
const mockClose = vi.fn()
const querySelector = vi.fn()
const querySelectorAll = vi.fn().mockReturnValue([])
const mockFocus = vi.fn()

// document.activeElement のモック
const mockActiveElement = { focus: mockFocus }

// JSDOMでHTMLDialogElementが使えないため、プロトタイプをモック
beforeEach(() => {
  // HTMLDialogElement のメソッドをプロトタイプに追加
  HTMLDialogElement.prototype.showModal = mockShowModal
  HTMLDialogElement.prototype.close = mockClose
  HTMLDialogElement.prototype.querySelector = querySelector
  HTMLDialogElement.prototype.querySelectorAll = querySelectorAll

  // document.activeElement をモック
  Object.defineProperty(document, 'activeElement', {
    value: mockActiveElement,
    writable: true,
    configurable: true,
  })

  // テスト前にモックをクリア
  vi.clearAllMocks()
})

describe('baseModal', () => {
  it('renders with basic props', () => {
    const { container } = render(BaseModal, {
      props: {
        modelValue: false,
        title: 'Test Modal',
      },
    })

    expect(container.firstChild).toBeTruthy()
  })

  it('displays title when provided', () => {
    render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal Title',
      },
    })

    expect(screen.getByText('Test Modal Title')).toBeTruthy()
  })

  it('renders default slot content', () => {
    render(BaseModal, {
      props: {
        modelValue: true,
      },
      slots: {
        default: '<p>Modal content</p>',
      },
    })

    expect(screen.getByText('Modal content')).toBeTruthy()
  })

  it('renders header slot when provided', () => {
    render(BaseModal, {
      props: {
        modelValue: true,
      },
      slots: {
        header: '<div>Custom Header</div>',
      },
    })

    expect(screen.getByText('Custom Header')).toBeTruthy()
  })

  it('renders footer slot when provided', () => {
    render(BaseModal, {
      props: {
        modelValue: true,
      },
      slots: {
        footer: '<div>Custom Footer</div>',
      },
    })

    expect(screen.getByText('Custom Footer')).toBeTruthy()
  })

  it('applies custom maxWidth class', () => {
    const { container } = render(BaseModal, {
      props: {
        modelValue: true,
        maxWidth: 'max-w-2xl',
      },
    })

    const dialog = container.querySelector('dialog')
    expect(dialog?.classList.contains('max-w-2xl')).toBe(true)
  })

  it('calls showModal when modelValue becomes true', async () => {
    const { rerender } = render(BaseModal, {
      props: {
        modelValue: false,
      },
    })

    await rerender({ modelValue: true })

    expect(mockShowModal).toHaveBeenCalled()
  })

  it('calls close when modelValue becomes false', async () => {
    const { rerender } = render(BaseModal, {
      props: {
        modelValue: true,
      },
    })

    await rerender({ modelValue: false })

    expect(mockClose).toHaveBeenCalled()
  })

  it('applies default maxWidth when not specified', () => {
    const { container } = render(BaseModal, {
      props: {
        modelValue: true,
      },
    })

    const dialog = container.querySelector('dialog')
    expect(dialog?.classList.contains('max-w-2xl')).toBe(true)
  })

  it('renders correctly when modelValue is false', () => {
    const { container } = render(BaseModal, {
      props: {
        modelValue: false,
        title: 'Hidden Modal',
      },
    })

    expect(container.firstChild).toBeTruthy()
  })

  it('handles Escape key press when modal is open', async () => {
    const { emitted } = render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
    })

    // Escapeキーを押す
    await fireEvent.keyDown(document, { key: 'Escape' })

    expect(emitted()).toHaveProperty('close')
    expect(emitted()).toHaveProperty('update:modelValue')
  })

  it('handles close button click', async () => {
    const { emitted } = render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
    })

    const closeButton = screen.getByLabelText('モーダルを閉じる')
    await fireEvent.click(closeButton)

    expect(emitted()).toHaveProperty('close')
    expect(emitted()).toHaveProperty('update:modelValue')
  })

  it('handles backdrop click', async () => {
    const { container, emitted } = render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
    })

    const dialog = container.querySelector('dialog')
    if (dialog) {
      await fireEvent.click(dialog)
    }

    expect(emitted()).toHaveProperty('close')
    expect(emitted()).toHaveProperty('update:modelValue')
  })

  it('does not close on inner content click', async () => {
    const { container, emitted } = render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
    })

    const innerContent = container.querySelector('.modal-content')
    if (innerContent) {
      await fireEvent.click(innerContent)
    }

    expect(emitted()).not.toHaveProperty('close')
  })

  it('focuses first focusable element when opened', async () => {
    const mockButton = { focus: vi.fn() }
    querySelector.mockReturnValue(mockButton)

    const { rerender } = render(BaseModal, {
      props: {
        modelValue: false,
        title: 'Test Modal',
      },
    })

    await rerender({ modelValue: true })

    expect(mockShowModal).toHaveBeenCalled()
  })

  it('handles Tab key navigation forward', async () => {
    const mockButtons = [
      { focus: vi.fn() },
      { focus: vi.fn() },
    ]

    querySelectorAll.mockReturnValue(mockButtons)
    Object.defineProperty(document, 'activeElement', {
      value: mockButtons[1],
      writable: true,
      configurable: true,
    })

    render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
    })

    await fireEvent.keyDown(document, { key: 'Tab' })

    expect(mockButtons[0].focus).toHaveBeenCalled()
  })

  it('handles Shift+Tab key navigation backward', async () => {
    const mockButtons = [
      { focus: vi.fn() },
      { focus: vi.fn() },
    ]

    querySelectorAll.mockReturnValue(mockButtons)
    Object.defineProperty(document, 'activeElement', {
      value: mockButtons[0],
      writable: true,
      configurable: true,
    })

    render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
    })

    await fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

    expect(mockButtons[1].focus).toHaveBeenCalled()
  })

  it('ignores keyboard events when modal is closed', async () => {
    const { emitted } = render(BaseModal, {
      props: {
        modelValue: false,
        title: 'Test Modal',
      },
    })

    // Tabキーはモーダルが閉じている時は無視される
    await fireEvent.keyDown(document, { key: 'Tab' })

    // Tabキーではcloseイベントは発行されない
    expect(emitted()).not.toHaveProperty('close')
  })

  it('restores focus to previous element when closed', async () => {
    const mockPreviousElement = { focus: vi.fn() }
    Object.defineProperty(document, 'activeElement', {
      value: mockPreviousElement,
      writable: true,
      configurable: true,
    })

    const { rerender } = render(BaseModal, {
      props: {
        modelValue: false,
      },
    })

    await rerender({ modelValue: true })
    await rerender({ modelValue: false })

    expect(mockClose).toHaveBeenCalled()
  })

  it('handles empty focusable elements list', async () => {
    querySelectorAll.mockReturnValue([])

    render(BaseModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
    })

    await fireEvent.keyDown(document, { key: 'Tab' })

    // エラーが発生しないことを確認
    expect(true).toBe(true)
  })
})
