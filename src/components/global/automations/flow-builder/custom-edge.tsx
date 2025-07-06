'use client'

import React from 'react'
import { 
  EdgeProps, 
  getBezierPath, 
  BaseEdge,
  MarkerType
} from 'reactflow'

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  // Adjust arrowhead position to touch the left edge of the placeholder node
  // The handle is positioned at left: -7px, so we add 7px to touch the node edge
  const arrowTipX = targetX + 5
  const arrowTipY = targetY
  
  // The bottom of the arrowhead is 12px to the left of the tip
  const arrowBottomX = arrowTipX - 12
  const arrowBottomY = arrowTipY
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: arrowBottomX,
    targetY: arrowBottomY,
    targetPosition,
  })

  return (
    <g>
      {/* Main connection line (ends at arrowhead bottom) */}
      <BaseEdge 
        path={edgePath} 
        style={{
          ...style,
          stroke: '#94a3b8',
          strokeWidth: 2,
          fill: 'none'
        }}
      />
      
      {/* Arrowhead always pointing right (horizontal) with tip at node edge */}
      <polygon
        points={`${arrowTipX},${arrowTipY} ${arrowTipX - 12},${arrowTipY - 6} ${arrowTipX - 12},${arrowTipY + 6}`}
        fill="#94a3b8"
        stroke="#94a3b8"
        strokeWidth="1"
      />
    </g>
  )
}

export const customEdgeTypes = {
  custom: CustomEdge,
} 