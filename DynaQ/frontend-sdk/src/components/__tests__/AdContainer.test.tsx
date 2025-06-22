import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdContainer } from '../AdContainer'
import { ProjectProvider } from '../../context'

// Mock the useInteractionTracker hook
vi.mock('../../hooks', () => ({
  useInteractionTracker: () => ({
    trackEvent: vi.fn(),
  }),
}))

const mockProps = {
  adId: 'test-ad-123',
  headline: 'Test Headline',
  subheadline: 'Test Subheadline',
  brandName: 'Test Brand',
  buttonText: 'Learn More',
  imageUrl: 'https://example.com/test-image.jpg',
  advertiserDisclosureText: 'Advertiser Disclosure',
  advertiserDisclosureLink: 'https://example.com/disclosure',
}

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ProjectProvider initialProjectId="test-project-123">
      {component}
    </ProjectProvider>
  )
}

describe('AdContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required elements', () => {
    renderWithProvider(<AdContainer {...mockProps} />)

    expect(screen.getByText('Test Headline')).toBeInTheDocument()
    expect(screen.getByText('Test Subheadline')).toBeInTheDocument()
    expect(screen.getByText('Test Brand')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
    expect(screen.getByText('Advertiser Disclosure')).toBeInTheDocument()
  })

  it('applies background image style', () => {
    renderWithProvider(<AdContainer {...mockProps} />)
    
    const container = screen.getByText('Test Headline').closest('.ad-container')
    expect(container).toHaveStyle({
      backgroundImage: 'url(https://example.com/test-image.jpg)',
    })
  })

  it('calls onButtonClick when button is clicked', () => {
    const mockOnButtonClick = vi.fn()
    renderWithProvider(<AdContainer {...mockProps} onButtonClick={mockOnButtonClick} />)

    const button = screen.getByText('Learn More')
    fireEvent.click(button)

    expect(mockOnButtonClick).toHaveBeenCalledWith('test-ad-123')
  })

  it('renders advertiser disclosure link with correct attributes', () => {
    renderWithProvider(<AdContainer {...mockProps} />)

    const disclosureLink = screen.getByText('Advertiser Disclosure')
    expect(disclosureLink).toHaveAttribute('href', 'https://example.com/disclosure')
    expect(disclosureLink).toHaveAttribute('target', '_blank')
    expect(disclosureLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders button with SVG icon', () => {
    renderWithProvider(<AdContainer {...mockProps} />)

    const button = screen.getByText('Learn More')
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('does not call onButtonClick when not provided', () => {
    renderWithProvider(<AdContainer {...mockProps} />)

    const button = screen.getByText('Learn More')
    expect(() => fireEvent.click(button)).not.toThrow()
  })
}) 