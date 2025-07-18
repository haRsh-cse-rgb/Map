'use client'

import { useEffect } from 'react'

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal" style={{ display: 'block' }} onClick={handleBackdropClick}>
      {children}
    </div>
  )
}