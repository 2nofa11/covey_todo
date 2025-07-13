import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BaseModal from './BaseModal.vue'

// HTMLDialogElement のモック
const mockShowModal = vi.fn()
const mockClose = vi.fn()
const querySelector = vi.fn()
const querySelectorAll = vi.fn().mockReturnValue([])

// JSDOMでHTMLDialogElementが使えないため、プロトタイプをモック
beforeEach(() => {
  // HTMLDialogElement のメソッドをプロトタイプに追加
  HTMLDialogElement.prototype.showModal = mockShowModal
  HTMLDialogElement.prototype.close = mockClose
  HTMLDialogElement.prototype.querySelector = querySelector
  HTMLDialogElement.prototype.querySelectorAll = querySelectorAll

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
    expect(dialog?.classList.contains('max-w-lg')).toBe(true)
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
})