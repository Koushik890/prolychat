# Toast Overlay Implementation

This document provides an overview of the toast notification overlay system implementation for the Automation Flow Builder.

## Features

1. **Global Overlay**
   - When a toast notification appears, an overlay dims the entire application
   - The overlay blocks interactions with the underlying UI to prevent accidental changes
   - Z-index management ensures the overlay appears above all components, including sidebars
   - Body scrolling is disabled when the overlay is active

2. **Node-Specific Overlay**
   - When an operation affects a specific node, that node shows its own overlay
   - Indicates to users which node is being affected by the current operation
   - Provides visual feedback during configuration operations

3. **Portal Compatibility**
   - Custom CSS injected into the document head to handle components rendered in portals (like Radix UI)
   - Ensures consistent z-index ordering even with portaled components like sidebars

## Implementation Details

### Toast Context

The `ToastContext` has been enhanced to:
- Track whether an overlay is currently being shown
- Store the ID of any affected node
- Accept a string nodeId in the `showToast` method's third parameter
- Automatically inject and remove global styles for portal compatibility

```typescript
interface ToastContextType {
  showToast: (type: 'loading' | 'success', message?: string, withOverlay?: boolean | string) => void
  hideToast: () => void
  isShowingOverlay: boolean
  affectedNodeId: string | null
}
```

### Toast Component

The `ToastNotification` component has been updated to:
- Create a full-screen overlay with appropriate z-index
- Use pointer-events to ensure clicks don't pass through
- Disable scrolling on the body when active
- Add smooth animations for showing/hiding

### Node Overlay Component

The new `NodeOverlay` component:
- Displays over affected nodes during configuration
- Shows a visual indication that the node is being configured
- Blocks interactions with that specific node
- Uses framer-motion for smooth animations

## How to Use

### Standard Toast with Overlay (Full Screen)

```typescript
const { showToast } = useToast()

// Show loading toast with overlay
showToast('loading', 'Saving automation...', true)

// Show success toast with overlay
showToast('success', 'Automation saved successfully', true)
```

### Node-Specific Toast

```typescript
const { showToast } = useToast()

// Pass the node ID as the third parameter
showToast('loading', 'Configuring trigger...', 'trigger-123')

// When configuration is complete
showToast('success', 'Trigger configured successfully', 'trigger-123')
```

### Within ReactFlow Nodes

```typescript
function TriggerNode({ id, data }) {
  const { affectedNodeId } = useToast()
  const isAffected = affectedNodeId === id

  return (
    <div className="relative">
      {isAffected && <NodeOverlay nodeId={id} />}
      {/* Node content */}
    </div>
  )
}
```

## Z-Index Strategy

The system uses a careful z-index strategy to ensure proper layering:

1. Base UI elements: 0-49
2. Sidebars and portals: 50-9997
3. Global overlay backdrop: 9999
4. Toast notification: 10000

This approach ensures that:
- The overlay appears above all UI elements 
- The toast is always visible on top of the overlay
- Portals (like sidebars) are properly managed through dynamic CSS injection
