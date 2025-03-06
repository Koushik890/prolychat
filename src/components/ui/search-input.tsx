'use client'

import { Input } from '@/components/ui/input'
import { LoaderCircle, Mic, Search } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  onVoiceSearch?: () => void
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  className,
  onVoiceSearch
}: SearchInputProps) {
  const id = useId()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (value) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
    setIsLoading(false)
  }, [value])

  return (
    <div className="relative w-full">
      <Input
        id={id}
        className={`peer pe-9 ps-9 ${className}`}
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-600 peer-disabled:opacity-50">
        {isLoading ? (
          <LoaderCircle
            className="animate-spin"
            size={16}
            strokeWidth={2}
            role="status"
            aria-label="Loading..."
          />
        ) : (
          <Search size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </div>
      <button
        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-gray-600 outline-offset-2 transition-colors hover:text-gray-900 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Press to speak"
        type="button"
        onClick={onVoiceSearch}
      >
        <Mic size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
