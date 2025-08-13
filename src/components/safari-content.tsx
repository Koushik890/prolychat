import { SVGProps } from "react";

export interface SafariContentProps extends SVGProps<SVGSVGElement> {
  src?: string;
  width?: number;
  height?: number;
  imageY?: number;
  preserveAspectRatio?: string;
}

export default function SafariContent({
  src,
  width = 1203,
  height = 701, // Reduced from 753 to remove 52px URL bar
  imageY = 0,
  preserveAspectRatio = "xMidYMid slice",
  ...props
}: SafariContentProps) {
  // Extend viewBox upward to accommodate very large negative imageY values
  const extendedHeight = height + 200;
  const viewBoxY = -200;
  
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 ${viewBoxY} ${width} ${extendedHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#path0)">
        {/* Main content area - background stays at intended visible area */}
        <path
          d="M0 0H1202V689C1202 695.627 1196.63 701 1190 701H12C5.37258 701 0 695.627 0 689V0Z"
          className="fill-[#E5E5E5] dark:fill-[#404040]"
        />
        
        {/* Image positioned at y=imageY for custom positioning */}
        <image
          href={src}
          width="1200"
          height="700"
          x="1"
          y={imageY}
          preserveAspectRatio={preserveAspectRatio}
          clipPath="url(#roundedContent)"
        />
      </g>
      <defs>
        <clipPath id="path0">
          <rect x="0" y="-200" width={width} height={extendedHeight} fill="white" />
        </clipPath>
        <clipPath id="roundedContent">
          <path
            d="M1 -200H1201V689C1201 695.075 1196.08 700 1190 700H12C5.92486 700 1 695.075 1 689V-200Z"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
} 