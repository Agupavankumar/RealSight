import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProjectProvider, useProject } from '../ProjectContext'

// Test component to use the context
const TestComponent = () => {
  const { projectId, setProjectId } = useProject()
  return (
    <div>
      <span data-testid="project-id">{projectId || 'no-project'}</span>
      <button onClick={() => setProjectId('new-project')}>Set Project</button>
    </div>
  )
}

describe('ProjectContext', () => {
  it('should provide initial project ID', () => {
    render(
      <ProjectProvider initialProjectId="test-project">
        <TestComponent />
      </ProjectProvider>
    )

    expect(screen.getByTestId('project-id')).toHaveTextContent('test-project')
  })

  it('should provide null project ID when not specified', () => {
    render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    )

    expect(screen.getByTestId('project-id')).toHaveTextContent('no-project')
  })

  it('should update project ID when setProjectId is called', () => {
    render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    )

    expect(screen.getByTestId('project-id')).toHaveTextContent('no-project')
    
    fireEvent.click(screen.getByText('Set Project'))
    
    expect(screen.getByTestId('project-id')).toHaveTextContent('new-project')
  })

  it('should throw error when useProject is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useProject must be used within a ProjectProvider')

    consoleSpy.mockRestore()
  })
}) 