'use client'

import { useState, useRef, useEffect } from 'react'

interface AutocompleteInputProps {
  placeholder: string
  icon: string
  options: { name: string; city: string }[]
  onSelect: (plant: { name: string; city: string } | null) => void
}

export default function AutocompleteInput({ placeholder, icon, options, onSelect }: AutocompleteInputProps) {
  const [value, setValue] = useState('')
  const [filteredOptions, setFilteredOptions] = useState<{ name: string; city: string }[]>([])
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toLowerCase()
    setValue(e.target.value)
    
    if (!inputValue) {
      setFilteredOptions([])
      setShowOptions(false)
      return
    }

    const filtered = options
      .filter(plant => plant.name.toLowerCase().includes(inputValue))
      .slice(0, 10)
    
    setFilteredOptions(filtered)
    setShowOptions(filtered.length > 0)
  }

  const handleOptionClick = (plant: { name: string; city: string }) => {
    setValue(plant.name)
    onSelect(plant)
    setShowOptions(false)
  }

  return (
    <div className="autocomplete">
      <i className={`fa ${icon}`}></i>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      {showOptions && (
        <ul ref={optionsRef} className="autocomplete-options">
          {filteredOptions.map((plant, index) => (
            <li key={index} onClick={() => handleOptionClick(plant)}>
              {plant.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}