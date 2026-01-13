import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface SidePanelProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function SidePanel({ title, isOpen, onClose, children }: SidePanelProps) {
  if (!isOpen) return null

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/30">
        <h3 className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <X className="w-3 h-3 text-slate-500 hover:text-slate-300" />
        </button>
      </div>

      {/* Content */}
      <div className="p-2 flex-1">
        {children}
      </div>
    </div>
  )
}
