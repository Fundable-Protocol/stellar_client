import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className
}) => (
  <div className={cn("relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6", className)}>
    {children}
  </div>
)

const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-between mb-4">
    {children}
  </div>
)

const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold text-zinc-50">{children}</h2>
)

const DialogClose: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    aria-label="Close dialog"
    className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-zinc-400 hover:text-zinc-50"
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
)

const DialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-end space-x-2 mt-6">
    {children}
  </div>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter }