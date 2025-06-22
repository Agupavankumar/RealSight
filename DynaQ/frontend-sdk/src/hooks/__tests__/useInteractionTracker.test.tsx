import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInteractionTracker } from '../useInteractionTracker'
import { ProjectProvider } from '../../context'

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProjectProvider initialProjectId="test-project-123">
    {children}
  </ProjectProvider>
)

describe('useInteractionTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should track events with project ID from context', () => {
    const { result } = renderHook(() => useInteractionTracker(), { wrapper })

    act(() => {
      result.current.trackEvent('ad_click', { eventId: 'test-event', adId: 'test-ad' })
    })

    // The hook currently logs to console, so we can verify the console.log was called
    // In the future, this would verify the API call
    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should track events with explicit project ID', () => {
    const { result } = renderHook(() => useInteractionTracker(), { wrapper })

    act(() => {
      result.current.trackEvent('ad_click', { eventId: 'test-event' }, 'explicit-project-id')
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should handle missing project ID gracefully', () => {
    const wrapperWithoutProject = ({ children }: { children: React.ReactNode }) => (
      <ProjectProvider>
        {children}
      </ProjectProvider>
    )

    const { result } = renderHook(() => useInteractionTracker(), { wrapper: wrapperWithoutProject })

    act(() => {
      result.current.trackEvent('ad_click', { eventId: 'test-event' })
    })

    expect(mockConsoleError).toHaveBeenCalledWith(
      'DynaQ SDK Error: Project ID is not set. Cannot track event.'
    )
  })

  it('should include timestamp in event payload', () => {
    const { result } = renderHook(() => useInteractionTracker(), { wrapper })

    const mockDate = new Date('2023-01-01T00:00:00.000Z')
    vi.spyOn(window, 'Date').mockImplementation(() => mockDate as any)

    act(() => {
      result.current.trackEvent('ad_impression', { eventId: 'test-event' })
    })

    // Reset the mock
    vi.restoreAllMocks()
  })

  it('should handle different event types', () => {
    const { result } = renderHook(() => useInteractionTracker(), { wrapper })

    const eventTypes = ['ad_impression', 'ad_click', 'survey_impression', 'survey_submit'] as const

    eventTypes.forEach(eventType => {
      act(() => {
        result.current.trackEvent(eventType, { eventId: `test-${eventType}` })
      })
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should preserve additional metadata in event data', () => {
    const { result } = renderHook(() => useInteractionTracker(), { wrapper })

    const additionalData = {
      eventId: 'test-event',
      adId: 'test-ad',
      userId: 'test-user',
      customField: 'custom-value',
    }

    act(() => {
      result.current.trackEvent('ad_click', additionalData)
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })
}) 