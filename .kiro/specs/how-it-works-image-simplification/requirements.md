# Requirements Document

## Introduction

This feature involves simplifying the "How it works" section by replacing the complex Features component with a simple static image display. The current implementation uses an interactive accordion-style component with dynamic image switching, but the user wants to display just a single static image that maintains the same visual dimensions as the current component.

## Requirements

### Requirement 1

**User Story:** As a website visitor, I want to see a clear visual representation of the "How it works" process, so that I can quickly understand the steps without complex interactions.

#### Acceptance Criteria

1. WHEN the "How it works" section loads THEN the system SHALL display a single static image
2. WHEN the image is displayed THEN the system SHALL maintain the same dimensions as the current Features component (h-[350px] min-h-[200px])
3. WHEN the image is displayed THEN the system SHALL preserve the current styling (rounded corners, border, shadow, padding)

### Requirement 2

**User Story:** As a developer, I want to remove the complex Features component dependency, so that the code is simpler and more maintainable.

#### Acceptance Criteria

1. WHEN the component is refactored THEN the system SHALL remove the Features component import and usage
2. WHEN the component is refactored THEN the system SHALL remove the complex data array with multiple steps
3. WHEN the component is refactored THEN the system SHALL maintain the Section wrapper with title and subtitle

### Requirement 3

**User Story:** As a website visitor, I want the image to be properly visible and responsive, so that I can view it clearly on different screen sizes.

#### Acceptance Criteria

1. WHEN the image is displayed THEN the system SHALL ensure the image fits within the container dimensions
2. WHEN viewed on different screen sizes THEN the system SHALL maintain responsive behavior
3. WHEN the image loads THEN the system SHALL display with proper aspect ratio and object positioning