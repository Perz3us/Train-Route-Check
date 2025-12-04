import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Handle click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus input when opening
  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between bg-black/20 border-white/10 text-white hover:bg-white/5 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-zinc-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <div className="sticky top-0 z-10 bg-zinc-900 px-2 py-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                className="w-full rounded-md border border-white/10 bg-black/20 py-1.5 pl-8 pr-2 text-xs text-white placeholder:text-gray-500 focus:border-primary/50 focus:outline-none"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {filteredOptions.length === 0 ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
              No results found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative cursor-default select-none py-2 pl-2 pr-4 text-white hover:bg-primary/20 flex items-center justify-between",
                  value === option.value && "bg-primary/10 text-primary"
                )}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                  setSearchQuery("")
                }}
              >
                <span className="block truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
