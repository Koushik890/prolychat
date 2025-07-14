export const SIDEBAR_ANIMATIONS = {
  slideIn: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { type: 'spring', damping: 20, stiffness: 300 }
  },
  contentFadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.1 }
  },
  staggeredItem: (index: number) => ({
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: index * 0.05, duration: 0.3 }
  }),
  buttonHover: {
    whileHover: { y: -2, transition: { duration: 0.2 } },
    whileTap: { y: -1 }
  },
  scaleOnHover: {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 }
  },
  iconRotateOnHover: {
    whileHover: { rotate: 90, transition: { duration: 0.2 } }
  }
}

export const PURPLE_THEME = {
  // Background and surfaces
  glassBackground: '!bg-white/95 !backdrop-blur-xl',
  gradientOverlay: 'bg-gradient-to-br from-purple-50/80 via-transparent to-purple-100/40',
  
  // Borders and shadows
  border: 'border-purple-200/60',
  shadow: 'shadow-[0_24px_48px_rgba(139,92,246,0.12),0_8px_16px_rgba(139,92,246,0.08)]',
  ring: 'ring-1 ring-purple-900/[0.05]',
  
  // Interactive elements
  button: {
    base: 'border-purple-200/40 bg-gradient-to-r from-purple-500/10 to-purple-600/10',
    hover: 'hover:from-purple-500/15 hover:to-purple-600/15 hover:border-purple-300/60',
    text: 'text-purple-700 hover:text-purple-800'
  },
  
  // Icon styling
  icon: {
    background: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
    border: 'border border-purple-200/40',
    text: 'text-purple-600',
    hover: 'hover:from-purple-500/15 hover:to-purple-600/15 hover:border-purple-300/60 hover:text-purple-700'
  },
  
  // Status colors
  status: {
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-purple-50 border-purple-200 text-purple-700'
  }
}

export const CLOSE_BUTTON_STYLES = {
  base: `
    absolute right-5 top-6 w-10 h-10 rounded-xl 
    flex items-center justify-center
    text-gray-500 bg-white/80 backdrop-blur-sm
    border border-white/30 transition-all duration-200
    hover:bg-white/95 hover:text-gray-700
    hover:-translate-y-0.5 hover:shadow-lg
    active:translate-y-0 z-50
  `,
  icon: 'w-5 h-5 transition-transform duration-200 group-hover:rotate-90'
}

export const HEADER_STYLES = {
  container: 'mb-8 pt-1',
  title: `
    text-2xl font-semibold 
    bg-gradient-to-r from-gray-800 to-gray-600 
    bg-clip-text text-transparent
    mb-0 tracking-tight leading-tight
  `,
  subtitle: 'text-sm text-gray-500 font-medium leading-relaxed'
} 