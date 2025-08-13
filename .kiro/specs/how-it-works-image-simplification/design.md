# Design Document

## Overview

The design involves simplifying the "How it works" section by replacing the complex interactive Features component with a straightforward static image display. This change will improve performance, reduce complexity, and provide a cleaner user experience while maintaining the visual impact of the section.

## Architecture

### Current Architecture
- `how-it-works.tsx` imports and uses `Features` component
- `Features` component handles complex state management, animations, and interactive behavior
- Data is passed as an array with multiple steps, each containing title, content, image, and icon

### New Architecture
- `how-it-works.tsx` will directly render a static image
- Remove dependency on `Features` component
- Simplify data structure to use a single image source
- Maintain the `Section` wrapper for consistent layout

## Components and Interfaces

### Modified Component: `how-it-works.tsx`

```typescript
interface HowItWorksProps {
  // No props needed for simplified version
}

// Component will render:
// - Section wrapper with title and subtitle
// - Static image with proper dimensions and styling
// - Responsive behavior for different screen sizes
```

### Removed Dependencies
- `Features` component import
- Complex data array structure
- Lucide React icons (Upload, Zap, Sparkles)

## Data Models

### Current Data Structure (to be removed)
```typescript
const data = [
  {
    id: number,
    title: string,
    content: string,
    image: string,
    icon: ReactNode
  }
]
```

### New Data Structure
```typescript
const imageSource = "/path-to-single-image.png"
```

## Error Handling

### Image Loading
- Implement proper alt text for accessibility
- Handle image loading states gracefully
- Provide fallback styling if image fails to load

### Responsive Behavior
- Ensure image scales properly on different screen sizes
- Maintain aspect ratio across devices
- Handle edge cases for very small or large screens

## Testing Strategy

### Visual Testing
- Verify image displays with correct dimensions (h-[350px] min-h-[200px])
- Confirm styling matches previous component (rounded corners, border, shadow, padding)
- Test responsive behavior across different screen sizes

### Performance Testing
- Measure loading time improvement after removing complex component
- Verify image optimization and loading performance

### Accessibility Testing
- Ensure proper alt text is provided
- Verify keyboard navigation still works for the section
- Test screen reader compatibility

## Implementation Details

### Styling Approach
- Reuse existing Tailwind classes from the Features component
- Apply classes: `h-[350px] min-h-[200px] w-auto rounded-xl border border-neutral-300/50 object-cover object-left-top p-1 shadow-lg`
- Maintain responsive container structure

### Image Selection
- Use the existing image from the data array (likely the main visual that represents the process)
- Ensure image dimensions are appropriate for the container
- Optimize image for web performance

### Layout Structure
```jsx
<Section title="How it works" subtitle="Just 3 steps to get started">
  <div className="container">
    <div className="max-w-6xl mx-auto">
      <div className="mx-auto my-12 flex justify-center">
        <img
          src="/image-source.png"
          alt="How it works process"
          className="h-[350px] min-h-[200px] w-auto rounded-xl border border-neutral-300/50 object-cover object-left-top p-1 shadow-lg"
        />
      </div>
    </div>
  </div>
</Section>
```

## Design Decisions

### Single Image Choice
- **Decision**: Display one representative image instead of multiple step images
- **Rationale**: Simplifies user experience and reduces cognitive load
- **Alternative**: Could have created a static grid of images, but single image is cleaner

### Maintain Existing Styling
- **Decision**: Keep the same visual styling as the Features component
- **Rationale**: Ensures visual consistency with the rest of the site
- **Implementation**: Reuse exact Tailwind classes from the original component

### Remove Interactive Elements
- **Decision**: Remove all interactive accordion and animation features
- **Rationale**: User specifically requested simplification and static display
- **Impact**: Reduces bundle size and improves performance