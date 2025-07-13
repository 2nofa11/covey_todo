import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import MultiProgressBar from './MultiProgressBar.vue'

describe('MultiProgressBar', () => {
  it('renders with basic segments', () => {
    const segments = [
      { value: 30, color: 'bg-tomato', label: 'Urgent & Important' },
      { value: 20, color: 'bg-caramel', label: 'Urgent Only' },
      { value: 35, color: 'bg-iceberg', label: 'Important Only' },
      { value: 15, color: 'bg-gray-300', label: 'Neither' },
    ]

    const { container } = render(MultiProgressBar, {
      props: { segments },
    })

    expect(container.firstChild).toBeTruthy()
  })

  it('renders with normalized segments when total exceeds 100', () => {
    const segments = [
      { value: 60, color: 'bg-tomato', label: 'Segment 1' },
      { value: 80, color: 'bg-caramel', label: 'Segment 2' },
    ]

    const { container } = render(MultiProgressBar, {
      props: { segments },
    })

    expect(container.firstChild).toBeTruthy()
  })

  it('shows labels when showLabels is true', () => {
    const segments = [
      { value: 50, color: 'bg-tomato', label: 'Test Label' },
    ]

    const { getByText } = render(MultiProgressBar, {
      props: { segments, showLabels: true },
    })

    expect(getByText('Test Label')).toBeTruthy()
  })

  it('hides labels when showLabels is false', () => {
    const segments = [
      { value: 50, color: 'bg-tomato', label: 'Test Label' },
    ]

    const { queryByText } = render(MultiProgressBar, {
      props: { segments, showLabels: false },
    })

    expect(queryByText('Test Label')).toBeFalsy()
  })

  it('handles empty segments array', () => {
    const { container } = render(MultiProgressBar, {
      props: { segments: [] },
    })

    expect(container.firstChild).toBeTruthy()
  })
})